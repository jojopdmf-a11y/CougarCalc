# Free tools connection (pending)

CougarCalc.com has two lanes:

1. **Paid Mac apps** (this repo’s marketing centerpiece)
2. **Free calculators** under `/audio-live-sound/` and `/guitar-building/`

Grokbot / the Calc team already built free-tool formulas and a 14-section calc chrome. Those are **not** in this repo yet.

## What we need from Grokbot

- Repo or export of live free tools (speaker-delay, fret-position, etc.)
- Locked **14-section** calc page order + safety visibility rules
- Any existing path map so we keep prefixes (`/audio-live-sound/*`, `/guitar-building/*`)
- Confirmation whether tools ship as:
  - ported React components into this Vite app, or
  - a submodule / package this site imports

## Placeholder routes already stubbed

- `/tools`
- `/audio-live-sound` (+ `/*`)
- `/guitar-building` (+ `/*`)

## When connecting

1. Drop or import the Calc pack.
2. Build shared `CalcShell` chrome using `src/styles/tokens.css` (apps cyan, not Phase 2 brass).
3. Port proof tools first: `speaker-delay`, `fret-position`.
4. Fill indexes; keep stubs muted (no fake CTAs).

Until then, stubs remind us not to invent calculator math.
