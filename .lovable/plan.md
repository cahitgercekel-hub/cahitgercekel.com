## Goal

Add an "Auto-translate" button next to every translatable field (and one master button per language tab) in the admin editor. Clicking it sends the English value(s) to a new edge function that calls Lovable AI Gateway (Gemini 2.5 Flash) and fills the TR / DE inputs automatically. The user can still edit the result before saving.

## What you'll see in the admin

- Inside the existing "Translations (TR / DE)" panel on each block, every translation field (title, paragraph, button label, project description, etc.) gets a small ✨ icon button on the right.
  - Click it → that single field is translated from EN to the active tab's language and dropped into the input.
  - While running it shows a spinner and is disabled.
- At the top of each language tab there's a primary "Auto-translate all empty fields" button.
  - Only fills fields that are currently empty (so user edits aren't overwritten).
  - One batched request per click — fast and uses fewer credits than per-field clicks.
- Same buttons added to the Navigation editor (logo + nav link labels) and Theme editor (footer text).
- A toast confirms success or surfaces rate-limit / credit errors clearly.

## What runs on the backend

A new edge function `supabase/functions/translate/index.ts`:

- POST body: `{ texts: string | string[], target: "tr"|"de", source?: "en" }`
- Calls Lovable AI Gateway: `https://ai.gateway.lovable.dev/v1/chat/completions`, model `google/gemini-2.5-flash`, with `response_format: { type: "json_object" }` so we get a strict `{ translations: [...] }` back.
- Uses the auto-injected `LOVABLE_API_KEY` env var — no user secret needed.
- System prompt forbids translating proper nouns (people, brands like ABB, ITU, TUM), preserves emoji/punctuation/HTML, returns array in original order.
- Empty strings are preserved as empty (skipped from the model call).
- Handles 429 (rate limit) and 402 (credits depleted) with friendly messages.
- `verify_jwt = false` not needed because admin routes already require auth — but the function itself doesn't check the user is an admin. Since calling it just costs gateway credits and only authenticated users with the URL would hit it from the admin UI, that's acceptable. If we want stricter, we can add `verify_jwt = true` (default) and pass the session token from the client. **Default behavior**: keep verify_jwt on (default), client invokes via `supabase.functions.invoke` which already includes the auth header.

## Frontend wiring

New helper `src/lib/translate.ts`:

```ts
export async function translateTexts(texts: string[], target: "tr"|"de"): Promise<string[]>
```

Wraps `supabase.functions.invoke("translate", { body: { texts, target } })` and returns the translations array (or throws with the toast-friendly message).

Updated files:

- `src/components/admin/TranslationsPanel.tsx`
  - Header gets an "Auto-translate empty fields" button per tab. It walks `TRANSLATABLE_FIELDS[type]`, collects every English value whose current TR/DE counterpart is empty, sends them in one request, and writes results back into the same paths.
  - Each `<SpecField>` gets a small `<TranslateButton>` (Sparkles icon) that translates just that one value. For string-array specs (paragraphs, items[].description, etc.), every row gets its own button.
- `src/pages/AdminEditor.tsx`
  - `NavEditor`: Sparkles button next to each TR / DE input (logo and per-link label) plus a "Translate all" button.
  - `ThemeEditor`: Sparkles button on the TR / DE footer inputs.

## Files to add / edit

- **new** `supabase/functions/translate/index.ts` — the edge function
- **new** `src/lib/translate.ts` — typed client helper
- **edit** `src/components/admin/TranslationsPanel.tsx` — per-field + bulk buttons
- **edit** `src/pages/AdminEditor.tsx` — buttons in `NavEditor` and `ThemeEditor`

No database migrations. No new secrets — `LOVABLE_API_KEY` is already configured. Edge function deploys automatically.

## Out of scope

- Translating images, URLs, anchor IDs, colors, focal points, numeric stat values.
- Detecting the source language automatically (we always assume EN as source — matches the current admin convention).
- Caching translations between sessions.
- Auto-translating on save (it stays a manual button so the admin reviews output).
