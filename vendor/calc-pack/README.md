# CougarCalc calc-pack (drop folder)

**This is a drop folder only — NOT the live site.**  
Port into the site under `/audio-live-sound/` and `/guitar-building/`.

## What this is
Scaffold + formula modules for the **Phase 2 priority pair**:

1. **Speaker delay** → `/audio-live-sound/speaker-delay/`
2. **Fret position calculator** → `/guitar-building/fret-position-calculator/`

Plus shared chrome pieces (layouts, tokens, catalog, client/islands binders) needed to mount those two tools.

## Priority port
1. `speaker-delay`
2. `fret-position-calculator`

## Chrome (locked)
- **Tokens:** starred apps-cyan from `docs/tokens-apps-and-tools.md` / `docs/TOKENS.md` (`--accent: #00D8FF`). Reconstructed Phase 2 `tokens.css` was still brass (`#E8A54B`); this pack **rewrote** `src/styles/tokens.css` to cyan.
- **14-section tool page order** + **safety visibility** (under lede **and** on the result card). See `docs/ux-prototypes-excerpt.md`.
- **No product glow** on free-tool / calculator result cards (`--glow-cyan` is for home/app product cards only).
- Results win by **size**, not a second hue (`--result` = text color).

## Example locks (must still pass after port)
| Tool | Input | Expected |
| --- | --- | --- |
| Speaker delay | Path A **30 m**, Path B **20 m**, **20 °C**, Haas 0 | **29.1 ms**, **Delay path B** |
| Fret position | Scale **25.500 in**, 12-TET | **d(12) = 12.750** → **Pass** (`d(12) = S/2`) |

## How to port
1. Copy `src/styles/tokens.css` (cyan) into the site; do not revive brass.
2. Copy `src/calc/*` (pure functions + tests). Canonical path: `src/calc/` — do not revive a second `src/calcs/` copy.
3. Copy layouts / components / client / islands / pages for the two tools + category indexes.
4. Wire routes per `PATHS.md`.
5. Keep ToolPageLayout section order and both safety surfaces.
6. Run vitest on `speaker-delay.test.ts` and `fret-position.test.ts`.
7. See `package-hints.md` for Astro / Vitest deps (this folder is not a full node project).

## Source note
Reconstructed Phase 2 prototypes retuned to cyan (Holding/UX **2026-09-09**).  
Code base: `/workspace/cougarcalc/review/reconstructed/` (`.rej` / `.tmp.patch` / `node_modules` stripped). Empty formula stubs were filled from the matching Phase 2 transcript / from-transcript bodies so the pack is usable; pages/components prefer reconstructed non-empty files.

## Remaining 22 tools — NOT in this pack
The other tools live on **Origin**, not in this drop folder:

- Audio formula set: Origin commit **`505ed5c`**
- Guitar formula set: Origin commit **`2f32f0d`**
- Shared chrome: Origin commit **`15660e7`**

QA notes for those tools may exist under the main docs tree; this pack only ships `docs/qa/speaker-delay.md` and `docs/qa/fret-position.md` plus locked guitar formula notes for later ports.

## Docs in this pack
- `docs/tokens-apps-and-tools.md` — STARRED cyan system
- `docs/TOKENS.md` — paste-ready `:root`
- `docs/ux-prototypes-excerpt.md` — 14-section + safety (excerpt, not full UX file)
- `docs/guitar-formulas.md` — locked formulas for remaining guitar tools (reference)
- `docs/(architecture.md omitted from drop — see Origin / box docs)` — paths / module layout
- `docs/qa/speaker-delay.md`, `docs/qa/fret-position.md`

## Do not
- Push git from this pack
- Treat this as production
- Dual-brand (brass + cyan)
- Put product glow on calc result cards


## Omitted from this drop
- `docs/architecture.md` (large) — keep on box / Origin; not required to port speaker-delay + fret.
