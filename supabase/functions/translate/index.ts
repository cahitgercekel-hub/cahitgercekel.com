// Auto-translate edge function using Lovable AI Gateway.
// Body: { texts: string | string[], target: "tr"|"de", source?: "en" }
// Returns: { translations: string[] } (always an array, same length as input)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated caller — this function consumes paid AI credits.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const target = String(body?.target ?? "");
    const source = String(body?.source ?? "en");
    const rawTexts = body?.texts;

    if (!LANG_NAMES[target]) {
      return new Response(JSON.stringify({ error: "Invalid target language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LANG_NAMES[source]) {
      return new Response(JSON.stringify({ error: "Invalid source language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inputArr: string[] = Array.isArray(rawTexts)
      ? rawTexts.map((t: any) => (typeof t === "string" ? t : ""))
      : [typeof rawTexts === "string" ? rawTexts : ""];

    if (inputArr.length === 0) {
      return new Response(JSON.stringify({ translations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (inputArr.length > 200) {
      return new Response(JSON.stringify({ error: "Too many texts (max 200 per call)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip empties — preserve their slots in the output
    const indexed = inputArr.map((t, i) => ({ i, t }));
    const toTranslate = indexed.filter((x) => x.t.trim().length > 0);

    if (toTranslate.length === 0) {
      return new Response(JSON.stringify({ translations: inputArr.map(() => "") }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceName = LANG_NAMES[source];
    const targetName = LANG_NAMES[target];

    const systemPrompt =
      `You translate a young professional's personal portfolio website from ${sourceName} to ${targetName}. ` +
      `Write the way a native ${targetName} speaker in tech and business actually talks today: natural, clear, ` +
      `everyday language, never stiff, literal or old-fashioned. A recruiter should not notice it was translated. ` +
      `Keep an English term only where ${targetName}-speaking professionals really use it untranslated: job titles ` +
      `and fields (Product Manager, Product Specialist, Product Management, UX Design), and words like workshop, ` +
      `hackathon, frontend, backend, UX, UI, startup, pitch, dashboard, roadmap, sprint, A/B test, Kanban. ` +
      (target === "de"
        ? `For "working student" use "Werkstudent" / "Werkstudentenstelle". `
        : `Keep "working student" in English. `) +
      `Everything else, including ordinary words such as ` +
      `product, project, user, team, feature or tool used as common nouns, goes into natural ${targetName}; ` +
      `never capitalize a common English word in the middle of a sentence. ` +
      `Preserve tone, punctuation, emoji, capitalization style, line breaks, Markdown markers (**, *) and any HTML tags exactly. ` +
      `Do NOT translate proper nouns: people's names, brand, product, project, school and company names ` +
      `(e.g. ABB, ITU, ITÜ, TUM, Lovable, GitHub, LinkedIn, Trip It, ONboard, City Wallet). Keep them exactly as written. ` +
      `Do NOT add explanations, prefixes, suffixes, or quotation marks. ` +
      `Each input string is translated separately: never merge or split strings. ` +
      `Return the translated strings via the provided tool, in the SAME order as the input, ` +
      `with EXACTLY ${toTranslate.length} items.`;

    const userPayload = JSON.stringify({ texts: toTranslate.map((x) => x.t) });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPayload },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_translations",
              description: "Return translated strings in input order.",
              parameters: {
                type: "object",
                properties: {
                  translations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Translated strings, same order and length as input.",
                  },
                },
                required: ["translations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_translations" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ error: "Translation service error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    let translated: string[] = [];
    try {
      const args = toolCall?.function?.arguments
        ? JSON.parse(toolCall.function.arguments)
        : {};
      if (Array.isArray(args?.translations)) translated = args.translations;
    } catch (e) {
      console.error("Failed to parse tool args:", e);
    }

    // Fallback: try plain content if tool call missing
    if (translated.length === 0) {
      const content = aiJson?.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed?.translations)) translated = parsed.translations;
        } catch { /* ignore */ }
      }
    }

    // Fill back into original positions, preserving empties + falling back to source
    const out = inputArr.map(() => "");
    toTranslate.forEach((x, idx) => {
      const v = translated[idx];
      out[x.i] = typeof v === "string" && v.length > 0 ? v : x.t;
    });

    return new Response(JSON.stringify({ translations: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("translate function crash:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
