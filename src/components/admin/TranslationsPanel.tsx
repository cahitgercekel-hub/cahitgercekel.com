import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, Languages, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BlockType } from "@/lib/blocks";
import { TRANSLATABLE_FIELDS } from "@/lib/i18n";
import { translateOne, translateTexts, type TargetLang } from "@/lib/translate";

type Props = { type: BlockType; data: any; onChange: (d: any) => void };
type LangCode = TargetLang;
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
 *   "items[].links[].label" -> string field on each entry of an object array inside each item
 */
type ParsedSpec =
  | { kind: "string"; key: string }
  | { kind: "nested"; key: string; sub: string }
  | { kind: "nestedStringArr"; key: string; sub: string }
  | { kind: "stringArr"; key: string }
  | { kind: "itemField"; key: string; sub: string }
  | { kind: "itemStringArr"; key: string; sub: string }
  | { kind: "itemObjField"; key: string; sub: string; field: string };

function parseSpec(spec: string): ParsedSpec {
  if (spec.includes("[].")) {
    // Split at the first "[]." only (String#split with a limit drops the rest).
    const cut = spec.indexOf("[].");
    const arrKey = spec.slice(0, cut);
    const rest = spec.slice(cut + 3);
    if (rest.includes("[].")) {
      const c2 = rest.indexOf("[].");
      return { kind: "itemObjField", key: arrKey, sub: rest.slice(0, c2), field: rest.slice(c2 + 3) };
    }
    if (rest.endsWith("[]")) {
      return { kind: "itemStringArr", key: arrKey, sub: rest.slice(0, -2) };
    }
    return { kind: "itemField", key: arrKey, sub: rest };
  }
  if (spec.endsWith("[]")) {
    const inner = spec.slice(0, -2);
    if (inner.includes(".")) {
      const [k, sk] = inner.split(".");
      return { kind: "nestedStringArr", key: k, sub: sk };
    }
    return { kind: "stringArr", key: inner };
  }
  if (spec.includes(".")) {
    const [k, sk] = spec.split(".");
    return { kind: "nested", key: k, sub: sk };
  }
  return { kind: "string", key: spec };
}

