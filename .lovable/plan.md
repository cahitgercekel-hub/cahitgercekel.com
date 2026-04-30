# Smooth scroll for nav anchors

## Problem
Clicking nav links like "Projects" or "Contact" jumps instantly (or worse, triggers a route change) instead of smoothly scrolling to the section. Two causes:

1. In `SiteChrome.tsx`, hash links are rendered as `href="/#projects"` — when already on `/`, browsers do an instant jump; on other routes it's a full navigation.
2. There's no smooth-scroll behavior configured, and no offset for the sticky `.p-nav` header (the section title would slide under the nav).

## Fix

### 1. Intercept anchor clicks (desktop + mobile menu) in `src/components/site/SiteChrome.tsx`
- Add a `handleNavClick(href)` helper. If `href` starts with `#` (or `/#`), prevent default, find the target element by id, and call `window.scrollTo({ top: el.offsetTop - NAV_OFFSET, behavior: "smooth" })`.
- If we're not on `/`, navigate to `/` first (via `useNavigate`) and then scroll after a tick.
- Update `history.pushState` so the URL hash reflects the section.
- Close the mobile menu on click (already handled, keep it).

### 2. Apply to both nav lists
- Desktop `<ul className="p-nav-links">` and mobile `<ul className="p-mobile-menu">` — both map nav items.

### 3. Add CSS scroll-margin for sections in `src/components/site/portfolioStyles.ts`
- Add `.portfolio-root section[id] { scroll-margin-top: 80px; }` as a safety net (also helps when users land via a hash URL or use browser back/forward).
- Add `html { scroll-behavior: smooth; }` so the existing "Back to top" button and any direct hash-URL loads also animate.

### 4. Keep "Back to top" buttons as-is
They already use `behavior: "smooth"` — no change needed.

## Files to edit
- `src/components/site/SiteChrome.tsx` — add click handler, wire to both nav lists.
- `src/components/site/portfolioStyles.ts` — add `scroll-margin-top` and `scroll-behavior: smooth`.

## Out of scope
- Active-section highlighting in the nav (can be added later if wanted).
- Animating section reveal on scroll.
