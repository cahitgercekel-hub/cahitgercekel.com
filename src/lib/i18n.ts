import type { BlockType } from "./blocks";
import type { Lang } from "@/contexts/LanguageContext";

/**
 * Translatable text fields per block type.
 * Each entry is either:
 *   "key"             -> translate data[key] (string)
 *   "key[]"           -> translate data[key] as array of strings (paragraphs)
 *   "key.subkey"      -> translate data[key][subkey]
 *   "items[].subkey"  -> translate every data.items[i][subkey]
 */
export const TRANSLATABLE_FIELDS: Record<BlockType, string[]> = {
  hero: [
    "tag", "name", "subtitle", "cvLabel",
    "primaryBtn.label", "secondaryBtn.label",
  ],
  about: ["label", "title", "paragraphs[]", "skills[]"],
  stats: ["label", "title", "items[].label"],
  skills: ["label", "title", "groups[].name", "groups[].items[]"],
  languages: ["label", "title", "items[].name", "items[].level"],
  projects: [
    "label", "title",
    "items[].tag", "items[].title", "items[].description",
    "items[].subtitle", "items[].role", "items[].client",
    "items[].longDescription", "items[].tech[]",
    "items[].links[].label",
    "items[].gallery[].caption", "items[].gallery[].alt",
    "items[].metrics[].label", "items[].metrics[].value",
    "items[].caseStudy.sections[].heading", "items[].caseStudy.sections[].body",
    "items[].contactOverride.intro", "items[].contactOverride.links[].label",
  ],
  experience: ["label", "title", "items[].period", "items[].role", "items[].company", "items[].description"],
  contact: ["label", "title", "intro", "links[].label"],
  logos: ["label", "title", "items[].name"],
  image: ["alt", "caption"],
  html: [],
  footer: ["text"],
};

function isFilled(v: any): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/**
 * Returns a deep-merged copy of `data` where any non-empty translation value
 * in data.i18n[lang] overrides the EN value at the same path.
 * Arrays of strings (paragraphs[], skills[]) are replaced wholesale only when
 * the translation array is non-empty. Object arrays (items[], links[], groups[])
 * merge index-by-index so missing entries fall back to EN.
 */
export function mergeI18n<T extends Record<string, any>>(data: T, lang: Lang): T {
  if (!data || lang === "en") return data;
  const tr = (data as any).i18n?.[lang];
  if (!tr || typeof tr !== "object") return data;

  const out: any = { ...data };

  for (const key of Object.keys(tr)) {
    const trVal = tr[key];
    const enVal = (data as any)[key];

    // Object arrays (items, links, groups) — index-by-index field merge
    if (Array.isArray(enVal) && Array.isArray(trVal) && enVal.length > 0 && typeof enVal[0] === "object") {
      out[key] = enVal.map((item: any, i: number) => {
        const trItem = trVal[i];
        if (!trItem || typeof trItem !== "object") return item;
        const merged: any = { ...item };
        for (const ik of Object.keys(trItem)) {
          const tv = trItem[ik];
          // nested string-array (e.g. groups[].items)
          if (Array.isArray(merged[ik]) && Array.isArray(tv)) {
            merged[ik] = merged[ik].map((s: any, j: number) => isFilled(tv[j]) ? tv[j] : s);
          } else if (isFilled(tv)) {
            merged[ik] = tv;
          }
        }
        return merged;
      });
      continue;
    }

    // String arrays (paragraphs, skills) — index-by-index
    if (Array.isArray(enVal) && Array.isArray(trVal)) {
      out[key] = enVal.map((s, i) => isFilled(trVal[i]) ? trVal[i] : s);
      continue;
    }

    // Nested object (primaryBtn, secondaryBtn)
    if (enVal && typeof enVal === "object" && !Array.isArray(enVal) && trVal && typeof trVal === "object") {
      const merged: any = { ...enVal };
      for (const ik of Object.keys(trVal)) {
        if (isFilled(trVal[ik])) merged[ik] = trVal[ik];
      }
      out[key] = merged;
      continue;
    }

    // Plain string
    if (isFilled(trVal)) out[key] = trVal;
  }

  return out as T;
}

/** Pick translated nav items list. */
export function translateNavItems(
  items: { label: string; href: string }[] | undefined,
  i18n: any,
  lang: Lang
): { label: string; href: string }[] {
  if (!items) return [];
  if (lang === "en") return items;
  const labels: string[] = i18n?.[lang]?.nav_items ?? [];
  return items.map((it, i) => ({
    href: it.href,
    label: isFilled(labels[i]) ? labels[i] : it.label,
  }));
}

export function translateString(value: string | undefined, i18n: any, lang: Lang, key: string): string {
  if (lang === "en") return value ?? "";
  const v = i18n?.[lang]?.[key];
  return isFilled(v) ? v : (value ?? "");
}
