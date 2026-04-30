import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { BlockType } from "@/lib/blocks";
import FileUploadField from "./FileUploadField";
import LayoutEditor from "./LayoutEditor";
import TranslationsPanel from "./TranslationsPanel";
import { TRANSLATABLE_FIELDS } from "@/lib/i18n";

type Props = { type: BlockType; data: any; onChange: (d: any) => void };

function withLayout(type: BlockType, data: any, onChange: (d: any) => void, children: React.ReactNode) {
  const hasTranslations = (TRANSLATABLE_FIELDS[type] ?? []).length > 0;
  const showLayout = type !== "footer" && type !== "html";
  return (
    <div className="space-y-4">
      {children}
      {showLayout && <LayoutEditor type={type} data={data} onChange={onChange} />}
      {hasTranslations && <TranslationsPanel type={type} data={data} onChange={onChange} />}
    </div>
  );
}

// --- Stable, module-scoped helpers (prevent input focus loss) ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

/**
 * Comma-separated input that keeps raw text locally so users can freely type commas
 * and trailing spaces. Commits the parsed array on blur (or Enter).
 */
function CsvInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const joined = (value ?? []).join(", ");
  const [text, setText] = useState(joined);
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setText(joined);
  }, [joined]);
  const commit = () => {
    const next = text.split(",").map((s) => s.trim()).filter(Boolean);
    onChange(next);
  };
  return (
    <Input
      value={text}
      onFocus={() => { focused.current = true; }}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => { focused.current = false; commit(); }}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
    />
  );
}

type SchemaField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "image" | "file" | "select" | "checkbox" | "csv" | "subList" | "group";
  options?: { label: string; value: string }[];
  folder?: string;
  accept?: string;
  /** For image fields: companion key on the same item that stores focal point ("x% y%"). */
  focalKey?: string;
  /** For "subList": schema of each child item. */
  subSchema?: SchemaField[];
  /** For "subList": factory for new child items. */
  subFactory?: () => any;
  /** For "group": fields rendered inside a collapsible group. Defaults to collapsed. */
  fields?: SchemaField[];
  /** For "group": initially open. */
  defaultOpen?: boolean;
};

