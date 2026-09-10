# speaker-delay

Audio / live sound proof tool. Site path (later): `/audio-live-sound/speaker-delay`.

Computes the delay to apply to **path B** so a farther loudspeaker aligns with a reference path A.

## Formula

```
c(T) = 331.3 + 0.606 × T_celsius     (m/s)
delay_ms = (pathB_m − pathA_m) / c × 1000
```

Display: one decimal. Result label is locked: **Delay path B**.

## Example lock

Path A = 0 m · Path B = 10.00 m · 20 °C → **29.1 ms Delay path B**

Safety (lede + result card): delay figures are alignment aids, not a substitute for measuring the room.

## Files

| File | Role |
| --- | --- |
| `formula.ts` | Portable math |
| `locks.json` | Fixture |
| `index.ts` | Re-exports |
