# Route map — priority pair

Port these into the live site. Trailing slash preferred (`trailingSlash: 'always'`).

## Live tools (this pack)

| Route | Page source in pack | Category |
| --- | --- | --- |
| `/audio-live-sound/speaker-delay/` | `src/pages/audio-live-sound/speaker-delay/index.astro` | Audio / live sound |
| `/guitar-building/fret-position-calculator/` | `src/pages/guitar-building/fret-position-calculator/index.astro` | Guitar building |

## Category hubs (stub indexes)

| Route | Page source |
| --- | --- |
| `/audio-live-sound/` | `src/pages/audio-live-sound/index.astro` |
| `/guitar-building/` | `src/pages/guitar-building/index.astro` |

## Locked URL prefixes
- `/audio-live-sound/*`
- `/guitar-building/*`

Do not invent a public hostname. Do not buy a domain as part of this port.

## Pure calc modules
- `src/calc/speaker-delay.ts` (+ `speaker-delay.test.ts`)
- `src/calc/fret-position.ts` (+ `fret-position.test.ts`)
- Shared: `units.ts`, `parse.ts`, `format.ts`

Canonical location is **`src/calc/`** (not `src/calcs/`). A duplicate `calcs/speaker-delay` existed in the reconstructed scaffold; this pack keeps one copy under `calc/`.

## Chrome / layout
- `src/layouts/ToolPageLayout.astro` — locked 14-section order; safety between lede and calculator
- `src/layouts/BaseLayout.astro` — imports `src/styles/tokens.css`
- `src/styles/tokens.css` — **starred apps-cyan** (`--accent: #00D8FF`), not Phase 2 brass
