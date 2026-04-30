## Goal

Add a floating EN / TR / DE language switcher pill (frosted-glass to match the navbar) and let the admin store TR + DE translations for each text field on every block. The site renders the picked language and falls back to EN.

## What you'll see on the site

- A pill fixed at the bottom-right of the viewport, always visible while scrolling.
- Three buttons inside it: `EN` `|` `TR` `|` `DE`. Active one is bold + accent color, dividers are subtle vertical lines.
- Same blurred glass background, border, and shadow as the navbar pill — feels like part of the same UI family.
- On mobile (≤700px): the floating pill is hidden, and the same switcher is rendered centered at the bottom of the hamburger menu in a slightly smaller font.
- The chosen language persists in `localStorage` so it sticks across reloads.

## What changes in the admin

- A new "Translations" panel inside every block's edit dialog (collapsible, below the existing fields).
- For each translatable field on that block (title, label, paragraphs, button labels, project descriptions, contact labels, intro, footer, hero name/subtitle/tag, etc.), we show a TR input and a DE input. EN is the existing field — no duplication.
- Translations are stored on the same `sections.data` row under `data.i18n = { tr: {...}, de: {...} }`. No DB schema change needed (it's already `jsonb`).
- Site settings (logo text, footer text, nav item labels) get the same TR/DE inputs in the Navigation and Theme tabs.
- Empty translation = falls back to EN automatically.

## Technical implementation

### 1. Language context

New file `src/contexts/LanguageContext.tsx` exporting:
- `LanguageProvider` (wraps `<App />`, reads from `localStorage.lang`, defaults to `"en"`).
- `useLang()` returning `{ lang, setLang }`.
- Helper `tr(value, i18n, lang)` that returns `i18n?.[lang]?.[key]` if non-empty, else `value`. We'll use a slightly different shape — `pickI18n(data, lang)` returns a shallow-merged object so the renderer keeps using `d.title` etc. without per-field branching.

### 2. Renderer changes (`src/components/site/SiteRenderer.tsx`)

- Inside `RenderBlock`, build `const d = mergeI18n(section.data, lang);` so all existing reads (`d.title`, `d.paragraphs`, `d.items[i].title`, etc.) automatically use the translated value when present. For arrays (paragraphs, items, links, languages, stats, skills, groups), we merge index-by-index — if `i18n.tr.items[2].title` exists, only that field overrides; otherwise EN value stays.
- Add the floating pill JSX at the end of the root div: `<div className="p-lang-pill">…</div>`. Hidden on mobile via the existing `@media (max-width: 700px)` block.
- Inside the mobile menu (`.p-mobile-menu`), append a centered `<div className="p-lang-mobile">EN | TR | DE</div>` after the nav links.
- Translate `settings.logo_text`, `settings.footer_text`, and `settings.nav_items[i].label` the same way (read from `settings.i18n`).

### 3. Block defaults & schema (`src/lib/blocks.ts`)

- Extend `SiteSettings` and `SectionRow.data` types with optional `i18n?: { tr?: any; de?: any }`. No default values needed — absent = falls back to EN.
- No new BlockType.

### 4. Admin editor (`src/components/admin/BlockEditor.tsx`)

- Add a `<TranslationsPanel type={type} data={data} onChange={onChange} />` rendered by `withLayout` below the existing `LayoutEditor`.
- The panel has a `Tabs` (TR / DE). For each language it renders the same form fields as EN but bound to `data.i18n[lang]`. To avoid duplicating every block's schema, we declare a small `TRANSLATABLE_FIELDS: Record<BlockType, FieldSpec[]>` map listing which keys are translatable per block (e.g. hero → `tag, name, subtitle, cvLabel, primaryBtn.label, secondaryBtn.label`; projects → `label, title, items[].tag/title/description`; etc.). Non-text fields (images, URLs, colors, numbers, focal points, layout) are NEVER translated.
- Empty TR/DE field stores `""` which the merger treats as missing → EN fallback.

### 5. Settings translations (`src/pages/AdminEditor.tsx`)

- In `NavEditor`: under each nav link, two small TR / DE inputs for the label. Logo text gets TR / DE inputs too.
- In `ThemeEditor`: footer text gets TR / DE inputs.
- All saved into `site_settings.i18n` (jsonb on existing `theme` row is wrong — we'll write to a new top-level key in the same row by extending the update payload; since `site_settings` already accepts arbitrary jsonb on `theme` we'll instead store `site_settings.theme.i18n` to avoid a schema migration). Actually cleaner: add a new `i18n jsonb` column via migration.

### 6. Database migration

```sql
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS i18n jsonb NOT NULL DEFAULT '{}'::jsonb;
```

`sections.data` is already `jsonb` so block translations need no migration.

### 7. Styling (added to existing `<style>` block in SiteRenderer)

- `.p-lang-pill`: `position: fixed; bottom: 20px; right: 20px; z-index: 95;` + same `backdrop-filter`, border, and shadow recipe as `nav.p-nav`. Padding `8px 14px`, rounded full.
- Buttons: small uppercase mono font, `var(--p-fg)` with 0.55 opacity; active = full opacity + `var(--p-accent)` + bold.
- Dividers: thin `|` spans at 0.3 opacity.
- Mobile: `.p-lang-pill { display: none; }` and `.p-lang-mobile { display: flex; justify-content: center; gap: 10px; padding: 14px 0 4px; font-size: 0.78rem; }`.

## Files to edit / create

- `src/contexts/LanguageContext.tsx` (new)
- `src/App.tsx` — wrap routes in `<LanguageProvider>`
- `src/lib/blocks.ts` — extend types, add `TRANSLATABLE_FIELDS` map + `mergeI18n` helper (or place helper in a small `src/lib/i18n.ts`)
- `src/components/site/SiteRenderer.tsx` — merge translations, render pill + mobile switcher, CSS
- `src/components/admin/BlockEditor.tsx` — translations panel
- `src/pages/AdminEditor.tsx` — translation inputs in NavEditor and ThemeEditor
- Migration: add `i18n` column to `site_settings`

## Out of scope

- Auto-translating existing content (admin fills TR/DE manually).
- Translating block IDs, anchor links, image alt text, or URLs.
- RTL languages.
- Browser-language auto-detection (always defaults to EN; user picks once and it sticks).
