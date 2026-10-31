import { skillIcon } from "@/lib/skillIcons";

/**
 * Pill with the tool's brand icon when one is known. `iconName` lets a
 * translated label ("3D-Druck") use the icon of its English name ("3D Printing").
 */
export default function SkillPill({ name, iconName }: { name: string; iconName?: string }) {
  const icon = skillIcon(iconName || name) ?? (iconName ? skillIcon(name) : undefined);
  return (
    <span className={`p-pill${icon ? " has-icon" : ""}`}>
      {icon?.kind === "path" && (
        <svg className="p-pill-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={icon.path} fill={icon.color} />
        </svg>
      )}
      {icon?.kind === "svg" && (
        // Static, bundled brand artwork (see lib/brandIconsExtra.ts)
        <svg className="p-pill-icon" viewBox={icon.viewBox} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: icon.body }} />
      )}
      {name}
    </span>
  );
}