function ListEditor({
  data,
  onChange,
  field,
  schema,
  factory,
}: {
  data: any;
  onChange: (d: any) => void;
  field: string;
  schema: SchemaField[];
  factory: () => any;
}) {
  const items: any[] = data[field] ?? [];
  const setField = (next: any[]) => onChange({ ...data, [field]: next });

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">Item {i + 1}</span>
            <Button size="icon" variant="ghost" onClick={() => setField(items.filter((_, x) => x !== i))}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {schema.map((s) => (
            <RenderField
              key={s.key}
              field={s}
              parentKey={field}
              value={it}
              onValueChange={(next) => {
                const arr = [...items];
                arr[i] = next;
                setField(arr);
              }}
            />
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setField([...items, factory()])}>
        <Plus className="w-3 h-3 mr-1" /> Add item
      </Button>
    </div>
  );
}

/**
 * Renders a single schema field for one row of data. Handles all primitive
 * field types plus nested sub-lists and collapsible groups.
 */
function RenderField({
  field: s,
  parentKey,
  value,
  onValueChange,
}: {
  field: SchemaField;
  parentKey: string;
  value: any;
  onValueChange: (next: any) => void;
}) {
  const update = (key: string, val: any) => onValueChange({ ...value, [key]: val });

  if (s.type === "group") {
    return (
      <CollapsibleGroup label={s.label} defaultOpen={!!s.defaultOpen}>
        {(s.fields ?? []).map((f) => (
          <RenderField key={f.key} field={f} parentKey={parentKey} value={value} onValueChange={onValueChange} />
        ))}
      </CollapsibleGroup>
    );
  }
  if (s.type === "subList") {
    return (
      <div className="space-y-2">
        <Label className="text-xs">{s.label}</Label>
        <ListEditor
          data={value}
          onChange={onValueChange}
          field={s.key}
          schema={s.subSchema ?? []}
          factory={s.subFactory ?? (() => ({}))}
        />
      </div>
    );
  }
  if (s.type === "csv") {
    return (
      <Field label={s.label}>
        <CsvInput value={value[s.key] ?? []} onChange={(v) => update(s.key, v)} />
      </Field>
    );
  }
  if (s.type === "textarea") {
    return (
      <Field label={s.label}>
        <Textarea value={value[s.key] ?? ""} onChange={(e) => update(s.key, e.target.value)} />
      </Field>
    );
  }
  if (s.type === "number") {
    return (
      <Field label={s.label}>
        <Input type="number" value={value[s.key] ?? 0} onChange={(e) => update(s.key, Number(e.target.value))} />
      </Field>
    );
  }
  if (s.type === "image" || s.type === "file") {
    return (
      <FileUploadField
        label={s.label}
        value={value[s.key] ?? ""}
        onChange={(v) => update(s.key, v)}
        folder={s.folder || parentKey}
        accept={s.accept || (s.type === "image" ? "image/*" : "*/*")}
        preview={s.type === "image" ? "image" : "file"}
        focal={s.focalKey ? value[s.focalKey] : undefined}
        onFocalChange={s.focalKey ? (v) => update(s.focalKey!, v) : undefined}
      />
    );
  }
  if (s.type === "select") {
    return (
      <Field label={s.label}>
        <select
          className="w-full border rounded h-9 px-2 text-sm bg-background"
          value={value[s.key] ?? ""}
          onChange={(e) => update(s.key, e.target.value)}
        >
          {(s.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Field>
    );
  }
  if (s.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!value[s.key]}
          onChange={(e) => update(s.key, e.target.checked)}
        />
        {s.label}
      </label>
    );
  }
  return (
    <Field label={s.label}>
      <Input value={value[s.key] ?? ""} onChange={(e) => update(s.key, e.target.value)} />
    </Field>
  );
}

function CollapsibleGroup({ label, defaultOpen, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border rounded-md bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
      >
        <span style={{ display: "inline-block", width: 10 }}>{open ? "▾" : "▸"}</span>
        {label}
      </button>
      {open && <div className="p-2 pt-0 space-y-2">{children}</div>}
    </div>
  );
}

// --- Main editor ---

export default function BlockEditor({ type, data, onChange }: Props) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  const setNested = (path: string[], v: any) => {
    const next = structuredClone(data);
    let o: any = next;
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]] ??= {};
    o[path[path.length - 1]] = v;
    onChange(next);
  };

  const inner = (() => { switch (type) {
    case "hero":
      return (
        <div className="space-y-4">
          <Field label="Section ID (anchor)"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Tagline (badge)"><Input value={data.tag ?? ""} onChange={(e) => set("tag", e.target.value)} /></Field>
          <Field label="Name"><Input value={data.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Subtitle"><Input value={data.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          <FileUploadField
            label="Profile picture"
            value={data.image ?? ""}
            onChange={(v) => set("image", v)}
            folder="hero"
            accept="image/*"
            preview="image"
            focal={data.imageFocal}
            onFocalChange={(v) => set("imageFocal", v)}
          />
          <FileUploadField
            label="CV / Resume (PDF)"
            value={data.cvUrl ?? ""}
            onChange={(v) => set("cvUrl", v)}
            folder="cv"
            accept="application/pdf,.pdf,.doc,.docx"
            preview="file"
          />
          <Field label="CV button label"><Input value={data.cvLabel ?? "Download CV"} onChange={(e) => set("cvLabel", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary button label"><Input value={data.primaryBtn?.label ?? ""} onChange={(e) => setNested(["primaryBtn", "label"], e.target.value)} /></Field>
            <Field label="Primary button link"><Input value={data.primaryBtn?.href ?? ""} onChange={(e) => setNested(["primaryBtn", "href"], e.target.value)} /></Field>
            <Field label="Secondary button label"><Input value={data.secondaryBtn?.label ?? ""} onChange={(e) => setNested(["secondaryBtn", "label"], e.target.value)} /></Field>
            <Field label="Secondary button link"><Input value={data.secondaryBtn?.href ?? ""} onChange={(e) => setNested(["secondaryBtn", "href"], e.target.value)} /></Field>
          </div>
        </div>
      );
    case "about":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow label"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Paragraphs (separate with blank line)">
            <Textarea rows={6} value={(data.paragraphs ?? []).join("\n\n")} onChange={(e) => set("paragraphs", e.target.value.split(/\n\n+/))} />
          </Field>
          <Field label="Skill tags (comma separated)">
            <CsvInput value={data.skills ?? []} onChange={(v) => set("skills", v)} />
          </Field>
          <FileUploadField
            label="Portrait image (optional)"
            value={data.portrait ?? ""}
            onChange={(v) => set("portrait", v)}
            folder="about"
            focal={data.portraitFocal}
            onFocalChange={(v) => set("portraitFocal", v)}
          />
        </div>
      );
    case "stats":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <ListEditor
            data={data}
            onChange={onChange}
            field="items"
            schema={[{ key: "label", label: "Label" }, { key: "value", label: "Value (0-100)", type: "number" }]}
            factory={() => ({ label: "", value: 50 })}
          />
        </div>
      );
    case "skills":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <Label className="text-xs">Skill groups</Label>
          <SkillGroupsEditor data={data} onChange={onChange} />
        </div>
      );
    case "languages":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <ListEditor
            data={data}
            onChange={onChange}
            field="items"
            schema={[
              { key: "name", label: "Language" },
              {
                key: "level", label: "Level", type: "select", options: [
                  { label: "Native", value: "Native" },
                  { label: "Fluent", value: "Fluent" },
                  { label: "Advanced", value: "Advanced" },
                  { label: "Intermediate", value: "Intermediate" },
                  { label: "Basic", value: "Basic" },
                ]
              },
              { key: "value", label: "Proficiency (0-100)", type: "number" },
            ]}
            factory={() => ({ name: "", level: "Fluent", value: 80 })}
          />
        </div>
      );
    case "projects":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <p className="text-[11px] text-muted-foreground">
            Each project becomes its own page at <code>/&lt;slug&gt;</code>. Leave “Open external link instead” checked
            to keep the card linking out to <em>Link</em> instead.
          </p>
          <ListEditor
            data={data}
            onChange={onChange}
            field="items"
            schema={[
              { key: "tag", label: "Tag" },
              { key: "title", label: "Title" },
              { key: "description", label: "Short description (card)", type: "textarea" },
              { key: "image", label: "Cover image (upload or URL)", type: "image", folder: "projects", focalKey: "focal" },
              { key: "emoji", label: "Emoji fallback" },
              { key: "link", label: "External link (optional)" },
              { key: "openExternal", label: "Open external link instead of detail page", type: "checkbox" },
              { key: "featured", label: "Featured (highlight)", type: "checkbox" },
              {
                key: "_detail", label: "Detail page", type: "group", defaultOpen: false,
                fields: [
                  { key: "slug", label: "URL slug (auto from title if empty) — opens at /<slug>" },
                  { key: "subtitle", label: "Subtitle / one-liner" },
                  { key: "iconUrl", label: "Icon / logo (square)", type: "image", folder: "projects" },
                  { key: "role", label: "Your role" },
                  { key: "client", label: "Client" },
                  { key: "year", label: "Year / period" },
                  { key: "tech", label: "Tech & tools (comma separated)", type: "csv" },
                  { key: "longDescription", label: "Long description (separate paragraphs with blank line)", type: "textarea" },
                  {
                    key: "links", label: "Extra links", type: "subList",
                    subSchema: [
                      { key: "label", label: "Label" },
                      { key: "href", label: "URL" },
                    ],
                    subFactory: () => ({ label: "", href: "" }),
                  },
                  {
                    key: "gallery", label: "Gallery images", type: "subList",
                    subSchema: [
                      { key: "src", label: "Image", type: "image", folder: "projects", focalKey: "focal" },
                      { key: "alt", label: "Alt text" },
                      { key: "caption", label: "Caption" },
                    ],
                    subFactory: () => ({ src: "", alt: "", caption: "", focal: "" }),
                  },
                  {
                    key: "metrics", label: "Metrics / KPIs", type: "subList",
                    subSchema: [
                      { key: "value", label: "Value (e.g. “+38%”)" },
                      { key: "label", label: "Label" },
                    ],
                    subFactory: () => ({ value: "", label: "" }),
                  },
                ],
              },
              {
                key: "_caseStudy", label: "Case study", type: "group", defaultOpen: false,
                fields: [
                  {
                    key: "caseStudy", label: "", type: "subList",
                    // Reuse subList for the inner sections + a checkbox would
                    // need a deeper editor; keep it simple with a flat helper.
                    subSchema: [],
                    subFactory: () => ({}),
                  },
                ],
              },
              {
                key: "_contact", label: "Custom contact section (optional)", type: "group", defaultOpen: false,
                fields: [
                  {
                    key: "contactOverride", label: "", type: "subList",
                    subSchema: [],
                    subFactory: () => ({}),
                  },
                ],
              },
            ]}
            factory={() => ({
              tag: "", title: "", description: "", image: "", emoji: "✨", link: "",
              openExternal: false, featured: false, slug: "",
              subtitle: "", role: "", client: "", year: "", iconUrl: "",
              tech: [], longDescription: "",
              links: [], gallery: [], metrics: [],
              caseStudy: { enabled: false, sections: [] },
              contactOverride: { enabled: false, intro: "", links: [] },
            })}
          />
        </div>
      );
    case "experience":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <ListEditor
            data={data}
            onChange={onChange}
            field="items"
            schema={[
              { key: "period", label: "Period" },
              { key: "role", label: "Role" },
              { key: "company", label: "Company" },
              { key: "description", label: "Description", type: "textarea" },
            ]}
            factory={() => ({ period: "", role: "", company: "", description: "" })}
          />
        </div>
      );
    case "contact":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Intro text"><Textarea value={data.intro ?? ""} onChange={(e) => set("intro", e.target.value)} /></Field>
          <ListEditor
            data={data}
            onChange={onChange}
            field="links"
            schema={[
              { key: "icon", label: "Icon (emoji, fallback if no image)" },
              { key: "iconUrl", label: "Icon image (upload or URL)", type: "image", folder: "icons" },
              { key: "label", label: "Label" },
              { key: "href", label: "URL" },
            ]}
            factory={() => ({ icon: "🔗", iconUrl: "", label: "", href: "" })}
          />
        </div>
      );
    case "logos":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow label (e.g. 'previously at')"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title (optional)"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <ListEditor
            data={data}
            onChange={onChange}
            field="items"
            schema={[
              { key: "name", label: "Name (alt text)" },
              { key: "logo", label: "Logo image", type: "image", folder: "logos" },
              { key: "href", label: "Link URL (optional)" },
            ]}
            factory={() => ({ name: "", logo: "", href: "" })}
          />
        </div>
      );
    case "image":
      return (
        <div className="space-y-4">
          <FileUploadField
            label="Image (upload or URL)"
            value={data.src ?? ""}
            onChange={(v) => set("src", v)}
            folder="images"
            focal={data.focal}
            onFocalChange={(v) => set("focal", v)}
          />
          <Field label="Alt text"><Input value={data.alt ?? ""} onChange={(e) => set("alt", e.target.value)} /></Field>
          <Field label="Caption"><Input value={data.caption ?? ""} onChange={(e) => set("caption", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Align">
              <select className="w-full border rounded h-9 px-2 text-sm bg-background" value={data.align ?? "center"} onChange={(e) => set("align", e.target.value)}>
                <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
              </select>
            </Field>
            <Field label="Max width (px)"><Input type="number" value={data.maxWidth ?? 720} onChange={(e) => set("maxWidth", Number(e.target.value))} /></Field>
          </div>
        </div>
      );
    case "html":
      return (
        <div className="space-y-4">
          <Field label="Custom HTML"><Textarea rows={10} className="font-mono text-xs" value={data.html ?? ""} onChange={(e) => set("html", e.target.value)} /></Field>
          <p className="text-xs text-muted-foreground">⚠️ HTML is rendered as-is. Only use content you trust (you wrote yourself).</p>
        </div>
      );
    case "footer":
      return <Field label="Footer text"><Input value={data.text ?? ""} onChange={(e) => set("text", e.target.value)} /></Field>;
    default:
      return null;
  } })();
  return withLayout(type, data, onChange, inner);
}

function SkillGroupsEditor({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  const groups: { name: string; items: string[] }[] = data.groups ?? [];
  const setGroups = (next: any[]) => onChange({ ...data, groups: next });
  return (
    <div className="space-y-3">
      {groups.map((g, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground">Group {i + 1}</span>
            <Button size="icon" variant="ghost" onClick={() => setGroups(groups.filter((_, x) => x !== i))}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Field label="Group name (optional)">
            <Input value={g.name ?? ""} onChange={(e) => {
              const next = [...groups]; next[i] = { ...next[i], name: e.target.value }; setGroups(next);
            }} />
          </Field>
          <Field label="Skills (comma separated)">
            <CsvInput
              value={g.items ?? []}
              onChange={(v) => {
                const next = [...groups];
                next[i] = { ...next[i], items: v };
                setGroups(next);
              }}
            />
          </Field>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setGroups([...groups, { name: "", items: [] }])}>
        <Plus className="w-3 h-3 mr-1" /> Add group
      </Button>
    </div>
  );
}
