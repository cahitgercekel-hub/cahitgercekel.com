# Project card pills + 2-up grid

## Changes

### 1. Card pills (admin)
`src/components/admin/BlockEditor.tsx` — in the `projects` block items schema, add a new CSV field right after `description`:
- `pills` — "Card pills (comma separated, shown under description)" — type `csv`

Update the item factory to include `pills: []`.

### 2. Render pills on the card
`src/components/site/SiteRenderer.tsx` — inside the project card, after `<p>{it.description}</p>` and before the CTA, render:

```tsx
{Array.isArray(it.pills) && it.pills.length > 0 && (
  <div className="p-card-pills">
    {it.pills.map((p, idx) => <span key={idx} className="p-card-pill">{p}</span>)}
  </div>
)}
```

### 3. Grid: at least 2 cards, max 2 per row
`src/components/site/portfolioStyles.ts` — change the projects grid so it always shows 2 columns on desktop/tablet and scales the cards accordingly. Replace the `auto-fill, minmax(280px, 1fr)` rule with a fixed 2-column grid:

```css
.p-projects { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
```

The existing mobile rule (`grid-template-columns: 1fr` at ≤700px) keeps single-column on phones.

Add styles for the new pills:
```css
.p-card-pills { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 14px; }
.p-card-pill { display: inline-block; padding: 4px 10px; border-radius: 100px; background: rgba(0,0,0,0.06); color: var(--p-fg); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2px; }
```

Card thumb height may want a small bump now that cards are wider — leave it as-is unless it looks off.

### 4. i18n
`src/lib/i18n.ts` — add `items[].pills[]` to the projects translatable paths so pills auto-translate alongside description.

## Files touched
- `src/components/admin/BlockEditor.tsx`
- `src/components/site/SiteRenderer.tsx`
- `src/components/site/portfolioStyles.ts`
- `src/lib/i18n.ts`

No DB migration — stored in existing `sections.data` JSONB.
