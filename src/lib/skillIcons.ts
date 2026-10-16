import {
  siAsana,
  siFigma,
  siFirebase,
  siGithub,
  siGoogleappsscript,
  siGooglesheets,
  siJira,
  siN8n,
  siPython,
  type SimpleIcon,
} from "simple-icons";
import { EXTRA_BRAND_ICONS } from "./brandIconsExtra";

/** Either a single-colour Simple Icons path or a multi-colour SVG body. */
export type SkillIcon =
  | { kind: "path"; path: string; color: string }
  | { kind: "svg"; viewBox: string; body: string };

const simple = (icon: SimpleIcon): SkillIcon => ({ kind: "path", path: icon.path, color: `#${icon.hex}` });
const extra = (key: keyof typeof EXTRA_BRAND_ICONS): SkillIcon => ({ kind: "svg", ...EXTRA_BRAND_ICONS[key] });

/**
 * Brand icons for skill pills, matched by pill text (case-insensitive).
 * Anything not listed renders as a plain pill. Named imports keep only these
 * icons in the bundle.
 */
const ICONS: [RegExp, SkillIcon][] = [
  [/^python$/i, simple(siPython)],
  [/^figma$/i, simple(siFigma)],
  [/^jira$/i, simple(siJira)],
  [/^asana$/i, simple(siAsana)],
  [/^firebase( analytics)?$/i, simple(siFirebase)],
  [/^n8n$/i, simple(siN8n)],
  [/^github$/i, simple(siGithub)],
  [/^google sheets$/i, simple(siGooglesheets)],
  [/^google apps script$/i, simple(siGoogleappsscript)],
  [/^(microsoft )?excel$/i, extra("excel")],
  [/^(microsoft )?powerpoint$/i, extra("powerpoint")],
  [/^tableau$/i, extra("tableau")],
  [/^lovable$/i, extra("lovable")],
  [/^google ai studio$/i, extra("aistudio")],
];

export function skillIcon(name: string): SkillIcon | undefined {
  const n = (name || "").trim();
  return ICONS.find(([re]) => re.test(n))?.[1];
}
