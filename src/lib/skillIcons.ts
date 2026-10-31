import {
  siAndroid,
  siAsana,
  siBlender,
  siCapacitor,
  siClaude,
  siFigma,
  siFirebase,
  siGithub,
  siGoogleappsscript,
  siGooglesheets,
  siJira,
  siLeaflet,
  siN8n,
  siNextdotjs,
  siOllama,
  siPython,
  siReact,
  siReactquery,
  siSqlite,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siUnity,
  type SimpleIcon,
} from "simple-icons";
import { EXTRA_BRAND_ICONS } from "./brandIconsExtra";

/** Either a single-colour Simple Icons path or a multi-colour SVG body. */
export type SkillIcon =
  | { kind: "path"; path: string; color: string }
  | { kind: "svg"; viewBox: string; body: string };

const simple = (icon: SimpleIcon, color = `#${icon.hex}`): SkillIcon => ({ kind: "path", path: icon.path, color });
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
  [/^chat ?gpt$|^openai$/i, extra("openai")],
  [/^claude( code)?$/i, simple(siClaude)],
  [/^(google )?antigravity$/i, extra("antigravity")],
  [/^gemini( cli)?$|^google gemini$|^google ai \(gemini/i, extra("gemini")],
  // Tools used in project pages
  [/^react$/i, simple(siReact)],
  [/^typescript$/i, simple(siTypescript)],
  [/^tailwind( css)?$/i, simple(siTailwindcss)],
  [/^sqlite$/i, simple(siSqlite)],
  [/^capacitor$/i, simple(siCapacitor)],
  [/^android$/i, simple(siAndroid)],
  [/^supabase$/i, simple(siSupabase)],
  [/^(tanstack |react )query$/i, simple(siReactquery)],
  [/^leaflet$/i, simple(siLeaflet)],
  [/^ollama\b/i, simple(siOllama, "#000000")],
  [/^blender$/i, simple(siBlender)],
  [/^next\.?js$/i, simple(siNextdotjs, "#000000")],
  // Simple Icons ships Unity in white, which disappears on the white pill
  [/^unity$/i, simple(siUnity, "#000000")],
];

export function skillIcon(name: string): SkillIcon | undefined {
  const n = (name || "").trim();
  return ICONS.find(([re]) => re.test(n))?.[1];
}
