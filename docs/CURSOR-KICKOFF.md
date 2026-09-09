# CougarCalc.com — Cursor kickoff (one page)

**Starred:** 2026-09-09 · J.j.  
**Build venue:** Cursor IDE (same pattern as MemoryMap.world — Vite + Cloudflare Pages). Not the Holding box.  
**Domain:** `cougarcalc.com` (acquired).  
**Holding role:** brief / star-kill / UX tokens / Calc team routing. Paste this file + token sheet into the Cursor project.

---

## Product shape (locked)

| Lane | Role | Owner |
| --- | --- | --- |
| **Paid apps** (centerpiece) | Podcast Stripper → Fixer Mixer → Lil Leveler (local Mac) | J.j. Cursor apps project; site markets them |
| **Free tools** (traffic / SEO) | `/audio-live-sound/` + `/guitar-building/` calculators | Calc team formulas; site chrome matches apps |
| **Same domain** | One brand, one chrome | Apps cyan wins over Phase 2 brass |

**Headline (home):** Podcast stems → polish → loudness  
**Nav (default):** Apps · Free Tools · Guitar · Audio · About · Buy apps  
(Guitar / Audio can deep-link into free-tool indexes; free tools are not a second brand.)

---

## Suggested repo layout (MemoryMap-style)

```
cougarcalc/                    # GitHub repo → Cloudflare Pages
  package.json                 # Vite (+ React or Astro — match MemoryMap comfort)
  wrangler.toml / Pages config
  public/
    apps/                      # static screens / icons for the three apps
      podcast-stripper.png
      fixer-mixer.png
      lil-leveler.png
    favicon.svg
  src/
    styles/
      tokens.css               # ← paste from vault/cougarcalc/TOKENS.md
      global.css
    components/
      SiteHeader.tsx
      SiteFooter.tsx
      AppCard.tsx
      FreeToolChip.tsx
      CalcShell.tsx            # 14-section calc page chrome (order locked)
    pages/ or routes/
      index                     # HOME — apps hero
      apps/index
      apps/podcast-stripper
      apps/fixer-mixer
      apps/lil-leveler
      tools                     # optional all-tools index
      audio-live-sound/index
      audio-live-sound/<slug>/
      guitar-building/index
      guitar-building/<slug>/
      about
  docs/                        # optional: copy BRIEF + this kickoff
```

**Seed assets (from Holding vault):**  
`/workspace/vault/cougarcalc/assets/{podcast-stripper,fixer-mixer,lil-leveler,home-preview-2026-09-09}.png`  
Preview HTML reference: `vault/cougarcalc/preview/home-2026-09-09.html`

---

## Routes (v1)

### Marketing / apps

| Path | Purpose |
| --- | --- |
| `/` | Hero + three-card podcast desk + free-tool chip strip |
| `/apps` | Apps index (pipeline order) |
| `/apps/podcast-stripper` | Product page — Stereo mix → speaker tracks + music |
| `/apps/fixer-mixer` | Product page — stems → polish → bounce |
| `/apps/lil-leveler` | Product page — final mix → platform loudness |
| `/about` | Who / local Mac / no stolen bench footage vibe — keep short |
| `/buy` or App Store / Gumroad links | Outbound only until checkout is real |

### Free tools (existing path lock)

Keep prefixes. Chrome retunes to apps tokens; **14-section order + safety visibility stay**.

**Audio / live sound** (examples already in Calc docs):  
`/audio-live-sound/speaker-delay` · `cardioid-sub-array` · `show-latency` · `sub-main-crossover-delay` · `max-spl` · plus the rest of the cleared 12 (and later catalog).

**Guitar building:**  
`/guitar-building/fret-position-calculator` · `scale-length-compare` · `saddle-compensation` · `bridge-placement` · `string-tension-calculator` · `string-set-tension` · `nut-spacing-slot-width` · `nut-height-first-fret` · `action-worksheet` · `fretboard-radius-sagitta` · `neck-taper-width` · `pickup-pole-spacing` · …

Indexes: `/audio-live-sound/` and `/guitar-building/` list live tools; stubs stay muted, not fake CTAs.

---

## Design tokens (landed)

**File:** `vault/cougarcalc/TOKENS.md` → paste into `src/styles/tokens.css`.  
**Full UX writeup:** `/workspace/cougarcalc/docs/tokens-apps-and-tools.md`

Canonical: `--bg #0B0E14`, `--surface #0A1622` (alias `--panel`), `--accent #00D8FF` / `--accent-soft #22D3EE`, `--on #B6FF3B`, `--text #E8EEF4`, `--text-muted #8B9BB0` (alias `--muted`), plus warn / irreversible / ok / print / glow.  
**Supersedes Phase 2 brass.** No dual brand. No glow on calc result cards.

---

## Build order in Cursor (suggested)

1. Scaffold Vite app + Cloudflare Pages (mirror MemoryMap deploy).
2. Paste `TOKENS.md` into `tokens.css`; wire `SiteHeader` / home from preview HTML.
3. Three `/apps/*` pages with real screenshots + buy placeholders.
4. Port two Phase 2 calcs (`speaker-delay`, `fret-position`) under new chrome as proof.
5. Remaining free tools behind same `CalcShell`.
6. Point DNS when J.j. green-lights production (staging first — existing Calc lock).

---

## Do / don’t

| Do | Don’t |
| --- | --- |
| Apps first on `/` | Lead with free-tool grids |
| One neon accent | Brass + cyan dual brand |
| Local Mac / product UI as art | Stock people / kraft Lowdown look |
| Star gate on public copy | Ship unstarred marketing prose |
| noindex / staging until go | Accidental production publish |

---

## Pointers

- Home brief: `vault/cougarcalc/BRIEF-home-2026-09-09.md`
- Phase 2 calc UX (structure keep, palette replace): `/workspace/cougarcalc/docs/ux-prototypes.md`
- Org: free site = Calc team; paid apps = J.j. Cursor project (`vault/org.md`)


## Tokens
- Draft for second-gate star: `docs/tokens-apps-and-tools.md` (mirrored → `vault/cougarcalc/TOKENS.md`)
- Interim kickoff values match this sheet; prefer TOKENS.md as source of truth once starred.
