# fret-position

Guitar-building proof tool. Site path (later): `/guitar-building/fret-position-calculator`.

Equal-temperament distance from the nut to fret *n* on scale *S*.

## Formula

```
d(n) = S × (1 − 2^(−n/12))
```

Display: three decimals. Verify chip uses lime `--ok` for **Pass** only.

Print / export is **light only** (`--print-bg` / `--print-text` / `--print-rule`). No dark chrome on the printed sheet.

## Example lock

Scale 25.500 in · fret 12 → **d(12)=12.750 Pass**

Safety (lede + result card): confirm scale length on the instrument before cutting. Fret slots are irreversible.

## Files

| File | Role |
| --- | --- |
| `formula.ts` | Portable math |
| `locks.json` | Fixture |
| `index.ts` | Re-exports |
