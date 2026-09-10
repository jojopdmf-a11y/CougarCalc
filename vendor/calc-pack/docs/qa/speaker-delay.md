# Formula QA — Speaker delay

**Date:** 2026-08-31 PST  
**Parent lock:** [`phase2-prototypes.md`](./phase2-prototypes.md)  
**Example 1 status:** **PASS** → **LOCKED**

## Research formula (do not invent)

From `research/dossiers/audio-speaker-delay.md` § Formulas (also `audio-speed-of-sound.md`, `audio-recommendation.md` tool 1):

```
c ≈ 331.3 + 0.6 × T_C          m/s   (Sengpiel simplified)
delay_ms = 1000 × |r_A − r_B| / c
```

Delay the closer (earlier) path. Display ms to 1 decimal (display-only).

## Example 1 — independent working

Path A 30 m, Path B 20 m, 20 °C, Haas off, latencies 0, 48 kHz.

```
c        = 331.3 + 0.6×20 = 343.3 m/s
Δr       = 10 m
delay_ms = 10000 / 343.3 = 29.129041654529566… ms
display  = 29.1 ms
channel  = B (closer)
farther  = A
samples  = delay_ms × 48 = 1398.193999417419… (nearest 1398; not from 29.1)
```

Claimed: **Delay path B 29.1 ms.** Match: **yes → PASS.**

## Rejected linearizations (for awareness)

| Source | c @ 20 °C | delay for Δr=10 m (display) |
| --- | --- | --- |
| Sengpiel simplified (ours) | 343.3 | 29.1 |
| CalQpro 331.4+0.6×T | 343.4 | 29.1 (same display; different internals) |
| QSC round 344 | 344 | 29.1 (same display) |

We lock **331.3 + 0.6×T_C**, not CalQpro/AudioCalcs/QSC round figures.

## Prototype evidence

`prototype-shots/03-speaker-delay-29ms.png` / crop: Path A 30, Path B 20, 20 °C, Haas None/0, result **29.1 ms**, Delay path B, c = 343.300 m/s.
