# CougarCalc.com

Marketing site + free-tool host for **CougarCalc**.

- **Domain:** `cougarcalc.com` (acquired; DNS later)
- **Stack:** Vite + React + TypeScript → Cloudflare Workers (same pattern as MemoryMap)
- **Status:** Scaffold / design-pack landed. Real homepage + calc port not started.

## Quick start

```bash
npm install
npm run dev
```

Build / deploy:

```bash
npm run build
npm run deploy              # staging on workers.dev (bookmark this)
npm run deploy:production   # production Worker — wait for DNS go-ahead
```

See [docs/STAGING.md](docs/STAGING.md) for the preview URL and how updates show up.

## Design pack (from Grokbot)

| Path | Role |
| --- | --- |
| [docs/CURSOR-KICKOFF.md](docs/CURSOR-KICKOFF.md) | Build brief |
| [docs/TOKENS.md](docs/TOKENS.md) | Token source |
| [src/styles/tokens.css](src/styles/tokens.css) | Applied tokens |
| [docs/BRIEF-home-2026-09-09.md](docs/BRIEF-home-2026-09-09.md) | Home brief |
| [docs/preview/](docs/preview/) | HTML mock reference |
| [public/apps/](public/apps/) | App screenshots |
| [docs/legal/PRIVACY.md](docs/legal/PRIVACY.md) | Privacy policy (source of truth; port to `/privacy` later) |
| [docs/legal/TERMS.md](docs/legal/TERMS.md) | Terms & license (source of truth; port to `/terms` later) |

## Routes (stubbed)

- `/` home scaffold
- `/apps`, `/apps/podcast-stripper`, `/apps/fixer-mixer`, `/apps/lil-leveler`
- `/tools`, `/audio-live-sound/*`, `/guitar-building/*`
- `/about`, `/buy`

## Pricing (Paddle sandbox, already created elsewhere)

| Product | USD |
| --- | --- |
| Podcast Stripper | $25 |
| Fixer Mixer | $25 |
| Lil Leveler | $15 |
| Podcast Suite | $49 |

## Paddle checkout (sandbox)

See [docs/PADDLE-CHECKOUT.md](docs/PADDLE-CHECKOUT.md).

- `/buy` overlay checkout for CougarCalc apps (MemoryMap credits live on the MemoryMap site)
- Per-app Buy buttons on product pages
- Requires `.env.local` with `VITE_PADDLE_CLIENT_TOKEN`

## Free tools

See [docs/FREE-TOOLS.md](docs/FREE-TOOLS.md).

- `/audio-live-sound/speaker-delay` — speaker delay (lock: 30 m / 20 m / 20 °C → 29.1 ms, Delay path B)
- `/guitar-building/fret-position-calculator` — fret positions (lock: 25.500 in → d(12) = 12.750, Pass)
- Remaining catalog names stay muted until later Origin ports

## Next build pass

1. Implement homepage from kickoff + preview HTML.
2. Product pages with buy CTAs.
3. Connect free-tools pack under locked path prefixes.
4. Staging deploy on workers.dev, then DNS when green-lit. See [docs/STAGING.md](docs/STAGING.md).