function fieldLabel(spec: string): string {
  return spec
    .replace(/\[\]/g, "")
    .replace(/\./g, " · ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// --- Path-based read/write so we can batch ---
type Path =
  | { kind: "string"; key: string }
  | { kind: "nested"; key: string; sub: string }
  | { kind: "nestedStringArr"; key: string; sub: string; index: number }
  | { kind: "stringArr"; key: string; index: number }
  | { kind: "itemField"; key: string; sub: string; index: number }
  | { kind: "itemStringArr"; key: string; sub: string; index: number; inner: number }
  | { kind: "itemObjField"; key: string; sub: string; field: string; index: number; inner: number };

function readPathFromEn(enData: any, p: Path): string {
  switch (p.kind) {
    case "string": return String(enData?.[p.key] ?? "");
    case "nested": return String(enData?.[p.key]?.[p.sub] ?? "");
    case "nestedStringArr": return String(enData?.[p.key]?.[p.sub]?.[p.index] ?? "");
    case "stringArr": return String(enData?.[p.key]?.[p.index] ?? "");
    case "itemField": return String(enData?.[p.key]?.[p.index]?.[p.sub] ?? "");
    case "itemStringArr": return String(enData?.[p.key]?.[p.index]?.[p.sub]?.[p.inner] ?? "");
    case "itemObjField": return String(enData?.[p.key]?.[p.index]?.[p.sub]?.[p.inner]?.[p.field] ?? "");
  }
}

function readPathFromTr(trData: any, p: Path): string {
  switch (p.kind) {
    case "string": return String(trData?.[p.key] ?? "");
    case "nested": return String(trData?.[p.key]?.[p.sub] ?? "");
    case "nestedStringArr": return String(trData?.[p.key]?.[p.sub]?.[p.index] ?? "");
    case "stringArr": return String(trData?.[p.key]?.[p.index] ?? "");
    case "itemField": return String(trData?.[p.key]?.[p.index]?.[p.sub] ?? "");
    case "itemStringArr": return String(trData?.[p.key]?.[p.index]?.[p.sub]?.[p.inner] ?? "");
    case "itemObjField": return String(trData?.[p.key]?.[p.index]?.[p.sub]?.[p.inner]?.[p.field] ?? "");
  }
}

function writePathToTr(trData: any, p: Path, value: string): any {
  const next = { ...(trData ?? {}) };
  switch (p.kind) {
    case "string": {
      next[p.key] = value;
      return next;
    }
    case "nested": {
      next[p.key] = { ...(next[p.key] ?? {}), [p.sub]: value };
      return next;
    }
    case "nestedStringArr": {
      const inner = [...((next[p.key]?.[p.sub]) ?? [])];
      inner[p.index] = value;
      next[p.key] = { ...(next[p.key] ?? {}), [p.sub]: inner };
      return next;
    }
    case "stringArr": {
      const arr = [...(next[p.key] ?? [])];
      arr[p.index] = value;
      next[p.key] = arr;
      return next;
    }
    case "itemField": {
      const arr = [...(next[p.key] ?? [])];
      arr[p.index] = { ...(arr[p.index] ?? {}), [p.sub]: value };
      next[p.key] = arr;
      return next;
    }
    case "itemStringArr": {
      const outer = [...(next[p.key] ?? [])];
      const inner = [...((outer[p.index]?.[p.sub]) ?? [])];
      inner[p.inner] = value;
      outer[p.index] = { ...(outer[p.index] ?? {}), [p.sub]: inner };
      next[p.key] = outer;
      return next;
    }
    case "itemObjField": {
      next[p.key] = setItemObjField(next[p.key], p.index, p.sub, p.inner, p.field, value);
      return next;
    }
  }
}

/** Immutably set arr[index][sub][inner][field] = value, creating missing levels. */
function setItemObjField(arr: any[] | undefined, index: number, sub: string, inner: number, field: string, value: string): any[] {
  const outer = [...(arr ?? [])];
  const list = [...((outer[index]?.[sub]) ?? [])];
  list[inner] = { ...(list[inner] ?? {}), [field]: value };
  outer[index] = { ...(outer[index] ?? {}), [sub]: list };
  return outer;
}

/** Enumerate every translatable path that has a non-empty EN value. */
function collectAllPaths(type: BlockType, enData: any): Path[] {
  const paths: Path[] = [];
  for (const spec of TRANSLATABLE_FIELDS[type] ?? []) {
    const p = parseSpec(spec);
    switch (p.kind) {
      case "string": {
        if (String(enData?.[p.key] ?? "").trim()) paths.push({ kind: "string", key: p.key });
        break;
      }
      case "nested": {
        if (String(enData?.[p.key]?.[p.sub] ?? "").trim()) paths.push({ kind: "nested", key: p.key, sub: p.sub });
        break;
      }
      case "nestedStringArr": {
        const arr: string[] = enData?.[p.key]?.[p.sub] ?? [];
        arr.forEach((v, i) => {
          if (String(v ?? "").trim()) paths.push({ kind: "nestedStringArr", key: p.key, sub: p.sub, index: i });
        });
        break;
      }
      case "stringArr": {
        const arr: string[] = enData?.[p.key] ?? [];
        arr.forEach((v, i) => {
          if (String(v ?? "").trim()) paths.push({ kind: "stringArr", key: p.key, index: i });
        });
        break;
      }
      case "itemField": {
        const arr: any[] = enData?.[p.key] ?? [];
        arr.forEach((it, i) => {
          if (String(it?.[p.sub] ?? "").trim()) paths.push({ kind: "itemField", key: p.key, sub: p.sub, index: i });
        });
        break;
      }
      case "itemStringArr": {
        const arr: any[] = enData?.[p.key] ?? [];
        arr.forEach((it, i) => {
          const inner: string[] = it?.[p.sub] ?? [];
          inner.forEach((v, j) => {
            if (String(v ?? "").trim()) paths.push({ kind: "itemStringArr", key: p.key, sub: p.sub, index: i, inner: j });
          });
        });
        break;
      }
      case "itemObjField": {
        const arr: any[] = enData?.[p.key] ?? [];
        arr.forEach((it, i) => {
          const inner: any[] = Array.isArray(it?.[p.sub]) ? it[p.sub] : [];
          inner.forEach((o, j) => {
            if (String(o?.[p.field] ?? "").trim()) {
              paths.push({ kind: "itemObjField", key: p.key, sub: p.sub, field: p.field, index: i, inner: j });
            }
          });
        });
        break;
      }
    }
  }
  return paths;
}

export default function TranslationsPanel({ type, data, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const fields = TRANSLATABLE_FIELDS[type] ?? [];
  const i18n = data.i18n ?? {};

  const setForLang = (lang: LangCode, updater: (cur: any) => any) => {
    const cur = data.i18n?.[lang] ?? {};
    const next = { ...data, i18n: { ...(data.i18n ?? {}), [lang]: updater(cur) } };
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
                <BulkTranslateBar
                  type={type}
                  data={data}
                  lang={l.code}
                  onApply={(nextTr) => setForLang(l.code, () => nextTr)}
                />
                {fields.map((spec) => (
                  <SpecField
                    key={spec}
                    spec={spec}
                    lang={l.code}
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

function BulkTranslateBar({
  type,
  data,
  lang,
  onApply,
}: {
  type: BlockType;
  data: any;
  lang: LangCode;
  onApply: (nextTr: any) => void;
}) {
  const [busy, setBusy] = useState(false);
  const trData = data.i18n?.[lang] ?? {};
  const allPaths = collectAllPaths(type, data);
  const emptyPaths = allPaths.filter((p) => !readPathFromTr(trData, p).trim());

  const run = async (mode: "empty" | "all") => {
    const paths = mode === "empty" ? emptyPaths : allPaths;
    if (paths.length === 0) {
      toast.info("Nothing to translate");
      return;
    }
    setBusy(true);
    try {
      const inputs = paths.map((p) => readPathFromEn(data, p));
      const results = await translateTexts(inputs, lang);
      let next = trData;
      paths.forEach((p, i) => {
        const v = results[i] ?? "";
        if (v) next = writePathToTr(next, p, v);
      });
      onApply(next);
      toast.success(`Translated ${paths.length} field${paths.length === 1 ? "" : "s"} to ${lang.toUpperCase()}`);
    } catch (e: any) {
      toast.error(e?.message || "Translation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-background/60 border">
      <Sparkles className="w-4 h-4 text-primary" />
      <span className="text-xs text-muted-foreground flex-1">
        Auto-translate with AI · {emptyPaths.length} empty / {allPaths.length} total
      </span>
      <Button size="sm" variant="outline" disabled={busy || allPaths.length === 0} onClick={() => run("all")}>
        {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
        Translate all
      </Button>
      <Button size="sm" disabled={busy || emptyPaths.length === 0} onClick={() => run("empty")}>
        {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
        Fill empty
      </Button>
    </div>
  );
}

/** Small ✨ button that translates one EN string and writes the result. */
function TranslateBtn({
  enValue,
  lang,
  onResult,
  disabled,
}: {
  enValue: string;
  lang: LangCode;
  onResult: (text: string) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const empty = !enValue || !enValue.trim();
  const run = async () => {
    if (empty) return;
    setBusy(true);
    try {
      const out = await translateOne(enValue, lang);
      onResult(out);
    } catch (e: any) {
      toast.error(e?.message || "Translation failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-7 w-7 shrink-0"
      onClick={run}
      disabled={busy || empty || disabled}
      title={empty ? "Nothing to translate" : `Auto-translate to ${lang.toUpperCase()}`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
    </Button>
  );
}

function SpecField({
  spec,
  lang,
  enData,
  trData,
  setTr,
}: {
  spec: string;
  lang: LangCode;
  enData: any;
  trData: any;
  setTr: (updater: (cur: any) => any) => void;
}) {
  const parsed = parseSpec(spec);
  const label = fieldLabel(spec);

  if (parsed.kind === "string") {
    const k = parsed.key;
    const enVal = String(enData?.[k] ?? "");
    return (
      <Field
        label={label}
        en={enVal}
        action={
          <TranslateBtn
            enValue={enVal}
            lang={lang}
            onResult={(v) => setTr((cur) => ({ ...cur, [k]: v }))}
          />
        }
      >
        <Input
          value={trData?.[k] ?? ""}
          onChange={(e) => setTr((cur) => ({ ...cur, [k]: e.target.value }))}
          placeholder={enVal}
        />
      </Field>
    );
  }

  if (parsed.kind === "nested") {
    const { key: k, sub: sk } = parsed;
    const enVal = String(enData?.[k]?.[sk] ?? "");
    return (
      <Field
        label={label}
        en={enVal}
        action={
          <TranslateBtn
            enValue={enVal}
            lang={lang}
            onResult={(v) =>
              setTr((cur) => ({ ...cur, [k]: { ...(cur?.[k] ?? {}), [sk]: v } }))
            }
          />
        }
      >
        <Input
          value={trData?.[k]?.[sk] ?? ""}
          onChange={(e) =>
            setTr((cur) => ({ ...cur, [k]: { ...(cur?.[k] ?? {}), [sk]: e.target.value } }))
          }
          placeholder={enVal}
        />
      </Field>
    );
  }

  if (parsed.kind === "stringArr") {
    const k = parsed.key;
    const enArr: string[] = enData?.[k] ?? [];
    const trArr: string[] = trData?.[k] ?? [];
    if (enArr.length === 0) return null;
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => (
          <Field
            key={i}
            label={`#${i + 1}`}
            en={enItem}
            action={
              <TranslateBtn
                enValue={enItem}
                lang={lang}
                onResult={(v) => setTr((cur) => {
                  const arr = [...(cur?.[k] ?? [])];
                  arr[i] = v;
                  return { ...cur, [k]: arr };
                })}
              />
            }
          >
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

  if (parsed.kind === "nestedStringArr") {
    const { key: k, sub: sk } = parsed;
    const enArr: string[] = enData?.[k]?.[sk] ?? [];
    const trArr: string[] = trData?.[k]?.[sk] ?? [];
    if (enArr.length === 0) return null;
    const writeAt = (i: number, v: string) =>
      setTr((cur) => {
        const inner = [...((cur?.[k]?.[sk]) ?? [])];
        inner[i] = v;
        return { ...cur, [k]: { ...(cur?.[k] ?? {}), [sk]: inner } };
      });
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => (
          <Field
            key={i}
            label={`#${i + 1}`}
            en={enItem}
            action={
              <TranslateBtn enValue={enItem} lang={lang} onResult={(v) => writeAt(i, v)} />
            }
          >
            {enItem.length > 80 ? (
              <Textarea
                rows={3}
                value={trArr[i] ?? ""}
                onChange={(e) => writeAt(i, e.target.value)}
                placeholder={enItem}
              />
            ) : (
              <Input
                value={trArr[i] ?? ""}
                onChange={(e) => writeAt(i, e.target.value)}
                placeholder={enItem}
              />
            )}
          </Field>
        ))}
      </div>
    );
  }

  if (parsed.kind === "itemField") {
    const { key: k, sub: sk } = parsed;
    const enArr: any[] = enData?.[k] ?? [];
    const trArr: any[] = trData?.[k] ?? [];
    if (enArr.length === 0) return null;
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => {
          const enVal = String(enItem?.[sk] ?? "");
          if (!enVal) return null;
          const trVal = trArr[i]?.[sk] ?? "";
          const useTextarea = enVal.length > 80;
          return (
            <Field
              key={i}
              label={`#${i + 1}`}
              en={enVal}
              action={
                <TranslateBtn
                  enValue={enVal}
                  lang={lang}
                  onResult={(v) => setTr((cur) => {
                    const arr = [...(cur?.[k] ?? [])];
                    arr[i] = { ...(arr[i] ?? {}), [sk]: v };
                    return { ...cur, [k]: arr };
                  })}
                />
              }
            >
              {useTextarea ? (
                <Textarea
                  rows={3}
                  value={trVal}
                  onChange={(e) => setTr((cur) => {
                    const arr = [...(cur?.[k] ?? [])];
                    arr[i] = { ...(arr[i] ?? {}), [sk]: e.target.value };
                    return { ...cur, [k]: arr };
                  })}
                  placeholder={enVal}
                />
              ) : (
                <Input
                  value={trVal}
                  onChange={(e) => setTr((cur) => {
                    const arr = [...(cur?.[k] ?? [])];
                    arr[i] = { ...(arr[i] ?? {}), [sk]: e.target.value };
                    return { ...cur, [k]: arr };
                  })}
                  placeholder={enVal}
                />
              )}
            </Field>
          );
        })}
      </div>
    );
  }

  if (parsed.kind === "itemStringArr") {
    const { key: k, sub: sk } = parsed;
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
                <Field
                  key={j}
                  label={`#${j + 1}`}
                  en={enS}
                  action={
                    <TranslateBtn
                      enValue={enS}
                      lang={lang}
                      onResult={(v) => setTr((cur) => {
                        const outer = [...(cur?.[k] ?? [])];
                        const inner = [...((outer[i]?.[sk]) ?? [])];
                        inner[j] = v;
                        outer[i] = { ...(outer[i] ?? {}), [sk]: inner };
                        return { ...cur, [k]: outer };
                      })}
                    />
                  }
                >
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

  if (parsed.kind === "itemObjField") {
    const { key: k, sub: sk, field: f } = parsed;
    const enArr: any[] = enData?.[k] ?? [];
    const trArr: any[] = trData?.[k] ?? [];
    if (!enArr.some((it) => Array.isArray(it?.[sk]) && it[sk].some((o: any) => String(o?.[f] ?? "").trim()))) return null;
    const setVal = (i: number, j: number, v: string) =>
      setTr((cur) => ({ ...cur, [k]: setItemObjField(cur?.[k], i, sk, j, f, v) }));
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{label}</Label>
        {enArr.map((enItem, i) => {
          const enList: any[] = Array.isArray(enItem?.[sk]) ? enItem[sk] : [];
          if (!enList.some((o) => String(o?.[f] ?? "").trim())) return null;
          return (
            <div key={i} className="border rounded p-2 space-y-1.5 bg-background/40">
              <div className="text-[11px] text-muted-foreground">#{i + 1} {String(enItem?.title ?? "")}</div>
              {enList.map((o, j) => {
                const enS = String(o?.[f] ?? "");
                if (!enS.trim()) return null;
                const trS = trArr[i]?.[sk]?.[j]?.[f] ?? "";
                return (
                  <Field
                    key={j}
                    label={`#${j + 1}`}
                    en={enS}
                    action={<TranslateBtn enValue={enS} lang={lang} onResult={(v) => setVal(i, j, v)} />}
                  >
                    {enS.length > 80 ? (
                      <Textarea rows={3} value={trS} onChange={(e) => setVal(i, j, e.target.value)} placeholder={enS} />
                    ) : (
                      <Input value={trS} onChange={(e) => setVal(i, j, e.target.value)} placeholder={enS} />
                    )}
                  </Field>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

function Field({
  label,
  en,
  action,
  children,
}: {
  label: string;
  en: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
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
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">{children}</div>
        {action}
      </div>
    </div>
  );
}
