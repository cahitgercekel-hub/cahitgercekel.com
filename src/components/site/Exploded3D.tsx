// Scroll-driven 3D exploded view for project pages: the model starts assembled, comes apart while the
// visitor scrolls, then highlights one part after another. Clicking a part (in the list or on the model)
// scrolls to that part.
//
// Data comes from a manifest JSON (see docs/3d-exploded-view.md) plus one binary geometry file, both in
// public/. three.js is loaded at runtime from public/vendor, so it adds nothing to the main bundle and
// is only downloaded on pages that use this section.
import { useCallback, useEffect, useRef, useState } from "react";
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

// Scroll timeline (share of the section's scroll distance)
const EXPLODE_FROM = 0.12, EXPLODE_TO = 0.38;
const SPOT_FROM = 0.4, SPOT_SPAN = 0.58;

const UI = {
  heading: { en: "Scroll to take it apart.", tr: "Parçalarına ayırmak için kaydır.", de: "Scrolle, um es zu zerlegen." },
  headingDone: { en: "Taken apart.", tr: "Parçalarına ayrılmış hali.", de: "Zerlegt." },
  hintDone: {
    en: "Pick a part from the list or on the model.",
    tr: "Listeden ya da model üzerinden bir parça seç.",
    de: "Wähle ein Teil in der Liste oder am Modell.",
  },
  hint: {
    en: "Or pick a part from the list or on the model.",
    tr: "Ya da listeden veya model üzerinden bir parça seç.",
    de: "Oder wähle ein Teil in der Liste oder am Modell.",
  },
  parts: { en: "parts", tr: "parça", de: "Teile" },
  overview: { en: "Overview", tr: "Genel bakış", de: "Übersicht" },
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
const spotOrder = (m: ExplodedManifest) =>
  (m.spotlight?.length ? m.spotlight : m.parts.map((p) => p.id)).filter((id) => m.parts.some((p) => p.id === id));

type Props = { manifestUrl: string; lang: Lang; eyebrow?: string; intro?: string; id?: string };

export default function Exploded3D({ manifestUrl, lang, eyebrow, intro, id }: Props) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const strip = useRef<HTMLOListElement>(null);
  const [manifest, setManifest] = useState<ExplodedManifest | null>(null);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  // Once the visitor has scrolled past the whole section, it collapses to one screen and stops
  // following the scroll, so scrolling back up does not play the animation again.
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const pickRef = useRef(-1); // part chosen by click while collapsed (-1 = all parts)

  const spot = manifest ? spotOrder(manifest) : [];

  // Scroll the page so that part `i` is highlighted (-1 = assembled overview).
  const goTo = useCallback((i: number, count: number) => {
    const el = wrap.current;
    if (!el || count <= 0) return;
    if (doneRef.current) { pickRef.current = i; setActive(i); return; }
    const p = i < 0 ? 0.04 : SPOT_FROM + ((i + 0.5) / count) * SPOT_SPAN;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.round(top + p * (el.offsetHeight - window.innerHeight)), behavior: "smooth" });
  }, []);

  // Collapse after the section has been scrolled past (keeps the page position steady).
  useEffect(() => {
    const check = () => {
      const el = wrap.current;
      if (!el || doneRef.current || el.getBoundingClientRect().bottom > 0) return;
      // Read the position first: once the section shrinks the browser clamps scrollY on its own.
      const before = el.offsetHeight, y0 = window.scrollY;
      doneRef.current = true;
      el.classList.add("done");
      const delta = before - el.offsetHeight;
      if (delta > 0) window.scrollTo({ top: Math.max(0, y0 - delta), behavior: "instant" as ScrollBehavior });
      pickRef.current = -1;
      setActive(-1);
      setDone(true);
      window.removeEventListener("scroll", check);
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // Keep the active chip visible in the (horizontally scrolling) list without moving the page.
  useEffect(() => {
    const list = strip.current;
    if (!list || active < 0) return;
    const item = list.children[active] as HTMLElement | undefined;
    if (!item || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    // Download three.js and the model only when the section gets close to the viewport.
    const near = new Promise<void>((resolve) => {
      const el = wrap.current;
      if (!el || !("IntersectionObserver" in window)) return resolve();
      const io0 = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io0.disconnect(); resolve(); }
      }, { rootMargin: "1200px 0px" });
      io0.observe(el);
      const stop = cleanup;
      cleanup = () => { io0.disconnect(); stop(); };
    });
    (async () => {
      try {
        await near;
        if (disposed) return;
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
          geo.computeBoundingSphere();
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setRGB(g.color[0], g.color[1], g.color[2]),
            roughness: 0.55, metalness: 0.05, transparent: true,
          });
          (byObject[g.object] ??= []).push({ mesh: new THREE.Mesh(geo, mat), mat });
        }
        const unit = new THREE.Group();
        scene.add(unit);
        const order = spotOrder(meta);
        const groups = meta.parts.map((p) => {
          const grp = new THREE.Group();
          grp.userData.spotIndex = order.indexOf(p.id);
          for (const o of p.objects) for (const m of byObject[o] ?? []) grp.add(m.mesh);
          unit.add(grp);
          const box = new THREE.Box3().setFromObject(grp);
          return { def: p, grp, mats: p.objects.flatMap((o) => byObject[o] ?? []), center: box.getCenter(new THREE.Vector3()) };
        });

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

        // Click (or tap) a part on the model to jump to it; show a pointer cursor over parts.
        const raycaster = new THREE.Raycaster();
        const ndc = new THREE.Vector2();
        const partAt = (ev: PointerEvent) => {
          const r = renderer.domElement.getBoundingClientRect();
          ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
          raycaster.setFromCamera(ndc, camera);
          for (const hit of raycaster.intersectObjects(unit.children, true)) {
            let o = hit.object;
            while (o && o.parent !== unit) o = o.parent;
            const i = o?.userData?.spotIndex;
            if (typeof i === "number" && i >= 0) return i;
          }
          return -1;
        };
        let down: { x: number; y: number } | null = null;
        const onDown = (ev: PointerEvent) => { down = { x: ev.clientX, y: ev.clientY }; };
        const onUp = (ev: PointerEvent) => {
          if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 6) { down = null; return; }
          down = null;
          const i = partAt(ev);
          if (i >= 0) goTo(i, order.length);
        };
        const onMove = (ev: PointerEvent) => {
          if (ev.pointerType !== "mouse") return;
          renderer.domElement.style.cursor = partAt(ev) >= 0 ? "pointer" : "";
        };
        renderer.domElement.addEventListener("pointerdown", onDown);
        renderer.domElement.addEventListener("pointerup", onUp);
        renderer.domElement.addEventListener("pointermove", onMove);

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const yaw0 = meta.camera?.yaw ?? 0.55, pitch0 = meta.camera?.pitch ?? 0.22;
        const v = new THREE.Vector3();
        let visible = false, frame = 0, last = -2, yawS = NaN;

        const draw = (t: number) => {
          const el = wrap.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const collapsed = doneRef.current;
          const p = collapsed ? 1 : clamp(-r.top / Math.max(1, r.height - window.innerHeight));
          const ex = collapsed ? 1 : ease(clamp((p - EXPLODE_FROM) / (EXPLODE_TO - EXPLODE_FROM)));
          const idx = collapsed
            ? pickRef.current
            : p < SPOT_FROM ? -1 : Math.min(order.length - 1, Math.floor(clamp((p - SPOT_FROM) / SPOT_SPAN) * order.length));
          const sp = collapsed ? (idx >= 0 ? (idx + 0.5) / order.length : 0.5) : clamp((p - SPOT_FROM) / SPOT_SPAN);
          if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
          const aspect = host.clientWidth / Math.max(1, host.clientHeight);
          const target = new THREE.Vector3().lerpVectors(cA, cE, ex);
          const size = new THREE.Vector3().lerpVectors(sA, sE, ex);
          const fov = (camera.fov * Math.PI) / 180;
          const hfov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
          const halfW = 0.5 * Math.hypot(size.x * 0.9, size.z * 0.55), halfH = 0.5 * size.y + 0.15 * size.z;
          const fit = 1.15 * Math.max(halfH / Math.tan(fov / 2), halfW / Math.tan(hfov / 2)) + 0.5 * size.z;
          const yawTarget = yaw0 - ex * 0.15 + (idx >= 0 ? (sp - 0.5) * 0.35 : 0) + (reduce ? 0 : Math.sin(t / 2600) * 0.04);
          yawS = Number.isNaN(yawS) ? yawTarget : yawS + (yawTarget - yawS) * 0.12; // ease camera moves (also after a click)
          const yaw = yawS;
          const pitch = pitch0 + ex * 0.08;
          camera.position.set(
            target.x + Math.sin(yaw) * Math.cos(pitch) * fit,
            target.y + Math.sin(pitch) * fit,
            target.z + Math.cos(yaw) * Math.cos(pitch) * fit,
          );
          camera.lookAt(target);
          const activeId = idx >= 0 ? order[idx] : null;
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
          if (idx !== last) { last = idx; if (!collapsed) setActive(idx); }
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
          renderer.domElement.removeEventListener("pointerdown", onDown);
          renderer.domElement.removeEventListener("pointerup", onUp);
          renderer.domElement.removeEventListener("pointermove", onMove);
          for (const list of Object.values(byObject)) for (const m of list) { m.mesh.geometry.dispose(); m.mat.dispose(); }
          renderer.dispose(); renderer.domElement.remove();
        };
      } catch (err) {
        console.error("Exploded3D", err);
        if (!disposed) setFailed(true);
      }
    })();
    return () => { disposed = true; cleanup(); };
  }, [manifestUrl, goTo]);

  const part = manifest && active >= 0 ? manifest.parts.find((p) => p.id === spot[active]) : null;
  const count = spot.length;

  return (
    <section id={id} className={`p-x3d${done ? " done" : ""}`} ref={wrap} aria-label={eyebrow || UI.heading[lang]}>
      <div className="p-x3d-sticky">
        <div className="p-x3d-head">
          {eyebrow && <div className="p-label">{eyebrow}</div>}
          <h2 className="p-title">{done ? UI.headingDone[lang] : UI.heading[lang]}</h2>
          <p className="p-x3d-hint">{done ? UI.hintDone[lang] : UI.hint[lang]}</p>
        </div>
        <div className="p-x3d-body">
          <div className="p-x3d-stage" ref={stage}>
            {failed && <p className="p-x3d-fallback">{UI.failed[lang]}</p>}
            <div className="p-x3d-pin" ref={pin} aria-hidden="true" style={{ opacity: part ? 1 : 0 }}><i /></div>
          </div>
          <aside className="p-x3d-panel">
            <div className="p-x3d-card" aria-live="polite">
              <div className="p-x3d-card-top">
                <span className="p-x3d-n">
                  {part ? `${String(active + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}` : `${count || "–"} ${UI.parts[lang]}`}
                </span>
                {part && (
                  <button type="button" className="p-x3d-reset" onClick={() => goTo(-1, count)}>{UI.overview[lang]}</button>
                )}
              </div>
              {part ? (
                <>
                  <h3>{pick(part.name, lang)}</h3>
                  {part.text && <p>{pick(part.text, lang)}</p>}
                </>
              ) : (
                <>
                  <h3>{eyebrow || UI.overview[lang]}</h3>
                  {intro && <p>{intro}</p>}
                </>
              )}
              <div className="p-x3d-progress" aria-hidden="true"><span ref={bar} /></div>
            </div>
            {manifest && (
              <ol className="p-x3d-parts" ref={strip}>
                {spot.map((id, i) => (
                  <li key={id}>
                    <button
                      type="button"
                      className={i === active ? "on" : active >= 0 && i < active ? "done" : ""}
                      aria-current={i === active ? "step" : undefined}
                      onClick={() => goTo(i, count)}
                    >
                      <span className="p-x3d-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="p-x3d-name">{pick(manifest.parts.find((p) => p.id === id)?.name, lang)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
