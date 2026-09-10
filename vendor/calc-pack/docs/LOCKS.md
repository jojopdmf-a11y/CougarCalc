# Example locks (proof tools)

These two fixtures are the starred free-tool drop checks. Port work is not done until both print Pass.

## speaker-delay — 29.1 ms Delay path B

| Field | Value |
| --- | --- |
| Temperature | 20 °C |
| Path A (reference) | 0 m |
| Path B | 10.00 m |
| Speed of sound | `331.3 + 0.606 × T` → 343.42 m/s |
| Formula | `delay_ms = (pathB − pathA) / c × 1000` |
| Display | one decimal |
| Result label | `Delay path B` |
| Expected | **29.1 ms** |

`10 / 343.42 × 1000 = 29.118…` → format `29.1`.

## fret-position — d(12) = 12.750 Pass

| Field | Value |
| --- | --- |
| Scale length | 25.500 in |
| Temperament | 12-TET (`2^(n/12)`) |
| Fret | 12 |
| Formula | `d(n) = S × (1 − 2^(−n/12))` |
| Display | three decimals |
| Expected | **12.750** |
| Gate | **Pass** (`--ok` lime fill) |

Octave is always half the scale: `25.500 / 2 = 12.750` exactly.

## How to run

```bash
node vendor/calc-pack/verify-locks.mjs
```
