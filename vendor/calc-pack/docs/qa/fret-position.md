# Formula QA — Fret position

**Date:** 2026-08-31 PST  
**Parent lock:** [`phase2-prototypes.md`](./phase2-prototypes.md)  
**Example 1 status:** **PASS** → **LOCKED** (both inch and mm rows)

## Research formula (do not invent)

From `research/guitar-recommendation.md` FG-01 and `research/fragments/fret-geo-candidates.md` FG-01:

```
d(n) = S × (1 − 1 / 2^(n/12))
     = S − S / 2^(n/12)
```

Sanity / Pass-fail: `d(12) = S/2` exactly (before compensation) → **Pass**.  
Do not round `d(12)` to force Pass. Inches display 3 dp; mm display 2 dp unless exact.

**GAP (docs only):** no dedicated file under `research/dossiers/` for fret; formula authority remains recommendation + fragments.

## Example 1a — 25.500 in

```
S     = 25.500 in
d(12) = 25.500 × (1 − 1/2) = 12.750 in
S/2   = 12.750 in → Pass
```

Spot checks: d(1) ≈ 1.431205 → **1.431**; d(22) ≈ 18.344304 → **18.344**.

Claimed: **12.750 Pass.** Match: **yes → PASS.**

## Example 1b — 650 mm

```
S     = 650 mm
d(12) = 650 / 2 = 325 mm → Pass
d(1)  ≈ 36.481697 → display 36.48 mm
```

Claimed: **325 Pass.** Match: **yes → PASS.**

Note: `25.500 × 25.4 = 647.7 mm` ≠ 650. Do not treat Fender 25.500 in and classical 650 mm as the same scale.

## Prototype evidence

- `prototype-shots/06-fret-25500-in.png` / crop: **12.750 in**, Pass  
- `prototype-shots/07-fret-650-mm.png`: **325** mm, Pass  
