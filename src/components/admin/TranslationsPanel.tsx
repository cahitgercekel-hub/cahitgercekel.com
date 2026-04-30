import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, Languages } from "lucide-react";
import type { BlockType } from "@/lib/blocks";
import { TRANSLATABLE_FIELDS } from "@/lib/i18n";

type Props = { type: BlockType; data: any; onChange: (d: any) => void };
type LangCode = "tr" | "de";
const LANGS: { code: LangCode; label: string }[] = [
  { code: "tr", label: "Türkçe (TR)" },
  { code: "de", label: "Deutsch (DE)" },
];

/**
 * Spec strings:
 *   "key"             -> string
 *   "key.subkey"      -> nested string (primaryBtn.label)
 *   "key[]"           -> string array (paragraphs, skills)
 *   "items[].sub"     -> string field on each object array entry
 *   "groups[].items[]" -> string array nested in object array
 */
function parseSpec(spec: string): { kind: "string" | "stringArr" | "nested" | "itemField" | "itemStringArr"; path: string[] } {
  if (spec.includes("[].")) {
    const [arrKey, rest] = spec.split("[].", 2);
    if (rest.endsWith("[]")) {
      return { kind: "itemStringArr", path: [arrKey, rest.slice(0, -2)] };
    }
    return { kind: "itemField", path: [arrKey, rest] };
  }
  if (spec.endsWith("[]")) {
    return { kind: "stringArr", path: [spec.slice(0, -2)] };
  }
  if (spec.includes(".")) {
    return { kind: "nested", path: spec.split(".") };
  }
  return { kind: "string", path: [spec] };
}

