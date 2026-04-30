import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { BlockType } from "@/lib/blocks";
import FileUploadField from "./FileUploadField";

type Props = { type: BlockType; data: any; onChange: (d: any) => void };

// --- Stable, module-scoped helpers (prevent input focus loss) ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

type SchemaField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "image" | "file" | "select" | "checkbox";
  options?: { label: string; value: string }[];
  folder?: string;
  accept?: string;
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
  const update = (idx: number, key: string, val: any) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    setField(next);
  };

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
          {schema.map((s) => {
            if (s.type === "textarea") {
              return (
                <Field key={s.key} label={s.label}>
                  <Textarea value={it[s.key] ?? ""} onChange={(e) => update(i, s.key, e.target.value)} />
                </Field>
              );
            }
            if (s.type === "number") {
              return (
                <Field key={s.key} label={s.label}>
                  <Input type="number" value={it[s.key] ?? 0} onChange={(e) => update(i, s.key, Number(e.target.value))} />
                </Field>
              );
            }
            if (s.type === "image" || s.type === "file") {
              return (
                <FileUploadField
                  key={s.key}
                  label={s.label}
                  value={it[s.key] ?? ""}
                  onChange={(v) => update(i, s.key, v)}
                  folder={s.folder || field}
                  accept={s.accept || (s.type === "image" ? "image/*" : "*/*")}
                  preview={s.type === "image" ? "image" : "file"}
                />
              );
            }
            if (s.type === "select") {
              return (
                <Field key={s.key} label={s.label}>
                  <select
                    className="w-full border rounded h-9 px-2 text-sm bg-background"
                    value={it[s.key] ?? ""}
                    onChange={(e) => update(i, s.key, e.target.value)}
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
                <label key={s.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!it[s.key]}
                    onChange={(e) => update(i, s.key, e.target.checked)}
                  />
                  {s.label}
                </label>
              );
            }
            return (
              <Field key={s.key} label={s.label}>
                <Input value={it[s.key] ?? ""} onChange={(e) => update(i, s.key, e.target.value)} />
              </Field>
            );
          })}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setField([...items, factory()])}>
        <Plus className="w-3 h-3 mr-1" /> Add item
      </Button>
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

  switch (type) {
    case "hero":
      return (
        <div className="space-y-4">
          <Field label="Section ID (anchor)"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Tagline (badge)"><Input value={data.tag ?? ""} onChange={(e) => set("tag", e.target.value)} /></Field>
          <Field label="Name"><Input value={data.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Subtitle"><Input value={data.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          <FileUploadField
            label="Profile picture (right side)"
            value={data.image ?? ""}
            onChange={(v) => set("image", v)}
            folder="hero"
            accept="image/*"
            preview="image"
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
            <Input value={(data.skills ?? []).join(", ")} onChange={(e) => set("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          </Field>
          <FileUploadField
            label="Portrait image (optional)"
            value={data.portrait ?? ""}
            onChange={(v) => set("portrait", v)}
            folder="about"
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
          <ListEditor
            data={data}
            onChange={onChange}
            field="items"
            schema={[
              { key: "tag", label: "Tag" },
              { key: "title", label: "Title" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "image", label: "Image (upload or URL)", type: "image", folder: "projects" },
              { key: "emoji", label: "Emoji fallback" },
              { key: "link", label: "Link" },
              { key: "featured", label: "Featured (highlight)", type: "checkbox" },
            ]}
            factory={() => ({ tag: "", title: "", description: "", image: "", emoji: "✨", link: "", featured: false })}
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
    case "image":
      return (
        <div className="space-y-4">
          <FileUploadField
            label="Image (upload or URL)"
            value={data.src ?? ""}
            onChange={(v) => set("src", v)}
            folder="images"
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
  }
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
            <Input
              value={(g.items ?? []).join(", ")}
              onChange={(e) => {
                const next = [...groups];
                next[i] = { ...next[i], items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) };
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
