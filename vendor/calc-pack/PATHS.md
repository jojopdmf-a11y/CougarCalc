# PATHS — calc-pack ↔ site

## Zip extract (Holding attach)

The full calc-pack payload is a zip whose **root is `calc-pack/`**.

When Holding attaches that zip:

```text
unzip calc-pack.zip -d vendor/
# lands as vendor/calc-pack/*
```

Do **not** extract so paths become `vendor/calc-pack/calc-pack/*`.  
Do **not** extract over live site routes.

Until the zip arrives, this reconstructed tree is the drop folder for the website build port. Leave the remaining vendor tree as placeholders (`origin-remaining/`). Overwrite placeholders with zip contents when they land; keep this `PATHS.md` contract.

## Locked site prefixes (do not rename)

| Lane | Site prefix | Pack slug | Status in this drop |
| --- | --- | --- | --- |
| Audio / live sound | `/audio-live-sound/` | — | index stays stubbed |
| Audio proof | `/audio-live-sound/speaker-delay` | `speaker-delay` | sources in pack |
| Guitar building | `/guitar-building/` | — | index stays stubbed |
| Guitar proof | `/guitar-building/fret-position-calculator` | `fret-position` | sources in pack |

Kickoff also used the short name `fret-position`. The **URL slug** stays `fret-position-calculator`. The pack folder is `fret-position/`.

## Do not touch in this drop

- `/audio-live-sound/` and `/audio-live-sound/*` live routes
- `/guitar-building/` and `/guitar-building/*` live routes
- Marketing `/`, `/apps/*`, `/buy`

This folder is vendor source only.

## Remaining 22 tools (Origin)

Sources stay on Origin until the full zip is attached. Placeholder catalog: `origin-remaining/catalog.json`.

### Audio / live sound (11 on Origin)

| Future site path | Pack slug |
| --- | --- |
| `/audio-live-sound/cardioid-sub-array` | `cardioid-sub-array` |
| `/audio-live-sound/show-latency` | `show-latency` |
| `/audio-live-sound/sub-main-crossover-delay` | `sub-main-crossover-delay` |
| `/audio-live-sound/max-spl` | `max-spl` |
| `/audio-live-sound/cable-loss` | `cable-loss` |
| `/audio-live-sound/ohms-law` | `ohms-law` |
| `/audio-live-sound/speaker-eq` | `speaker-eq` |
| `/audio-live-sound/gain-staging` | `gain-staging` |
| `/audio-live-sound/impedance` | `impedance` |
| `/audio-live-sound/note-freq` | `note-freq` |
| `/audio-live-sound/lufs-diff` | `lufs-diff` |

### Guitar building (11 on Origin)

| Future site path | Pack slug |
| --- | --- |
| `/guitar-building/scale-length-compare` | `scale-length-compare` |
| `/guitar-building/saddle-compensation` | `saddle-compensation` |
| `/guitar-building/bridge-placement` | `bridge-placement` |
| `/guitar-building/string-tension-calculator` | `string-tension-calculator` |
| `/guitar-building/string-set-tension` | `string-set-tension` |
| `/guitar-building/nut-spacing-slot-width` | `nut-spacing-slot-width` |
| `/guitar-building/nut-height-first-fret` | `nut-height-first-fret` |
| `/guitar-building/action-worksheet` | `action-worksheet` |
| `/guitar-building/fretboard-radius-sagitta` | `fretboard-radius-sagitta` |
| `/guitar-building/neck-taper-width` | `neck-taper-width` |
| `/guitar-building/pickup-pole-spacing` | `pickup-pole-spacing` |

Indexes (`/audio-live-sound/`, `/guitar-building/`, optional `/tools`) list live tools only. Origin stubs stay muted — no fake CTAs.

## Import hint (later port)

```ts
import { pathBDelayMs, formatDelayMs } from '../vendor/calc-pack/speaker-delay'
import { distanceFromNut, formatInches } from '../vendor/calc-pack/fret-position'
```
