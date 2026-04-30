## Goal

Each project on the home grid becomes a clickable card that opens its own page at `/<slug>`, showing extended content (description, gallery, links, optional case study), and ending with a contact section.

## Routing

- New route `/:slug` in `src/App.tsx` → new page `src/pages/ProjectDetail.tsx`. Placed **after** the existing fixed routes (`/`, `/admin`, `/admin/login`) so they always win.
- Reserved slugs (`admin`, `auth`, `login`, etc.) are blocked in the editor with a validation message and skipped at runtime (falls through to `NotFound`).
- Slug source: a new `slug` field on each project item in the `projects` block. If empty, auto-derive from `title` (kebab-case, deduped). The page looks up the project by matching `slug` (or derived slug) across all `projects` blocks in `sections`.
- Unknown slug → existing `NotFound` page.

## Project item data model (extends current schema)

Backwards-compatible additions to each project item:

- `slug` — URL slug (auto-derived from title if blank)
- `subtitle` / `client` — short line under title
- `role`, `year`
- `tech[]` — chips/tags shown on the detail page
- `longDescription` — paragraphs (split on blank lines)
- `gallery[]` — `{ src, alt, caption, focal }`
- `iconUrl` — square icon for the detail header
- `links[]` — `{ label, href }` (Live site, Repo, Figma, …)
- `caseStudy` — `{ enabled, sections: [{ heading, body, image? }] }`
- `metrics[]` — `{ label, value }` KPI cards
- `contactOverride` — optional `{ enabled, intro, links[] }`. If disabled, the page reuses the site's `contact` section.
- `openExternal` — when true and `link` set, the home card links out instead of opening the detail page.

The home grid keeps its current fields/look.

## Home grid behavior

In `SiteRenderer.tsx` `case "projects"`:

- Wrap each card in `<Link to={\`/${slug}\`}>` unless `openExternal && link`, in which case it stays an `<a href>`.
- Relabel the affordance to "Open case study →" when `caseStudy.enabled`, otherwise "View →".

## ProjectDetail page

Reuses the same theme tokens, fonts, header, hamburger, language pill and footer as the home page. Implementation: extract a `<SiteChrome>` wrapper from `SiteRenderer.tsx` (header + footer + language pill + injected `<style>` block) and have both `Index` and `ProjectDetail` use it.

Sections, in order:

1. **Hero** — back link ("← Projects" → `/#projects`), eyebrow (`tag`), `iconUrl` + `title`, `subtitle`, meta row (`role` · `client` · `year`), primary `links` as buttons.
2. **Cover image** — main `image`, large, rounded, respects `focal`.
3. **Overview** — `longDescription` paragraphs + `tech[]` chips.
4. **Metrics** — KPI grid (only if `metrics` provided).
5. **Gallery** — responsive image grid with captions.
6. **Case study** — only when `caseStudy.enabled`; alternating text/image rows.
7. **Contact** — `contactOverride` if enabled, else the site's existing `contact` section data.

All text fields go through `mergeI18n` / `translateString` so TR/DE keep working.

## Admin editor changes (`BlockEditor.tsx`, `projects` case)

Extend the `ListEditor` schema with the new fields, grouped behind a collapsible "Detail page" panel per item to keep the form manageable:

- Basic (current): tag, title, description, image, emoji, link, featured, plus new `openExternal` checkbox.
- Detail page (new): slug (with reserved-slug validation), subtitle, role, client, year, iconUrl, tech (string list), longDescription (textarea), links (sub-list), gallery (sub-list), metrics (sub-list), caseStudy.enabled + caseStudy.sections (sub-list), contactOverride.enabled + intro + links.

Add a minimal nested-list capability to `ListEditor` if not already present (used for gallery / links / metrics / case-study sections).

Translations panel: add new translatable paths (`items[].subtitle`, `items[].longDescription`, `items[].role`, `items[].client`, `items[].tech[]`, `items[].links[].label`, `items[].gallery[].caption`, `items[].metrics[].label`, `items[].caseStudy.sections[].heading`, `items[].caseStudy.sections[].body`, `items[].contactOverride.intro`, `items[].contactOverride.links[].label`) to `TRANSLATABLE_FIELDS` in `src/lib/i18n.ts` so auto-translate covers them.

## SEO

`ProjectDetail` sets `<Helmet>` with `title = "<project title> — <site title>"`, `meta description = subtitle || description`, and `og:image = image`.

## Files to change

- `src/App.tsx` — add `/:slug` route at the end.
- `src/pages/ProjectDetail.tsx` — new page.
- `src/components/site/SiteChrome.tsx` — shared header/footer/lang pill + global styles.
- `src/components/site/SiteRenderer.tsx` — wrap project cards in `<Link>`, use shared chrome.
- `src/lib/blocks.ts` — extend `BLOCK_DEFAULTS.projects.items[0]` with new optional fields + reserved-slug list.
- `src/components/admin/BlockEditor.tsx` — extended editor for projects.
- `src/components/admin/TranslationsPanel.tsx` & `src/lib/i18n.ts` — add new translatable paths.

No DB migration required — everything fits inside the existing `sections.data` JSONB.

## Out of scope

- Per-project URL aliases beyond `slug`.
- Comments / likes / view counts.
- Admin reordering of detail-page sections (fixed order above).
