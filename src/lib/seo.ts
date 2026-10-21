// SEO helpers shared by the app (via SeoHead) and the build-time prerender
// plugin (vite-plugins/prerender.ts). Keep imports relative and runtime-free
// of `import.meta.env` so this file also runs in Node during `vite build`.
import { mergeI18n } from "./i18n";
import { projectSlug } from "./projectSlug";

export const SITE_URL = "https://cahitgercekel.com";
export const PERSON_NAME = "Cahit Emre Gerçekel";
const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/630wX2Z18BeKjKtlh9rAaelhiLO2/social-images/social-1777740730420-logo_social.webp";
const SAME_AS = [
  "https://www.linkedin.com/in/cahitemregercekel/",
  "https://github.com/cahitgercekel-hub",
];

export type SeoLang = "en" | "tr" | "de";
export const SEO_LANGS: SeoLang[] = ["en", "tr", "de"];
const OG_LOCALE: Record<SeoLang, string> = { en: "en_US", tr: "tr_TR", de: "de_DE" };

const HOME_META: Record<SeoLang, { title: string; description: string }> = {
  en: {
    title: "Cahit Emre Gerçekel – Product Specialist & TUM MSc Student",
    description:
      "Cahit Emre Gerçekel (Cahit Gercekel): former Product Specialist at Vertigo Games, MSc Management student at TUM Heilbronn, open to working student roles.",
  },
  tr: {
    title: "Cahit Emre Gerçekel – Ürün Uzmanı | TUM Yönetim Yüksek Lisansı",
    description:
      "Cahit Emre Gerçekel: Vertigo Games'te eski Ürün Uzmanı, Boğaziçi İnşaat Mühendisliği mezunu, TUM Heilbronn'da Yönetim yüksek lisans öğrencisi.",
  },
  de: {
    title: "Cahit Emre Gerçekel – Product Specialist | Werkstudent Heilbronn",
    description:
      "Cahit Emre Gerçekel: ehemaliger Product Specialist bei Vertigo Games, MSc Management an der TUM Heilbronn – offen für Werkstudentenstellen im Produktmanagement.",
  },
};

/** Search-focused page names per project slug; other projects fall back to their own title. */
const PROJECT_TITLES: Record<string, Record<SeoLang, string>> = {
  onboard: {
    en: "ONboard – AI Job Application Tracker",
    tr: "ONboard – Yapay Zekâ ile Başvuru Takibi",
    de: "ONboard – KI-gestützter Bewerbungs-Tracker",
  },
  "trip-it": {
    en: "Trip It – AI Trip Planner for Germany",
    tr: "Trip It – Yapay Zekâ ile Almanya Gezisi",
    de: "Trip It – KI-Reiseplaner für Deutschland",
  },
  "city-wallet": {
    en: "City Wallet – Hack-Nation AI Hackathon",
    tr: "City Wallet – Hack-Nation Projesi",
    de: "City Wallet – Hack-Nation KI-Hackathon",
  },
  link: {
    en: "Link – AI Desktop Assistant for Windows",
    tr: "Link – Windows için Yapay Zekâ Asistanı",
    de: "Link – KI-Desktop-Assistent für Windows",
  },
};

const HOME_LABEL: Record<SeoLang, string> = { en: "Home", tr: "Ana Sayfa", de: "Startseite" };

// ---------- paths ----------

export function langFromPath(pathname: string): SeoLang {
  const seg = (pathname || "/").split("/")[1];
  return seg === "tr" || seg === "de" ? seg : "en";
}

/** "/tr/onboard" -> "/onboard", "/de" -> "/" */
export function stripLang(pathname: string): string {
  if (langFromPath(pathname) === "en") return pathname || "/";
  return pathname.slice(3) || "/";
}

