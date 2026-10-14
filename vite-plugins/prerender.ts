// Build-only prerender: after `vite build`, read the public site content from
// Supabase (read-only, publishable key) and write one static HTML file per URL
// (EN/TR/DE home + every project page) with real <head> tags, a readable
// content snapshot inside #root, and the data to seed React Query. Also writes
// sitemap.xml. React replaces the snapshot on mount (createRoot, no hydration).
// If Supabase can't be reached the build still succeeds with the plain SPA shell.
import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { mergeI18n } from "../src/lib/i18n";
import {
  SEO_LANGS, absoluteUrl, buildHomeHead, buildProjectHead, listProjectPages, localizedPath,
  plainText, translateProject, type HeadData, type SeoLang,
} from "../src/lib/seo";

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const txt = (s: unknown) => esc(plainText(s));
const LANG_NAMES: Record<SeoLang, string> = { en: "English", tr: "Türkçe", de: "Deutsch" };

function headTags(h: HeadData): string {
  const tags = [
    `<meta name="description" content="${esc(h.description)}">`,
    `<link rel="canonical" href="${esc(h.canonical)}">`,
    ...h.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}">`),
    `<meta property="og:type" content="${h.ogType}">`,
    `<meta property="og:title" content="${esc(h.title)}">`,
    `<meta property="og:description" content="${esc(h.description)}">`,
    `<meta property="og:url" content="${esc(h.canonical)}">`,
    `<meta property="og:image" content="${esc(h.ogImage)}">`,
    `<meta property="og:locale" content="${h.ogLocale}">`,
    `<meta property="og:site_name" content="Cahit Emre Gerçekel">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(h.title)}">`,
    `<meta name="twitter:description" content="${esc(h.description)}">`,
    `<meta name="twitter:image" content="${esc(h.ogImage)}">`,
    // data-rh lets react-helmet-async replace these instead of duplicating them
  ].map((t) => t.replace(/^<(meta|link) /, '<$1 data-rh="true" '));
  tags.push(`<script data-rh="true" type="application/ld+json">${JSON.stringify(h.jsonLd).replace(/</g, "\\u003c")}</script>`);
  return tags.join("\n    ");
}