function fieldLabel(spec: string): string {
  return spec
    .replace(/\[\]/g, "")
    .replace(/\./g, " · ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default function TranslationsPanel({ type, data, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const fields = TRANSLATABLE_FIELDS[type] ?? [];
  const i18n = data.i18n ?? {};

  const setForLang = (lang: LangCode, updater: (cur: any) => any) => {
    const next = { ...data, i18n: { ...i18n, [lang]: updater(i18n[lang] ?? {}) } };
    onChange(next);
  };

  return (
    <div className="border rounded-lg bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Languages className="w-4 h-4" />
        Translations (TR / DE)
        <span className="ml-auto font-normal normal-case tracking-normal text-[11px]">
          Empty fields fall back to English
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <Tabs defaultValue="tr">
            <TabsList className="mb-3">
              {LANGS.map((l) => (
                <TabsTrigger key={l.code} value={l.code}>{l.label}</TabsTrigger>
              ))}
            </TabsList>
            {LANGS.map((l) => (
              <TabsContent key={l.code} value={l.code} className="space-y-3">
                {fields.map((spec) => (
                  <SpecField
                    key={spec}
                    spec={spec}
                    enData={data}
                    trData={i18n[l.code] ?? {}}
                    setTr={(updater) => setForLang(l.code, updater)}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}

function SpecField({
  spec,
  enData,
  trData,
  setTr,
}: {
  spec: string;
  enData: any;
  trData: any;
  setTr: (updater: (cur: any) => any) => void;
}) {
  const parsed = parseSpec(spec);
  const label = fieldLabel(spec);

  if (parsed.kind === "string") {
    const k = parsed.path[0];
    const enVal = enData?.[k] ?? "";
    return (
      <Field label={label} en={String(enVal)}>
        <Input
          value={trData?.[k] ?? ""}
          onChange={(e) => setTr((cur) => ({ ...cur, [k]: e.target.value }))}
          placeholder={String(enVal)}
        />
      </Field>
    );
  }

  if (parsed.kind === "nested") {
    const [k, sk] = parsed.path;
    const enVal = enData?.[k]?.[sk] ?? "";
    return (
      <Field label={label} en={String(enVal)}>
        <Input
          value={trData?.[k]?.[sk] ?? ""}
          onChange={(e) =>
            setTr((cur) => ({ ...cur, [k]: { ...(cur?.[k] ?? {}), [sk]: e.target.value } }))
          }
          placeholder={String(enVal)}
        />
      </Field>
    );
  }

  if (parsed.kind === "stringArr") {
    const k = parsed.path[0];
    const enArr: string[] = enData?.[k] ?? [];
    const trArr: string[] = trData?.[k] ?? [];
    if (enArr.length === 0) return null;
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => (
          <Field key={i} label={`#${i + 1}`} en={enItem}>
            {enItem.length > 80 ? (
              <Textarea
                rows={3}
                value={trArr[i] ?? ""}
                onChange={(e) => setTr((cur) => {
                  const arr = [...(cur?.[k] ?? [])];
                  arr[i] = e.target.value;
                  return { ...cur, [k]: arr };
                })}
                placeholder={enItem}
              />
            ) : (
              <Input
                value={trArr[i] ?? ""}
                onChange={(e) => setTr((cur) => {
                  const arr = [...(cur?.[k] ?? [])];
                  arr[i] = e.target.value;
                  return { ...cur, [k]: arr };
                })}
                placeholder={enItem}
              />
            )}
          </Field>
        ))}
      </div>
    );
  }

  if (parsed.kind === "itemField") {
    const [k, sk] = parsed.path;
    const enArr: any[] = enData?.[k] ?? [];
    const trArr: any[] = trData?.[k] ?? [];
    if (enArr.length === 0) return null;
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => {
          const enVal = enItem?.[sk] ?? "";
          if (enVal === "" || enVal == null) return null;
          const trVal = trArr[i]?.[sk] ?? "";
          const useTextarea = String(enVal).length > 80;
          return (
            <Field key={i} label={`#${i + 1}`} en={String(enVal)}>
              {useTextarea ? (
                <Textarea
                  rows={3}
                  value={trVal}
                  onChange={(e) => setTr((cur) => {
                    const arr = [...(cur?.[k] ?? [])];
                    arr[i] = { ...(arr[i] ?? {}), [sk]: e.target.value };
                    return { ...cur, [k]: arr };
                  })}
                  placeholder={String(enVal)}
                />
              ) : (
                <Input
                  value={trVal}
                  onChange={(e) => setTr((cur) => {
                    const arr = [...(cur?.[k] ?? [])];
                    arr[i] = { ...(arr[i] ?? {}), [sk]: e.target.value };
                    return { ...cur, [k]: arr };
                  })}
                  placeholder={String(enVal)}
                />
              )}
            </Field>
          );
        })}
      </div>
    );
  }

  if (parsed.kind === "itemStringArr") {
    const [k, sk] = parsed.path;
    const enArr: any[] = enData?.[k] ?? [];
    const trArr: any[] = trData?.[k] ?? [];
    if (enArr.length === 0) return null;
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => {
          const enList: string[] = enItem?.[sk] ?? [];
          if (enList.length === 0) return null;
          const trList: string[] = trArr[i]?.[sk] ?? [];
          return (
            <div key={i} className="border rounded p-2 space-y-1.5 bg-background/40">
              <div className="text-[11px] text-muted-foreground">Group #{i + 1}</div>
              {enList.map((enS, j) => (
                <Field key={j} label={`#${j + 1}`} en={enS}>
                  <Input
                    value={trList[j] ?? ""}
                    onChange={(e) => setTr((cur) => {
                      const outer = [...(cur?.[k] ?? [])];
                      const inner = [...((outer[i]?.[sk]) ?? [])];
                      inner[j] = e.target.value;
                      outer[i] = { ...(outer[i] ?? {}), [sk]: inner };
                      return { ...cur, [k]: outer };
                    })}
                    placeholder={enS}
                  />
                </Field>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

function Field({ label, en, children }: { label: string; en: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        {en && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[60%]" title={en}>
            EN: {en}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
