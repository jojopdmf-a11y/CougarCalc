# CougarCalc — handoff (exit Cursor Project → single repo chat)

**Date:** 2026-10-07  
**Repo:** https://github.com/jojopdmf-a11y/CougarCalc  
**Live site:** https://cougar-calc.vercel.app · https://www.cougarcalc.com  
**Owner:** Jeffrey Hillman (beginner — prefer plain language, explain before asking him to click)

## Why this handoff

Work is moving **out of a Cursor Project** (multi-agent coordinator) into a **single cloud chat** that opens this GitHub repo. Projects burned too much compute. Prefer **one focused agent**, ask before big parallel jobs, no mesh-sculpt retry loops.

## What lives where

| Piece | Where |
| --- | --- |
| Website code + guitar GLBs | This GitHub repo (`main`) |
| Live hosting | **Vercel** (auto-deploy from `main`) |
| Products / checkout | **Paddle** (CougarCorp seller account; shared with MemoryMap) |
| Domain / DNS | Outside repo (Cloudflare/registrar — not fully documented here) |
| Email | **Resend account exists but unused**; not wired in this repo. Forwarding ≠ Resend. |
| Unused GitHub PAT named `CougarCalc` | **Never used** — safe to delete; not required for Vercel |

**Not in the repo:** Cursor Project notes/plans, Grok Drive scratch files, Paddle dashboard, Vercel env secrets.

## Product direction (guitar visualizer)

- Route: `/guitar-building/visualizer`
- Body styles labeled **S-Style**, **T-Style**, **LP-Style** (etc.) — **no** Fender/Strat/Tele brand names in UI
- Priority: **body + neck only**; hardware later
- Current live S/T models are **pale-grey raw blanks** (no paint, no hardware, **frets stay**)
- Approach: import/edit **GLB** assets (not LLM-authored Three.js sculpture). Option B (Blender) is OK; Jeffrey has **no Blender experience** — agent owns Blender.
- Cost-conscious: ask before large jobs; prefer asset work + thin loader PRs

## What’s done (merged on `main`)

| PR | What |
| --- | --- |
| #5 | Visualizer spike (Three.js / R3F) |
| #6 | `vercel.json` SPA rewrites (deep links work) |
| #9 | Imported painted S/T GLBs |
| #10 | Split into body + neck parts |
| #12 | Raw pale-grey blanks on `main` (fixes #11 which merged to wrong base) |

**Superseded / ignore for new work:** #7, #8 (procedural Strat experiments).

## Current live visualizer state

- S-Style / T-Style load `public/guitar-visualizer/*-raw.glb` (body + neck assembled)
- Painted `s-style.glb` / `t-style.glb` and non-raw part files may still exist in `public/` for reference
- Offset body still placeholder / incomplete vs S/T
- Headstock logos were an issue on painted assets; raw blanks removed textures/logos
- T-Style raw shells are closed; S-Style body may still have source open edges (jack hole / horn) — see Grok notes if available in Drive folder `CougarCalc-raw-mesh-inputs`

## Attribution (keep in credits, not on meshes)

- S-Style geometry derived from **varin** (CC-BY)
- T-Style geometry derived from **Jesus / @gsusvfx** (CC-BY)

## Payments note (other apps)

Same **Paddle** account used for CougarCalc buy flows and MemoryMap credits. PlayerTracer needs new Paddle products later — separate from guitar visualizer unless asked.

## Sensible next work (pick with Jeffrey)

1. Eye-test raw blanks on production; cleanup S-Style open edges if needed  
2. Finish / wood materials on raw blanks (customization layer)  
3. Separable hardware kits (after blanks are solid)  
4. LP-Style (or other) as another raw body+neck pair  
5. Paddle webhooks / live catalog TODOs in `docs/PADDLE-CHECKOUT.md`

## Key docs in repo

- `docs/PADDLE-CHECKOUT.md` — sandbox checkout  
- `docs/CURSOR-KICKOFF.md` — original site kickoff  
- `docs/guitar-visualizer-go-nogo.md` — early visualizer spike notes  

## Agent rules for the new chat

- Default **Auto** model unless Jeffrey asks otherwise  
- Prefer **one** agent; no Project-style fan-out  
- Draft PRs against `main`; don’t merge unless he asks  
- Use stable URLs (`cougar-calc.vercel.app`), not long Vercel deployment URLs  
- Keep beginner-friendly explanations  
