// Scroll-driven 3D exploded view for project pages: the model starts assembled, comes apart while the
// visitor scrolls, then highlights one part after another with a short label.
//
// Data comes from a manifest JSON (see docs/3d-exploded-view.md) plus one binary geometry file, both in
// public/. three.js is loaded at runtime from public/vendor, so it adds nothing to the main bundle and
// is only downloaded on pages that use this section.
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

type Text = Partial<Record<Lang, string>> | string;
type Part = { id: string; objects: string[]; explode: [number, number, number]; name: Text; text?: Text };
type Mesh = {
  object: string; color: [number, number, number]; vertices: number; indices: number;
  index32: boolean; pos: number; nrm: number; idx: number;
};
export type ExplodedManifest = {
  version: number;
  geometry: string;
  camera?: { fov?: number; yaw?: number; pitch?: number };
  spotlight?: string[];
  parts: Part[];
  meshes: Mesh[];
};

const THREE_URL = "/vendor/three.module.min.js";

const UI = {
  heading: { en: "Scroll to take it apart.", tr: "Parçalarına ayırmak için kaydır.", de: "Scrolle, um es zu zerlegen." },
  parts: { en: "parts", tr: "parça", de: "Teile" },
  failed: {
    en: "The 3D view is not available in this browser.",
    tr: "3D görünüm bu tarayıcıda kullanılamıyor.",
    de: "Die 3D-Ansicht ist in diesem Browser nicht verfügbar.",
  },
} as const;

const pick = (t: Text | undefined, lang: Lang) =>
  !t ? "" : typeof t === "string" ? t : t[lang] || t.en || Object.values(t)[0] || "";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);

type Props = { manifestUrl: string; lang: Lang; eyebrow?: string; intro?: string };