/** Prefix a language-neutral path ("/", "/onboard", "/#projects") for `lang`. */
export function localizedPath(path: string, lang: SeoLang): string {
  let p = path.startsWith("/") ? path : `/${path}`;
  let hash = "";
  const h = p.indexOf("#");
  if (h >= 0) { hash = p.slice(h); p = p.slice(0, h) || "/"; }
  if (lang === "en") return p + hash;
  return (p === "/" ? `/${lang}` : `/${lang}${p}`) + hash;
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;

// ---------- text ----------

/** Strip the site's lightweight markdown (**bold**, *italic*, [label](url)) to plain text. */
export function plainText(input: unknown): string {
  return String(input ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function clip(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).replace(/[\s,.;:–-]+$/, "")}…`;
}

// ---------- projects ----------

export interface ProjectEntry {
  slug: string;
  /** Raw EN item */
  item: any;
  /** The `projects` section row's data */
  blockData: any;
  updatedAt?: string;
}

/** Every project that has its own detail page, with the same slug dedupe as the site. */
export function listProjectPages(sections: any[] | undefined): ProjectEntry[] {
  const out: ProjectEntry[] = [];
  for (const s of sections ?? []) {
    if (s.type !== "projects") continue;
    const used = new Set<string>();
    for (const it of s.data?.items ?? []) {
      const base = projectSlug(it);
      let slug = base;
      let n = 2;
      while (slug && used.has(slug)) slug = `${base}-${n++}`;
      if (slug) used.add(slug);
      if (slug && !it.openExternal) out.push({ slug, item: it, blockData: s.data, updatedAt: s.updated_at });
    }
  }
  return out;
}

/** The project item translated through its block's i18n. */
export function translateProject(entry: { item: any; blockData: any }, lang: SeoLang): any {
  const translated = mergeI18n(entry.blockData ?? {}, lang);
  const idx = (entry.blockData?.items ?? []).indexOf(entry.item);
  return (idx >= 0 ? translated.items?.[idx] : null) ?? entry.item;
}

// ---------- head ----------

export interface HeadData {
  lang: SeoLang;
  title: string;
  description: string;
  canonical: string;
  alternates: { hreflang: string; href: string }[];
  ogType: "website" | "profile" | "article";
  ogImage: string;
  ogLocale: string;
  jsonLd: Record<string, unknown>;
}

function alternatesFor(neutralPath: string) {
  return [
    ...SEO_LANGS.map((l) => ({ hreflang: l, href: absoluteUrl(localizedPath(neutralPath, l)) })),
    { hreflang: "x-default", href: absoluteUrl(neutralPath) },
  ];
}

const personId = `${SITE_URL}/#person`;
const websiteId = `${SITE_URL}/#website`;

function personNode(sections: any[] | undefined, description: string) {
  const hero = (sections ?? []).find((s) => s.type === "hero")?.data;
  return {
    "@type": "Person",
    "@id": personId,
    name: PERSON_NAME,
    alternateName: ["Cahit Gercekel", "Cahit Gerçekel", "Cahit Emre Gercekel"],
    url: `${SITE_URL}/`,
    ...(hero?.image ? { image: hero.image } : {}),
    description,
    email: "mailto:cahit.gercekel@gmail.com",
    address: { "@type": "PostalAddress", addressLocality: "Heilbronn", addressCountry: "DE" },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Technical University of Munich", url: "https://www.tum.de/" },
      { "@type": "CollegeOrUniversity", name: "Boğaziçi University", url: "https://bogazici.edu.tr/" },
    ],
    knowsAbout: ["Product Management", "Product Analytics", "Monetization Strategy", "A/B Testing", "UX Design", "Agile"],
    knowsLanguage: ["tr", "en", "de", "zh"],
    sameAs: SAME_AS,
  };
}

export function buildHomeHead(lang: SeoLang, sections: any[] | undefined, settings: any): HeadData {
  const meta = HOME_META[lang];
  const path = localizedPath("/", lang);
  const canonical = absoluteUrl(path);
  return {
    lang,
    title: meta.title,
    description: meta.description,
    canonical,
    alternates: alternatesFor("/"),
    ogType: "profile",
    ogImage: settings?.og_image_url || DEFAULT_OG_IMAGE,
    ogLocale: OG_LOCALE[lang],
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        personNode(sections, HOME_META.en.description),
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: `${SITE_URL}/`,
          name: PERSON_NAME,
          inLanguage: SEO_LANGS,
          publisher: { "@id": personId },
        },
        {
          "@type": "ProfilePage",
          "@id": `${canonical}#profile`,
          url: canonical,
          name: meta.title,
          inLanguage: lang,
          isPartOf: { "@id": websiteId },
          mainEntity: { "@id": personId },
        },
      ],
    },
  };
}

export function buildProjectHead(lang: SeoLang, slug: string, item: any, settings: any): HeadData {
  const name = PROJECT_TITLES[slug]?.[lang] || plainText(item?.title) || "Project";
  const title = `${name} | ${PERSON_NAME}`;
  const description = clip(plainText(item?.subtitle || item?.description || item?.longDescription) || HOME_META[lang].description);
  const path = localizedPath(`/${slug}`, lang);
  const canonical = absoluteUrl(path);
  const homeUrl = absoluteUrl(localizedPath("/", lang));
  const tech: string[] = Array.isArray(item?.tech) ? item.tech : [];
  return {
    lang,
    title,
    description,
    canonical,
    alternates: alternatesFor(`/${slug}`),
    ogType: "article",
    ogImage: item?.image || settings?.og_image_url || DEFAULT_OG_IMAGE,
    ogLocale: OG_LOCALE[lang],
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          "@id": `${canonical}#project`,
          name: plainText(item?.title) || name,
          headline: name,
          description,
          url: canonical,
          inLanguage: lang,
          ...(item?.image ? { image: item.image } : {}),
          ...(tech.length ? { keywords: tech.join(", ") } : {}),
          ...(item?.link ? { sameAs: item.link } : {}),
          creator: { "@type": "Person", "@id": personId, name: PERSON_NAME, url: `${SITE_URL}/` },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: HOME_LABEL[lang], item: homeUrl },
            { "@type": "ListItem", position: 2, name: plainText(item?.title) || name, item: canonical },
          ],
        },
      ],
    },
  };
}
