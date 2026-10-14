import type { SectionRow } from "./blocks";

export const RESERVED_SLUGS = new Set([
  "admin", "auth", "login", "logout", "signup", "api",
  "assets", "static", "public", "favicon.ico", "robots.txt",
  "sitemap.xml", "manifest.json", "404", "not-found",
  // language prefixes (/tr, /de)
  "en", "tr", "de",
]);

/** Convert any string to a kebab-case URL-safe slug. */
export function slugify(input: string): string {
  return (input || "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Returns the effective slug for a project item (explicit slug or derived from title). */
export function projectSlug(item: any): string {
  const explicit = (item?.slug || "").toString().trim();
  if (explicit) return slugify(explicit);
  return slugify(item?.title || "");
}

export interface ProjectMatch {
  item: any;
  /** The `projects` block this item belongs to (for context). */
  blockData: any;
}

/** Find a project across every `projects` section by slug. */
export function findProjectBySlug(sections: SectionRow[] | undefined, slug: string): ProjectMatch | null {
  if (!sections || !slug) return null;
  const target = slugify(slug);
  for (const s of sections) {
    if (s.type !== "projects") continue;
    const items: any[] = s.data?.items ?? [];
    const usedSlugs = new Set<string>();
    for (const it of items) {
      let sl = projectSlug(it);
      // dedupe duplicates by suffixing -2, -3, ...
      let candidate = sl;
      let n = 2;
      while (usedSlugs.has(candidate)) {
        candidate = `${sl}-${n++}`;
      }
      usedSlugs.add(candidate);
      if (candidate === target) return { item: it, blockData: s.data };
    }
  }
  return null;
}

/** Find the first `contact` section in the page (used as a fallback contact). */
export function findContactSection(sections: SectionRow[] | undefined): any | null {
  if (!sections) return null;
  return sections.find((s) => s.type === "contact")?.data ?? null;
}
