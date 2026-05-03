# Personal Portfolio

A fully editable personal portfolio site with an in-app admin editor, multi-language support (EN / TR / DE) with AI auto-translation, and a fully themeable layout system.

Built on [Lovable](https://lovable.dev) with Vite + React + TypeScript and a managed Postgres backend (Lovable Cloud).

## Live

- **Site:** https://cahitgercekel.com
- **Mirror:** https://admin-muse-kit.lovable.app

## Features

- **Block-based content editor** — every section (hero, about, work experience, projects, skills, languages, contact, etc.) is rendered from data in the database and edited from `/admin`.
- **Drag-and-drop** reordering for sections, work experience entries, projects, and list items.
- **Multi-language site** — English, Turkish, and German, with one-click AI auto-translate powered by Gemini API.
- **Animated UI**
  - Scroll-triggered language proficiency bars (play once per page load)
  - `BorderGlow` skill pills with cursor-aware glow (perf-tuned for many pills)
  - `SplitText`, `RotatingText`, and `DotGrid` background effects
- **Theming & layout controls** — fonts, colors, radii, spacing, background images, all editable from the admin UI.
- **File uploads** for images / favicon / OG image, served from managed cloud storage.
- **Role-based admin** — admin access gated by a `user_roles` table and a `has_role()` security-definer function (no client-side role flags).

## Tech stack

- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS v3, shadcn/ui, TanStack Query, React Router, react-helmet-async
- **Animation:** GSAP, Motion, OGL, dnd-kit
- **Backend:** Lovable Cloud (managed Supabase) — Postgres + Row Level Security, Storage, Edge Functions
- **AI:** Lovable AI Gateway (Google Gemini API) for translation

## Project structure

```
src/
  pages/                 # Index, AdminEditor, AdminLogin, ProjectDetail, NotFound
  components/
    site/                # Public site renderer + visual effects (BorderGlow, DotGrid, …)
    admin/               # Admin editor (BlockEditor, LayoutEditor, TranslationsPanel, …)
    ui/                  # shadcn/ui primitives
  hooks/                 # useSite, useAdmin, …
  contexts/              # LanguageContext
  integrations/supabase/ # Auto-generated client + types (do not edit)
  lib/                   # blocks, i18n, translate, utils
supabase/
  functions/translate/   # Edge function: AI auto-translate
  config.toml
```

## Getting started (local)

Requires Node 18+ (or [Bun](https://bun.sh)).

```bash
# 1. Install dependencies
npm install        # or: bun install

# 2. Run the dev server
npm run dev        # http://localhost:8080
```

### Environment variables

The repo includes a `.env` with the Supabase project URL and **publishable anon key**:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

These are **public by design** — they ship to every browser and are protected server-side by Row Level Security policies. They are safe to commit. All sensitive secrets (e.g. `LOVABLE_API_KEY` used by the `translate` edge function) live in Lovable Cloud and are never present in this repo.

## Admin editor

1. Visit `/admin/login` and sign in.
2. Your user must have an `admin` role in the `user_roles` table.
3. The editor lets you:
   - Toggle, reorder, and edit any section
   - Drag-and-drop list items (work experience, projects, skills, etc.)
   - Manage translations per language with AI auto-translate
   - Adjust theme, fonts, layout, and per-section visual settings (e.g. BorderGlow intensity / colors on skill pills)

Changes save to the database and are reflected on the public site immediately.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Production build                      |
| `npm run preview` | Preview the production build          |
| `npm run lint`    | Run ESLint                            |
| `npm run test`    | Run Vitest once                       |

## Editing the project

You can work on this project in three ways and they stay in sync:

- **Lovable** — open the [project](https://lovable.dev/projects/743e1031-77d7-40ac-a7b7-f31aa04d99c8) and prompt changes. Edits commit back to this repo automatically.
- **Local IDE** — clone, edit, push. Changes sync back to Lovable.
- **GitHub Codespaces / web editor** — edit files directly on GitHub.

## Deployment

The simplest option is Lovable's built-in **Publish** (Share → Publish in the Lovable editor). You can also point a custom domain to it (Project → Settings → Domains).

Because the build output is a standard Vite SPA, the repo is portable — it can also be deployed to Vercel, Netlify, Cloudflare Pages, or any static host, as long as the `VITE_SUPABASE_*` env vars are set at build time.

## Security notes

- No private keys or secrets are stored in this repo.
- The `.env` only contains the Supabase publishable anon key, which is meant to be public.
- All write operations are protected by Postgres Row Level Security policies; admin-only writes are gated by `has_role(auth.uid(), 'admin')`.
- Server-only secrets (AI gateway keys, etc.) live in Lovable Cloud's secret manager and are injected into edge functions at runtime.
