# Portfolio + Admin Page Builder

A public portfolio at `cahitgercekel.com` styled like the uploaded mockup, with a private `/admin` editor where you (and only you) can add/edit/remove sections, blocks, text, images (via URL), and links. Everything renders dynamically from the database, so changes appear instantly on the live site.

## What you get

### Public site (`/`)
- Sticky pill navigation with your name/logo and section links
- Sections rendered dynamically from your database in the order you set
- Default sections seeded to match the mockup: Hero, About, Skills/Stats, Projects, Experience, Contact links, Footer
- Smooth scroll, responsive layout, gradient hero, accent colors
- No contact form (per your choice) — only contact links (email, LinkedIn, GitHub, X, etc.)
- Fonts: Syne (headings), DM Sans (body), matching the mockup

### Admin (`/admin`)
- Login page (email + password). No public sign-up — your account is the only one allowed; anyone else gets blocked
- Dashboard listing all sections with drag-to-reorder
- "Add section" menu with block types:
  - **Hero** — tagline, title, subtitle, two buttons (label + link)
  - **Text/About** — rich paragraphs + skill tags
  - **Stat bars** — list of {label, percentage}
  - **Project grid** — cards with {tag, title, description, image URL, link, emoji/icon}
  - **Timeline / Experience** — items with {period, role, company, description}
  - **Contact links** — list of {icon, label, URL}
  - **Custom HTML/Markdown block** — for anything off-template
  - **Footer** — text + copyright
- Per-section controls: edit, duplicate, hide/show, delete, move up/down
- Theme tab: edit accent colors, background, hero gradient
- Navigation tab: edit logo text and which sections appear in the menu
- All edits save to the database; live site updates on next refresh

### Domain & login
- After build, you connect `cahitgercekel.com` in Project Settings → Domains (you'll add DNS records at your registrar)
- First visit to `/admin` lets you create your admin account; the email you sign up with becomes the only allowlisted admin. Further sign-ups are disabled.

## Page structure

```text
/                → Public portfolio (renders sections from DB)
/admin           → Login page (if signed out) or editor (if signed in & allowlisted)
/admin/login     → Email + password form
/admin/editor    → Section list, block editors, theme & nav tabs
*                → 404
```

## Data model (Lovable Cloud)

- `sections` — id, type, position, visible, data (JSON for that block type)
- `site_settings` — singleton row: logo text, theme colors, hero gradient, nav items
- `admin_allowlist` — emails allowed to access /admin (seeded with your email on first sign-up)
- `user_roles` + `has_role()` function — standard secure role pattern; `/admin` checks `has_role(uid, 'admin')`
- Row-Level Security:
  - Public can `SELECT` `sections` (only `visible=true`) and `site_settings`
  - Only admins can `INSERT/UPDATE/DELETE` anything

## Out of scope (can add later)
- Image file uploads (you chose URL-only — paste links from Imgur, your CDN, etc.)
- Contact form / inbox (you chose to remove it)
- Multi-user / collaborator accounts
- Blog / multi-page content beyond the single portfolio

## Next step
Approve this plan and I'll switch to build mode: enable Lovable Cloud, create the database tables and auth, build the public renderer, then build the admin editor. After it's running you can connect your domain.