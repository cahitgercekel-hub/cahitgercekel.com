import { supabase } from "@/integrations/supabase/client";

export type TargetLang = "tr" | "de";

/**
 * Translate one or more strings from English to the target language via the
 * `translate` edge function (Lovable AI Gateway).
 *
 * Returns an array of translations the SAME LENGTH as the input, with empty
 * inputs preserved as empty strings. Throws on hard failure with a friendly
 * message suitable for a toast.
 */
export async function translateTexts(
  texts: string[],
  target: TargetLang
): Promise<string[]> {
  if (!texts || texts.length === 0) return [];

  // The model tends to split multi-paragraph strings into several entries,
  // which shifts every later translation onto the wrong field. Send each line
  // as its own entry (in small batches) and join the lines back afterwards.
  const lines = texts.map((t) => String(t ?? "").split("\n"));
  const flat = lines.flat();
  const translatedFlat: string[] = [];
  for (let i = 0; i < flat.length; i += BATCH_SIZE) {
    translatedFlat.push(...(await invokeTranslate(flat.slice(i, i + BATCH_SIZE), target)));
  }
  let pos = 0;
  return lines.map((ls) => ls.map(() => translatedFlat[pos++] ?? "").join("\n"));
}

const BATCH_SIZE = 60;

async function invokeTranslate(texts: string[], target: TargetLang): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("translate", {
    body: { texts, target, source: "en" },
  });

  if (error) {
    // supabase-js wraps non-2xx into FunctionsHttpError
    const ctx: any = (error as any).context;
    let serverMsg = "";
    try {
      const txt = await ctx?.text?.();
      if (txt) {
        try { serverMsg = JSON.parse(txt)?.error ?? ""; } catch { serverMsg = txt; }
      }
    } catch { /* ignore */ }
    throw new Error(serverMsg || error.message || "Translation failed");
  }

  if (data?.error) throw new Error(String(data.error));

  const out = (data as any)?.translations;
  if (!Array.isArray(out)) throw new Error("Invalid response from translator");
  return out as string[];
}

/** Convenience for a single string. Returns "" if input is empty. */
export async function translateOne(text: string, target: TargetLang): Promise<string> {
  if (!text || !text.trim()) return "";
  const [out] = await translateTexts([text], target);
  return out ?? "";
}
