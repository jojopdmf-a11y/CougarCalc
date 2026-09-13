# Free tools

CougarCalc.com has two lanes:

1. **Paid Mac apps** (this repo’s marketing centerpiece)
2. **Free calculators** under `/audio-live-sound/` and `/guitar-building/`

Drop pack: `vendor/calc-pack/`. Ported into the live site; do not treat the drop folder as production.

## Live now

| Route | Tool | Lock |
| --- | --- | --- |
| `/audio-live-sound/speaker-delay` | Speaker delay | Path A 30 m, Path B 20 m, 20 °C, Haas 0 → **29.1 ms**, Delay path B |
| `/guitar-building/fret-position-calculator` | Fret position | Scale 25.500 in, 12-TET → **d(12) = 12.750**, Pass |

Formulas live in `src/calc/` (copied from the pack). Tests: `npm test`.

## Remaining tools

Named on the category indexes, muted until ported. Formula sets stay on Origin (see `vendor/calc-pack/README.md`).

## Chrome

- 14-section tool page order in `CalcShell`
- Safety under the lede **and** on the result card
- Apps cyan tokens; no product glow on calc result cards
