# calc-pack (free-tool drop)

Drop folder only for the CougarCalc.com website build port.

This tree is **not** the live site. Do not wire it into `/audio-live-sound/` or `/guitar-building/` in this PR. Those route prefixes stay stubbed until a later port pass.

**Priority tools in this drop:** `speaker-delay` + `fret-position`.  
**Starred chrome:** apps cyan tokens (`docs/TOKENS.md`).  
**Remaining 22 tools:** stay on Origin — see `origin-remaining/`.

The chunked `pack.b64` zip did not land (transport size limits). Holding will attach the full calc-pack zip later; extract must land at `vendor/calc-pack/*` (zip root is `calc-pack/`). See `PATHS.md`.

## Example locks

| Tool | Fixture | Expected |
| --- | --- | --- |
| speaker-delay | Path A = 0 m, Path B = 10.00 m, 20 °C | **29.1 ms** labeled **Delay path B** |
| fret-position | Scale 25.500 in, equal temperament | **d(12) = 12.750 Pass** |

```bash
node vendor/calc-pack/verify-locks.mjs
```

## Layout

```
vendor/calc-pack/
  README.md                 this file
  PATHS.md                  site prefixes + zip extract contract
  docs/TOKENS.md            starred cyan token sheet
  docs/LOCKS.md             machine + human lock table
  docs/CHROME-14.md         locked 14-section calc page order
  shared/                   portable types + speed of sound + shell order
  speaker-delay/            formula + lock sources (audio / live sound)
  fret-position/            formula + lock sources (guitar building)
  origin-remaining/         placeholders for the other 22 tools
```

## Port later (not this drop)

1. Import formulas from these modules.
2. Build `CalcShell` from `docs/CHROME-14.md` + `src/styles/tokens.css`.
3. Mount proof tools at the locked prefixes in `PATHS.md`.
4. Pull remaining Origin tools when Holding attaches the full zip.