function paras(value: unknown): string {
  return String(value ?? "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<p>${txt(l.replace(/^[•\-–]\s*/, ""))}</p>`)
    .join("");
}

function langNav(neutralPath: string, current: SeoLang): string {
  return `<nav aria-label="Language">${SEO_LANGS.map((l) =>
    l === current
      ? `<strong>${LANG_NAMES[l]}</strong>`
      : `<a href="${localizedPath(neutralPath, l)}" hreflang="${l}">${LANG_NAMES[l]}</a>`,
  ).join(" · ")}</nav>`;
}

function contactHtml(c: any): string {
  if (!c) return "";
  const links = (c.links ?? []).filter((l: any) => l?.href)
    .map((l: any) => `<li><a href="${esc(l.href)}">${txt(l.label || l.href)}</a></li>`).join("");
  return `<section id="contact">${c.title ? `<h2>${txt(c.title)}</h2>` : ""}${c.intro ? `<p>${txt(c.intro)}</p>` : ""}${links ? `<ul>${links}</ul>` : ""}</section>`;
}

function sectionHtml(type: string, d: any, lang: SeoLang, projectSlugs: Map<any, string>): string {
  const h2 = d.title ? `<h2>${txt(d.title)}</h2>` : "";
  switch (type) {
    case "hero": {
      const line1 = `${d.greeting || "Hello"}.`;
      const line2 = `${d.nameLine || `${d.intro || "I'm"} ${d.name || ""}`.trim()}.`;
      return `<header>${d.tag ? `<p>${txt(d.tag)}</p>` : ""}<h1>${txt(line1)} ${txt(line2)}</h1>${d.subtitle ? `<p>${txt(d.subtitle)}</p>` : ""}</header>`;
    }
    case "about":
      return `<section id="about">${h2}${(d.paragraphs ?? []).map((p: string) => paras(p)).join("")}</section>`;
    case "experience":
      return `<section>${h2}${(d.items ?? []).map((it: any) =>
        `<article><h3>${txt([it.role, it.company].filter(Boolean).join(" – "))}</h3><p>${txt([it.period, it.location].filter(Boolean).join(" · "))}</p>${paras(it.description)}</article>`,
      ).join("")}</section>`;
    case "projects":
      return `<section id="projects">${h2}${(d.items ?? []).map((it: any, i: number) => {
        const slug = projectSlugs.get(d.__raw?.[i]);
        const name = slug ? `<a href="${localizedPath(`/${slug}`, lang)}">${txt(it.title)}</a>` : txt(it.title);
        return `<article><h3>${name}</h3>${it.tag ? `<p>${txt(it.tag)}</p>` : ""}<p>${txt(it.description)}</p></article>`;
      }).join("")}</section>`;
    case "skills":
      return `<section>${h2}${(d.groups ?? []).map((g: any) =>
        `<h3>${txt(g.name)}</h3><ul>${(g.items ?? []).map((s: string) => `<li>${txt(s)}</li>`).join("")}</ul>`,
      ).join("")}</section>`;
    case "languages":
      return `<section>${h2}<ul>${(d.items ?? []).map((it: any) => `<li>${txt(it.name)} – ${txt(it.level)}</li>`).join("")}</ul></section>`;
    case "stats":
      return `<section>${h2}<ul>${(d.items ?? []).map((it: any) => `<li>${txt(it.label)}</li>`).join("")}</ul></section>`;
    case "logos":
      return `<section>${h2}<ul>${(d.items ?? []).map((it: any) => `<li>${txt(it.name)}</li>`).join("")}</ul></section>`;
    case "contact":
      return contactHtml(d);
    case "image":
      return d.src ? `<figure><img src="${esc(d.src)}" alt="${txt(d.alt)}">${d.caption ? `<figcaption>${txt(d.caption)}</figcaption>` : ""}</figure>` : "";
    case "footer":
      return d.text ? `<p>${txt(d.text)}</p>` : "";
    default:
      return "";
  }
}

function snapshot(inner: string, settings: any): string {
  const bg = settings?.theme?.bg || "#f5f3ef";
  const fg = settings?.theme?.fg || "#0e0e0e";
  return `<div class="seo-snap" style="min-height:100vh;background:${esc(bg)};color:${esc(fg)};font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6"><main style="max-width:860px;margin:0 auto;padding:96px 20px 48px">${inner}</main></div>`;
}

export default function prerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "seo-prerender",
    apply: "build",
    configResolved(c) { config = c; },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const templatePath = path.join(outDir, "index.html");
      if (!fs.existsSync(templatePath)) return;
      const template = fs.readFileSync(templatePath, "utf8");

      // 404.html: hosts like Vercel serve it with a real 404 status for unknown
      // URLs. The app still boots, so a project added after the last build
      // renders for visitors; crawlers get the 404 until the next build.
      fs.writeFileSync(
        path.join(outDir, "404.html"),
        template
          .replace(/<title>[\s\S]*?<\/title>/, () => `<title>Page not found</title>`)
          .replace(/\s*<meta data-rh="true"[^>]*>/g, "")
          .replace("<!--seo-head-->", () => `<meta name="robots" content="noindex">`),
      );

      const url = config.env.VITE_SUPABASE_URL;
      const key = config.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) { config.logger.warn("[seo-prerender] Supabase env vars missing – skipped"); return; }

      let sections: any[];
      let settings: any;
      try {
        const get = async (q: string): Promise<any> => {
          const res = await fetch(`${url}/rest/v1/${q}`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(20000),
          });
          if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
          return res.json();
        };
        sections = await get("sections?select=*&visible=eq.true&order=position.asc");
        settings = (await get("site_settings?select=*&limit=1"))[0] ?? null;
      } catch (e) {
        config.logger.warn(`[seo-prerender] could not load content, keeping SPA shell: ${e}`);
        return;
      }

      const projects = listProjectPages(sections);
      const slugByItem = new Map<any, string>(projects.map((p) => [p.item, p.slug]));
      const contact = sections.find((s) => s.type === "contact")?.data;
      const dataScript = `<script>window.__SEO_DATA__=${JSON.stringify({ sections, settings }).replace(/</g, "\\u003c")}</script>`;
      const day = (iso?: string) => (iso ? iso.slice(0, 10) : undefined);
      const latest = (dates: (string | undefined)[]) => dates.filter(Boolean).sort().pop();
      const homeLastmod = day(latest([...sections.map((s) => s.updated_at), settings?.updated_at]));

      const render = (head: HeadData, body: string) =>
        template
          // function replacers: content may contain "$" sequences
          .replace(/<html lang="[^"]*">/, () => `<html lang="${head.lang}">`)
          .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(head.title)}</title>`)
          .replace(/\s*<meta data-rh="true"[^>]*>/g, "")
          .replace("<!--seo-head-->", () => `${headTags(head)}\n    ${dataScript}`)
          .replace("<!--seo-body-->", () => snapshot(body, settings));

      const write = (urlPath: string, html: string) => {
        // "/" -> index.html; "/tr/onboard" -> tr/onboard.html + tr/onboard/index.html
        // (both, so the host can serve the URL with or without directory indexes)
        const files = urlPath === "/" ? ["index.html"] : [`${urlPath.slice(1)}.html`, `${urlPath.slice(1)}/index.html`];
        for (const f of files) {
          const full = path.join(outDir, f);
          fs.mkdirSync(path.dirname(full), { recursive: true });
          fs.writeFileSync(full, html);
        }
      };

      const sitemap: { neutral: string; lastmod?: string }[] = [{ neutral: "/", lastmod: homeLastmod }];
      for (const lang of SEO_LANGS) {
        // Home
        const homeBody = [
          langNav("/", lang),
          ...sections.map((s) => {
            const d = mergeI18n(s.data ?? {}, lang);
            return sectionHtml(s.type, s.type === "projects" ? { ...d, __raw: s.data?.items } : d, lang, slugByItem);
          }),
        ].join("\n");
        write(localizedPath("/", lang), render(buildHomeHead(lang, sections, settings), homeBody));

        // Projects
        for (const p of projects) {
          const item = translateProject(p, lang);
          const c = item.contactOverride?.enabled ? item.contactOverride : contact;
          const body = [
            langNav(`/${p.slug}`, lang),
            `<p><a href="${localizedPath("/#projects", lang)}">← ${lang === "tr" ? "Ana sayfa" : lang === "de" ? "Startseite" : "Home"}</a></p>`,
            `<article><h1>${txt(item.title)}</h1>`,
            [item.tag, item.year].filter(Boolean).map((t: string) => `<p>${txt(t)}</p>`).join(""),
            item.subtitle ? `<p>${txt(item.subtitle)}</p>` : "",
            [item.role, item.client].filter(Boolean).map((t: string) => `<p>${txt(t)}</p>`).join(""),
            (item.tech ?? []).length ? `<ul>${item.tech.map((t: string) => `<li>${txt(t)}</li>`).join("")}</ul>` : "",
            item.longDescription ? paras(String(item.longDescription)) : paras(item.description),
            (item.descriptionBlocks ?? []).map((b: any) => paras(b.text)).join(""),
            (item.metrics ?? []).length ? `<ul>${item.metrics.map((m: any) => `<li>${txt(m.value)} ${txt(m.label)}</li>`).join("")}</ul>` : "",
            item.caseStudy?.enabled ? (item.caseStudy.sections ?? []).map((s: any) => `${s.heading ? `<h2>${txt(s.heading)}</h2>` : ""}${paras(s.body)}`).join("") : "",
            [item.link ? { label: "Live", href: item.link } : null, ...(item.links ?? [])].filter((l: any) => l?.href)
              .map((l: any) => `<p><a href="${esc(l.href)}">${txt(l.label || l.href)}</a></p>`).join(""),
            `</article>`,
            contactHtml(c ? mergeI18n({ ...c }, lang) : null),
          ].join("\n");
          write(localizedPath(`/${p.slug}`, lang), render(buildProjectHead(lang, p.slug, item, settings), body));
          if (lang === "en") sitemap.push({ neutral: `/${p.slug}`, lastmod: day(p.updatedAt) });
        }
      }

      const urls = sitemap.flatMap(({ neutral, lastmod }) =>
        SEO_LANGS.map((lang) => {
          const alts = [...SEO_LANGS.map((l) => [l, absoluteUrl(localizedPath(neutral, l))]), ["x-default", absoluteUrl(neutral)]]
            .map(([hl, href]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`).join("\n");
          return `  <url>\n    <loc>${absoluteUrl(localizedPath(neutral, lang))}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}${alts}\n  </url>`;
        }),
      );
      fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
      );
      config.logger.info(`[seo-prerender] wrote ${sitemap.length * SEO_LANGS.length} pages + sitemap.xml`);
    },
  };
}
