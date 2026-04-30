# Portfolio Admin Upgrade Plan

## 1. Fix the "refresh on every keystroke" bug (highest priority)

**Cause:** In `src/components/admin/BlockEditor.tsx`, helper components like `ListEditor` and `Field` are **defined inside** the `BlockEditor` function body. Every keystroke triggers a re-render, which produces a brand-new component identity, so React unmounts and remounts every input → the input loses focus after each character.

**Fix:** Move `Field` and `ListEditor` out of the component body into stable module-level components (passing `data`/`onChange` as props). This restores normal typing behavior across every block editor.

## 2. File uploads (CV, profile photo, custom icons)

Create a public Supabase storage bucket `site-assets` with policies:
- Public `SELECT` (so visitors can view/download).
- `INSERT` / `UPDATE` / `DELETE` restricted to authenticated users with the `admin` role (uses existing `has_role` function).

Add a small reusable `<FileUploadField />` component used inside `BlockEditor`:
- "Upload" button → uploads to `site-assets/<folder>/<uuid>-<filename>`.
- Shows current URL + preview (image preview for images, filename for PDFs).
- Also accepts a manually pasted URL (so existing URL workflow keeps working).

## 3. Hero block additions

Extend hero schema:
- `image` (URL, with upload field) — shown on the right side of the hero on desktop, stacked on mobile.
- `cvUrl` (PDF, with upload field) + `cvLabel` (default "Download CV") — renders a third button in the hero button row that downloads the file (`<a href download>`).

Update `SiteRenderer` hero layout to a 2-column grid (text left, rounded image right) collapsing to 1 column under 800px.

## 4. New "Skills" block (pills, side-by-side)

Add a new block type `skills` to `src/lib/blocks.ts`:
```
{ id, label, title, groups: [{ name: "Design", items: ["Figma","Sketch"] }, ...] }
```
Renderer: each group shows a small heading and a wrapping row of pill-style chips (reuses existing `.p-skill` styling, with optional category headers).

Editor: group list with name + comma-separated items.

## 5. Re-purpose "Stat bars" → keep as-is, add a "Languages" block

Rather than break existing stat bars (used elsewhere), add a dedicated `languages` block:
```
{ id, label, title, items: [{ name: "English", level: "Native", value: 100 }] }
```
Renderer: clean rows with language name, level label (Native/Fluent/Intermediate/Basic), and a thin progress bar. Editor uses the existing list editor with a level dropdown.

We will also relabel the existing "Stat bars" entry in the Add menu to "Skill bars" for clarity, but keep the type for backward compatibility with current data.

## 6. Contact block — icon URLs

Update contact link schema: keep `icon` (emoji) but add `iconUrl` (image URL with upload field). Renderer prefers `iconUrl` if set (renders 20px image), otherwise falls back to emoji. This covers the LinkedIn / GitHub / mail icons from the uploaded screenshot.

## 7. More admin power-ups

- **Theme tab:** add font family dropdown (Inter, Poppins, Manrope, Space Grotesk, Playfair, Syne, DM Sans), border-radius slider (cards/buttons), nav style toggle (floating pill vs full-width).
- **Site settings:** add `site_title`, `meta_description`, `favicon_url` (with upload), `og_image_url` (with upload). `SiteRenderer` Helmet uses them.
- **Hero:** background type toggle — gradient (existing) or uploaded image with overlay opacity slider.
- **About block:** optional portrait image (upload).
- **Projects block:** add image upload per item (in addition to URL); add optional "Featured" toggle that highlights the card.
- **Navigation:** drag-to-reorder nav items.

## 8. Hide "Edit with Lovable" badge

Toggle the project's badge visibility setting to hidden so the badge no longer appears on the published site.

---

## Technical details

**Files to change**
- `src/components/admin/BlockEditor.tsx` — extract `Field`/`ListEditor` to module scope (focus fix); add upload fields; new editors for `skills`, `languages`; extend hero/contact/about/projects editors.
- `src/components/admin/FileUploadField.tsx` — new reusable upload + URL input component.
- `src/lib/blocks.ts` — add `skills` and `languages` block types, defaults, labels; extend hero/contact/about/projects defaults.
- `src/components/site/SiteRenderer.tsx` — render new blocks, hero image+CV button, contact iconUrl, theme font/radius, meta from settings, hero background image option.
- `src/pages/AdminEditor.tsx` — extend `ThemeEditor` (fonts, radius), add site meta editor (title/description/favicon/og), drag-to-reorder nav items.
- `src/hooks/useSite.ts` / `SiteSettings` type — extend with new fields.

**Database migrations**
- `ALTER TABLE site_settings ADD COLUMN font_family text DEFAULT 'Inter', radius int DEFAULT 14, site_title text, meta_description text, favicon_url text, og_image_url text;`
- Storage: create `site-assets` bucket (public), with admin-only write policies via `has_role(auth.uid(),'admin')`.

**Lovable settings**
- Set publish badge visibility to hidden.

No breaking changes to existing data; all new fields are optional with sensible fallbacks.