export default function Exploded3D({ manifestUrl, lang, eyebrow, intro }: Props) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<ExplodedManifest | null>(null);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      try {
        const manifestHref = new URL(manifestUrl, window.location.href).href;
        const meta: ExplodedManifest = await fetch(manifestHref).then((r) => {
          if (!r.ok) throw new Error(`manifest ${r.status}`);
          return r.json();
        });
        if (disposed) return;
        setManifest(meta);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [THREE, bin]: [any, ArrayBuffer] = await Promise.all([
          import(/* @vite-ignore */ THREE_URL),
          fetch(new URL(meta.geometry, manifestHref).href).then((r) => {
            if (!r.ok) throw new Error(`geometry ${r.status}`);
            return r.arrayBuffer();
          }),
        ]);
        if (disposed || !stage.current || !wrap.current) return;

        const host = stage.current;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(meta.camera?.fov ?? 30, 1, 1, 10000);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a94, 1.6));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xdde8f0, 1.0);
        scene.add(rim);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const byObject: Record<string, { mesh: any; mat: any }[]> = {};
        for (const g of meta.meshes) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(bin, g.pos, g.vertices * 3), 3));
          geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(bin, g.nrm, g.vertices * 3), 3));
          geo.setIndex(new THREE.BufferAttribute(
            g.index32 ? new Uint32Array(bin, g.idx, g.indices) : new Uint16Array(bin, g.idx, g.indices), 1));
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setRGB(g.color[0], g.color[1], g.color[2]),
            roughness: 0.55, metalness: 0.05, transparent: true,
          });
          (byObject[g.object] ??= []).push({ mesh: new THREE.Mesh(geo, mat), mat });
        }
        const unit = new THREE.Group();
        scene.add(unit);
        const groups = meta.parts.map((p) => {
          const grp = new THREE.Group();
          for (const o of p.objects) for (const m of byObject[o] ?? []) grp.add(m.mesh);
          unit.add(grp);
          const box = new THREE.Box3().setFromObject(grp);
          return { def: p, grp, mats: p.objects.flatMap((o) => byObject[o] ?? []), center: box.getCenter(new THREE.Vector3()) };
        });
        const spot = (meta.spotlight?.length ? meta.spotlight : meta.parts.map((p) => p.id))
          .filter((id) => meta.parts.some((p) => p.id === id));

        // Framing: bounding boxes of the assembled and of the fully exploded model.
        const boxA = new THREE.Box3(), boxE = new THREE.Box3();
        for (const g of groups) {
          const b = new THREE.Box3().setFromObject(g.grp);
          if (b.isEmpty()) continue;
          boxA.union(b);
          boxE.union(b.clone().translate(new THREE.Vector3(...g.def.explode)));
        }
        const cA = boxA.getCenter(new THREE.Vector3()), cE = boxE.getCenter(new THREE.Vector3());
        const sA = boxA.getSize(new THREE.Vector3()), sE = boxE.getSize(new THREE.Vector3());
        const radius = Math.max(sE.length(), 1);
        camera.near = radius / 100;
        camera.far = radius * 40;
        camera.updateProjectionMatrix();
        key.position.set(radius * 0.4, radius * 0.7, radius);
        rim.position.set(-radius, radius * 0.4, -radius * 0.6);

        const cssAccent = getComputedStyle(wrap.current).getPropertyValue("--p-accent").trim();
        const accent = new THREE.Color();
        try { accent.setStyle(cssAccent || "#0C7A61"); } catch { accent.set(0x0c7a61); }

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(1, h);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const yaw0 = meta.camera?.yaw ?? 0.55, pitch0 = meta.camera?.pitch ?? 0.22;
        const v = new THREE.Vector3();
        let visible = false, frame = 0, last = -2;

        const draw = (t: number) => {
          const el = wrap.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
          // 0–0.12 assembled, 0.12–0.38 exploding, from 0.4 one part after another
          const ex = ease(clamp((p - 0.12) / 0.26));
          const sp = clamp((p - 0.4) / 0.58);
          const idx = p < 0.4 ? -1 : Math.min(spot.length - 1, Math.floor(sp * spot.length));
          const aspect = host.clientWidth / Math.max(1, host.clientHeight);
          const target = new THREE.Vector3().lerpVectors(cA, cE, ex);
          const size = new THREE.Vector3().lerpVectors(sA, sE, ex);
          const fov = (camera.fov * Math.PI) / 180;
          const hfov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
          const halfW = 0.5 * Math.hypot(size.x * 0.9, size.z * 0.55), halfH = 0.5 * size.y + 0.15 * size.z;
          const fit = 1.2 * Math.max(halfH / Math.tan(fov / 2), halfW / Math.tan(hfov / 2)) + 0.5 * size.z;
          const yaw = yaw0 - ex * 0.15 + (idx >= 0 ? (sp - 0.5) * 0.35 : 0) + (reduce ? 0 : Math.sin(t / 2600) * 0.04);
          const pitch = pitch0 + ex * 0.08;
          camera.position.set(
            target.x + Math.sin(yaw) * Math.cos(pitch) * fit,
            target.y + Math.sin(pitch) * fit,
            target.z + Math.cos(yaw) * Math.cos(pitch) * fit,
          );
          camera.lookAt(target);
          const activeId = idx >= 0 ? spot[idx] : null;
          for (const g of groups) {
            const e = g.def.explode;
            g.grp.position.set(e[0] * ex, e[1] * ex, e[2] * ex);
            const on = !activeId || g.def.id === activeId;
            for (const m of g.mats) {
              m.mat.opacity += ((on ? 1 : 0.22) - m.mat.opacity) * 0.15;
              m.mat.depthWrite = m.mat.opacity > 0.9;
              m.mat.emissive.copy(accent).multiplyScalar(activeId && on ? 0.18 : 0);
            }
            if (g.def.id === activeId && pin.current) {
              v.copy(g.center).add(g.grp.position).project(camera);
              const x = (v.x * 0.5 + 0.5) * host.clientWidth, y = (-v.y * 0.5 + 0.5) * host.clientHeight;
              pin.current.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
            }
          }
          if (idx !== last) { last = idx; setActive(idx); }
          renderer.render(scene, camera);
        };
        const loop = () => {
          cancelAnimationFrame(frame);
          const tick = (t: number) => { draw(t); if (visible) frame = requestAnimationFrame(tick); };
          frame = requestAnimationFrame(tick);
        };
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { rootMargin: "100px" });
        io.observe(wrap.current);

        cleanup = () => {
          io.disconnect(); ro.disconnect(); cancelAnimationFrame(frame);
          for (const list of Object.values(byObject)) for (const m of list) { m.mesh.geometry.dispose(); m.mat.dispose(); }
          renderer.dispose(); renderer.domElement.remove();
        };
      } catch (err) {
        console.error("Exploded3D", err);
        if (!disposed) setFailed(true);
      }
    })();
    return () => { disposed = true; cleanup(); };
  }, [manifestUrl]);

  const spot = manifest
    ? (manifest.spotlight?.length ? manifest.spotlight : manifest.parts.map((p) => p.id))
        .filter((id) => manifest.parts.some((p) => p.id === id))
    : [];
  const part = manifest && active >= 0 ? manifest.parts.find((p) => p.id === spot[active]) : null;
  const count = manifest?.parts.length ?? 0;

  return (
    <section className="p-x3d" ref={wrap} aria-label={eyebrow || UI.heading[lang]}>
      <div className="p-x3d-sticky">
        <div className="p-inner p-x3d-head">
          {eyebrow && <div className="p-label">{eyebrow}</div>}
          <h2 className="p-title">{UI.heading[lang]}</h2>
        </div>
        <div className="p-x3d-stage" ref={stage}>
          {failed && <p className="p-x3d-fallback">{UI.failed[lang]}</p>}
          <div className="p-x3d-pin" ref={pin} aria-hidden="true" style={{ opacity: part ? 1 : 0 }}><i /></div>
        </div>
        <div className="p-inner p-x3d-foot">
          <div className="p-x3d-card" aria-live="polite">
            {part ? (
              <>
                <span className="p-x3d-n">{String(active + 1).padStart(2, "0")} / {spot.length}</span>
                <h3>{pick(part.name, lang)}</h3>
                {part.text && <p>{pick(part.text, lang)}</p>}
              </>
            ) : (
              <>
                <span className="p-x3d-n">{count > 0 ? `${count} ${UI.parts[lang]}` : "3D"}</span>
                {intro && <p>{intro}</p>}
              </>
            )}
          </div>
          {manifest && (
            <ol className="p-x3d-list">
              {spot.map((id, i) => (
                <li key={id} className={i === active ? "on" : ""}>
                  {pick(manifest.parts.find((p) => p.id === id)?.name, lang)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
