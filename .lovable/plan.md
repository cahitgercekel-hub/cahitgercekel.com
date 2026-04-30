## Goal

Make the public site fully usable on mobile (≤700px) without changing anything visible at desktop widths. All work is scoped to `src/components/site/SiteRenderer.tsx` inside `@media (max-width: 700px)` (and a smaller-phone breakpoint at 420px). No desktop CSS rules are modified.

## Issues observed on mobile

1. Nav links (`About / Experience / Education / Projects / Contact`) are hidden via `display:none` with no replacement — there is no hamburger menu.
2. Hero buttons (`View Projects`, `Contact Me`, `Download CV`) wrap to different widths because text length differs, making them look mismatched.
3. Hero portrait floats next to the text awkwardly on small widths because the column collapses but the image still uses its desktop sizing.
4. Section padding, titles, and the "About" portrait/text grid feel cramped on phones.
5. Project cards, timeline, and contact grid don't always go single-column cleanly.
6. The collapsing-logo animation works on mobile but the nav itself never opens the menu, so navigation is unreachable.

## Plan

### 1. Hamburger menu (mobile only)

- Add a `menuOpen` React state in `SiteRenderer`.
- Render a hamburger button (`button.p-nav-burger` with three `<span>` bars) inside the nav, hidden on desktop (`display:none`) and shown only at `max-width: 700px`.
- When `menuOpen` is true, render a dropdown panel `div.p-mobile-menu` below the pill nav containing the same `nav_items` as a vertical list. Tapping a link sets `menuOpen=false`.
- The desktop `ul.p-nav-links` becomes `display:none` on mobile (already is); the burger + dropdown replace it.
- Clicking outside or scrolling closes the menu (simple `useEffect` listener).
- Animate the panel with a short `fade-in / slide-down` transition.
- Animate the burger bars into an "X" when open.

### 2. Hero section on mobile

Inside `@media (max-width: 700px)`:
- Reduce hero padding (`90px 20px 60px`).
- Stack content (already does at 800px); ensure image sits below the text and is centered with `max-width: 200px`.
- Make all three buttons (`.p-btn-primary`, `.p-btn-ghost`, `.p-btn-cv`) full-width inside `.p-btns` (`flex-direction: column; align-items: stretch`) so they're identical width and visually aligned. Each keeps its existing height/shadow.
- Reduce hero title to `clamp(2.4rem, 10vw, 3.2rem)` and sub text to `1.05rem`.

### 3. Sections / typography

- `.p-section` padding: `60px 20px` on mobile (already 70/24 — tighten and unify).
- `.p-title` font-size clamp tuned for small screens.
- `.p-about-grid` already collapses to one column; add `gap: 32px` and center the portrait with `max-width: 280px; margin: 0 auto`.

### 4. Cards / timeline / contact / languages

- `.p-projects` already auto-fits; ensure `minmax(0,1fr)` fallback so cards never overflow horizontally.
- `.p-timeline` left padding reduced to `20px` on mobile; dot offset adjusted.
- `.p-contact-grid` set to `grid-template-columns: 1fr` on mobile so all contact buttons stack uniformly full-width.
- `.p-lang-row` and `.p-stat-label` keep flex layout; just shrink font sizes.

### 5. Smaller phones (≤420px)

Add a second breakpoint with extra-tight paddings (`50px 16px`), smaller hero title, and `.p-hero-photo { max-width: 170px }`.

### 6. Safety

- All new rules live inside `@media (max-width: 700px)` and `@media (max-width: 420px)` so the desktop look is untouched.
- No changes to `BlockEditor`, data shape, or admin UI.

## Files to edit

- `src/components/site/SiteRenderer.tsx` — add `menuOpen` state, hamburger button + mobile dropdown JSX, and an expanded mobile media-query CSS block.

## Out of scope

- Admin editor mobile polish.
- Changing color theme or component structure.
- Desktop layout tweaks.