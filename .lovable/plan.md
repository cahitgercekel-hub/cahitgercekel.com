# Project status toggle + live-dot fix

## Problem
1. The blinking red "Live" dot has a radiating box-shadow ring that visually leaks above the button, overlapping the "Web App" pill sitting directly above it.
2. There's no way to mark a project as "in progress" or to show a custom status label instead of a Live link button.

## Changes

### 1. Project item schema (`src/components/admin/BlockEditor.tsx`)
In the `projects` block items schema, add two new fields right after the existing `openExternal` checkbox:

- `status` — select with options:
  - `live` — Live (red blinking dot + opens `link`)
  - `in_progress` — In Progress (🚧 emoji, no button)
  - `none` — None (shows `statusText`, no button)
- `statusText` — text input, used only when `status = none`

Update the item factory to default `status: "live"` and `statusText: ""`.

The existing `link` field stays — it's still used as the Live button target and as the card's external link when `openExternal` is on.

### 2. Detail page rendering (`src/pages/ProjectDetail.tsx`)
Replace the current Live anchor block with status-driven rendering:

```text
status = live          -> <a> red blinking dot + "Live" (current behavior, unchanged markup)
status = in_progress   -> <span class="p-pd-status">🚧 In Progress</span>  (no link)
status = none          -> <span class="p-pd-status">{statusText}</span>     (only if statusText set)
default (legacy items) -> behave as "live" if item.link exists, otherwise nothing
```

Extra ghost links from `item.links[]` keep rendering as before.

### 3. Live-dot pulse fix (`src/components/site/portfolioStyles.ts`)
The current `@keyframes p-pd-live-blink` animates `box-shadow: 0 0 0 6px rgba(239,68,68,0)` — that 6px ring radiates outward and visually crosses into the Web App pill above. Replace with a pure opacity blink (no box-shadow ring):

```css
.p-pd-live-dot { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; animation: p-pd-live-blink 1.2s ease-in-out infinite; }
@keyframes p-pd-live-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
```

Add a small style for the non-link status pill so it visually matches the row:

```css
.p-pd-status { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--p-radius); background: rgba(255,255,255,0.18); color: #fff; font-weight: 700; font-size: 0.92rem; backdrop-filter: blur(4px); }
```

### 4. i18n (`src/lib/i18n.ts`)
Add `items[].statusText` to the translatable per-item project paths so the custom "None" label can be auto-translated alongside subtitle/role/etc.

## Files touched
- `src/components/admin/BlockEditor.tsx` — schema + factory
- `src/pages/ProjectDetail.tsx` — render switch on `item.status`
- `src/components/site/portfolioStyles.ts` — calmer dot animation + `.p-pd-status` pill
- `src/lib/i18n.ts` — add `statusText` to translatable fields

No DB migration needed — everything stores in the existing `sections.data` JSONB.
