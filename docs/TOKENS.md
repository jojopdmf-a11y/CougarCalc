# CougarCalc — design tokens

**Status:** STARRED 2026-09-09 — locked; Cursor-handoff ready
**Status:** STARRED 2026-09-09 — locked. Paste into Cursor `src/styles/tokens.css`.  
**Owner:** Calc · UX / Brand  
**Paste into:** `src/styles/tokens.css`  
**Full writeup:** `/workspace/cougarcalc/docs/tokens-apps-and-tools.md`  
**Kickoff:** `CURSOR-KICKOFF.md`

Apps cyan wins over Phase 2 brass. One system for Mac apps + free tools.  
**Keep:** 14-section calc order, safety under lede + on result card, result by size not hue, fret print light only.  
**Do not:** dual brand (brass + cyan), product glow on calculator result cards, lime as body text or primary CTA.

Canonical names use `--surface` / `--text-muted`. Aliases `--panel` / `--muted` match the kickoff interim.

---

## `src/styles/tokens.css` (paste as-is)

```css
/**
 * CougarCalc tokens — apps + free tools, one system.
 * Starred homepage direction 2026-09-09. Supersedes Phase 2 brass accent.
 * Do not rename locked custom properties without UX.
 */
:root {
  color-scheme: dark;

  /* Core */
  --bg: #0B0E14;
  --surface: #0A1622;
  --surface-2: #111C2A;
  --text: #E8EEF4;
  --text-muted: #8B9BB0;
  --border: #1E2A3A;

  /* Brand accent — single neon */
  --accent: #00D8FF;
  --accent-soft: #22D3EE;
  --accent-ink: #0B0E14;

  /* Results win by size, not a second hue */
  --result: #E8EEF4;

  /* ON / Pass — lime only for active + pass fills */
  --on: #B6FF3B;
  --on-ink: #0B0E14;
  --ok: #B6FF3B;
  --ok-ink: #0B0E14;

  /* Functional (not brand chrome) */
  --warn-bg: #2A2210;
  --warn-border: #F0B429;
  --warn-text: #F6D9A0;
  --irreversible-bg: #2A1212;
  --irreversible-border: #E07070;
  --irreversible-text: #F5C2C2;
  --error: #FF6B6B;

  /* Product glow — home/app cards only, never calc result cards */
  --glow-cyan: 0 0 24px rgba(0, 216, 255, 0.35);
  --glow-cyan-strong: 0 0 32px rgba(0, 216, 255, 0.55);

  /* Fret print / export only */
  --print-bg: #FFFFFF;
  --print-text: #111111;
  --print-rule: #111111;

  /* Layout */
  --radius: 4px;
  --radius-lg: 8px;
  --tool: 40rem;
  --page: 64rem;

  /* Type */
  --sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Kickoff interim aliases */
  --panel: var(--surface);
  --muted: var(--text-muted);
}
```

**Focus:** `outline: 2px solid var(--accent); outline-offset: 2px;`

---

## Quick map

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0B0E14` | Page |
| `--surface` / `--panel` | `#0A1622` | Cards / panels |
| `--surface-2` | `#111C2A` | Inputs / inset |
| `--text` | `#E8EEF4` | Primary |
| `--text-muted` / `--muted` | `#8B9BB0` | Secondary |
| `--border` | `#1E2A3A` | Hairlines |
| `--accent` | `#00D8FF` | CTA, links, focus, wordmark |
| `--accent-soft` | `#22D3EE` | Outlines, waveforms |
| `--accent-ink` | `#0B0E14` | On cyan fills |
| `--on` / `--ok` | `#B6FF3B` | ON pills, Pass fills |
| `--on-ink` / `--ok-ink` | `#0B0E14` | On lime fills |
| `--result` | `#E8EEF4` | Calc numerals 40–64px |
| `--warn-*` | amber well | Free-tool verify warnings |
| `--irreversible-*` | red well | Sawing / damage |
| `--glow-cyan` | soft cyan | Product cards only |

**Retired:** `#E8A54B` brand brass, warm `#F3EFE6` / `#101214` Phase 2 interactive chrome.

**Type:** Inter 400/600 UI · IBM Plex Mono tabular for numerals/formulas.  
**Calc result:** `clamp(2.5rem, 8vw, 4rem)` · tool column `--tool: 40rem` · page `--page: 64rem`.

---

## Seed assets

`vault/cougarcalc/assets/{podcast-stripper,fixer-mixer,lil-leveler,home-preview-2026-09-09}.png` → `public/apps/` in the Cursor repo.
