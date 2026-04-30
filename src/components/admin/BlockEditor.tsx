import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { BlockType } from "@/lib/blocks";

type Props = { type: BlockType; data: any; onChange: (d: any) => void };

const Field = ({ label, children }: any) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

export default function BlockEditor({ type, data, onChange }: Props) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v });
  const setNested = (path: string[], v: any) => {
    const next = structuredClone(data);
    let o: any = next;
    for (let i = 0; i < path.length - 1; i++) o = o[path[i]] ??= {};
    o[path[path.length - 1]] = v;
    onChange(next);
  };

  const ListEditor = ({ field, schema, factory }: { field: string; schema: { key: string; label: string; type?: string }[]; factory: () => any }) => {
    const items: any[] = data[field] ?? [];
    const update = (idx: number, key: string, val: any) => {
      const next = [...items];
      next[idx] = { ...next[idx], [key]: val };
      set(field, next);
    };
    return (
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Item {i + 1}</span>
              <Button size="icon" variant="ghost" onClick={() => set(field, items.filter((_, x) => x !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {schema.map((s) => (
              <Field key={s.key} label={s.label}>
                {s.type === "textarea" ? (
                  <Textarea value={it[s.key] ?? ""} onChange={(e) => update(i, s.key, e.target.value)} />
                ) : s.type === "number" ? (
                  <Input type="number" value={it[s.key] ?? 0} onChange={(e) => update(i, s.key, Number(e.target.value))} />
                ) : (
                  <Input value={it[s.key] ?? ""} onChange={(e) => update(i, s.key, e.target.value)} />
                )}
              </Field>
            ))}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => set(field, [...items, factory()])}>
          <Plus className="w-3 h-3 mr-1" /> Add item
        </Button>
      </div>
    );
  };

  switch (type) {
    case "hero":
      return (
        <div className="space-y-4">
          <Field label="Section ID (anchor)"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Tagline (badge)"><Input value={data.tag ?? ""} onChange={(e) => set("tag", e.target.value)} /></Field>
          <Field label="Name"><Input value={data.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Subtitle"><Input value={data.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
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
          <Field label="Paragraphs (one per line)">
            <Textarea rows={6} value={(data.paragraphs ?? []).join("\n\n")} onChange={(e) => set("paragraphs", e.target.value.split(/\n\n+/).filter(Boolean))} />
          </Field>
          <Field label="Skill tags (comma separated)">
            <Input value={(data.skills ?? []).join(", ")} onChange={(e) => set("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          </Field>
        </div>
      );
    case "stats":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <ListEditor field="items" schema={[{ key: "label", label: "Label" }, { key: "value", label: "Value (0-100)", type: "number" }]} factory={() => ({ label: "", value: 50 })} />
        </div>
      );
    case "projects":
      return (
        <div className="space-y-4">
          <Field label="Section ID"><Input value={data.id ?? ""} onChange={(e) => set("id", e.target.value)} /></Field>
          <Field label="Eyebrow"><Input value={data.label ?? ""} onChange={(e) => set("label", e.target.value)} /></Field>
          <Field label="Title"><Input value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
          <ListEditor
            field="items"
            schema={[
              { key: "tag", label: "Tag" },
              { key: "title", label: "Title" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "image", label: "Image URL (optional)" },
              { key: "emoji", label: "Emoji fallback" },
              { key: "link", label: "Link" },
            ]}
            factory={() => ({ tag: "", title: "", description: "", image: "", emoji: "✨", link: "" })}
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
            field="links"
            schema={[
              { key: "icon", label: "Icon (emoji)" },
              { key: "label", label: "Label" },
              { key: "href", label: "URL" },
            ]}
            factory={() => ({ icon: "🔗", label: "", href: "" })}
          />
        </div>
      );
    case "image":
      return (
        <div className="space-y-4">
          <Field label="Image URL"><Input value={data.src ?? ""} onChange={(e) => set("src", e.target.value)} /></Field>
          <Field label="Alt text"><Input value={data.alt ?? ""} onChange={(e) => set("alt", e.target.value)} /></Field>
          <Field label="Caption"><Input value={data.caption ?? ""} onChange={(e) => set("caption", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Align">
              <select className="w-full border rounded h-9 px-2 text-sm" value={data.align ?? "center"} onChange={(e) => set("align", e.target.value)}>
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
