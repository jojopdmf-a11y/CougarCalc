# calc-pack tokens — starred cyan

**Status:** STARRED 2026-09-09 — locked; website build port  
**Owner:** Calc · UX / Brand  
**Site paste:** repo `src/styles/tokens.css` (already applied on CougarCalc.com)  
**This file:** pack-local copy of the starred sheet so the drop is self-contained.

Apps cyan wins over Phase 2 brass. One system for Mac apps + free tools.

**Keep:** 14-section calc order, safety under lede + on result card, result by size not hue, fret print light only.  
**Do not:** dual brand (brass + cyan), product glow on calculator result cards, lime as body text or primary CTA.

Canonical names use `--surface` / `--text-muted`. Aliases `--panel` / `--muted` match the kickoff interim.

---

## Locked custom properties

```css
:root {
  color-scheme: dark;

  --bg: #0B0E14;
  --surface: #0A1622;
  --surface-2: #111C2A;
  --text: #E8EEF4;
  --text-muted: #8B9BB0;
  --border: #1E2A3A;

  --accent: #00D8FF;
  --accent-soft: #22D3EE;
  --accent-ink: #0B0E14;

  --result: #E8EEF4;

  --on: #B6FF3B;
  --on-ink: #0B0E14;
  --ok: #B6FF3B;
  --ok-ink: #0B0E14;

  --warn-bg: #2A2210;
  --warn-border: #F0B429;
  --warn-text: #F6D9A0;
  --irreversible-bg: #2A1212;
  --irreversible-border: #E07070;
  --irreversible-text: #F5C2C2;
  --error: #FF6B6B;

  --glow-cyan: 0 0 24px rgba(0, 216, 255, 0.35);
  --glow-cyan-strong: 0 0 32px rgba(0, 216, 255, 0.55);

  --print-bg: #FFFFFF;
  --print-text: #111111;
  --print-rule: #111111;

  --radius: 4px;
  --radius-lg: 8px;
  --tool: 40rem;
  --page: 64rem;

  --sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;

  --panel: var(--surface);
  --muted: var(--text-muted);
}
```

**Focus:** `outline: 2px solid var(--accent); outline-offset: 2px;`

---

## Calc-specific rules

| Token | Use on free tools |
| --- | --- |
| `--accent` / `--accent-soft` | Links, focus, wordmark, section labels — not the result numeral |
| `--result` | Primary calc numeral `clamp(2.5rem, 8vw, 4rem)` — size, not a second hue |
| `--ok` / `--on` | Pass / ON fills only (example: fret **Pass** chip) |
| `--warn-*` | Verify warnings under lede and on the result card |
| `--irreversible-*` | Sawing / damage copy (guitar) |
| `--glow-cyan` | **Never** on calc result cards (product cards on `/` and `/apps` only) |
| `--print-*` | Fret print / export sheet — light only |

**Retired:** `#E8A54B` brand brass; warm Phase 2 `#F3EFE6` / `#101214` interactive chrome.

**Type:** Inter 400/600 UI · IBM Plex Mono tabular for numerals and formulas.  
**Column:** tool `--tool: 40rem` · page `--page: 64rem`.
