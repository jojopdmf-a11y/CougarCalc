# CougarCalc — mapped token sheet (apps + free tools)

**Status:** STARRED 2026-09-09 — locked; Cursor-handoff ready  
**Date:** 2026-09-09 PST  
**Owner:** Calc · UX / Brand  
**Star that unlocked this:** Holding homepage mock 2026-09-09 — apps cyan over Phase 2 brass  
**Build venue:** Cursor (MemoryMap-style Cloudflare / Vite repo). Holding = brief / star / tokens. Do not implement site chrome on the Holding box.

**One brand.** Paid local Mac podcast apps and free browser calculators share one visual system. Free tools are secondary traffic / SEO / convenience — not a second palette.

**Still locked from Phase 2 (structure, not paint):**
- 14-section tool page order
- Safety under the one-liner **and** on the result card
- Result wins by **size**, not a second hue
- No ads, no clutter popups, no aggressive affiliate modules
- Working name CougarCalc; ShopMath / Markout / PrepCalc stay out of the UI
- Formulas unchanged by this sheet

**Retired:** Phase 2 workshop brass (`#E8A54B` as brand accent on `#101214`). Brass is no longer chrome. Do not ship dual themes.

**Starred:** 2026-09-09 PST by J.j. Prototype chrome may retune to this system. Brass remains retired.

Artifacts: `/workspace/vault/cougarcalc/BRIEF-home-2026-09-09.md`, `preview/home-2026-09-09.html`, `assets/`.

---

## 1. Brand surfaces

| Surface | Role | Chrome |
| --- | --- | --- |
| **Apps** (Podcast Stripper → Fixer Mixer → Lil Leveler) | Paid centerpiece, local Mac | Full system: cyan CTAs, lime ON, soft cyan product glow |
| **Site home** | Sell the desk, route to apps + free tools | Same tokens; product-first hero; free-tools chip strip secondary |
| **Free tool pages** | Calculators (speaker-delay, fret-position, stubs) | Same tokens; **no** product glow on result cards; 14-section + safety |

Lime (`#B6FF3B`) means **ON / active / Pass** only. Never body text. Never the primary CTA fill (that is cyan).

---

## 2. Color tokens (CSS custom properties)

Implement as `:root` custom properties. Names are locked. Values match the starred app UIs.

### Core

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0B0E14` | Page / window chrome |
| `--surface` | `#0A1622` | Cards, panels, mixer strips |
| `--surface-2` | `#111C2A` | Inset wells, inputs, inactive chips |
| `--text` | `#E8EEF4` | Primary copy (cool off-white) |
| `--text-muted` | `#8B9BB0` | Captions, helpers, stubs |
| `--border` | `#1E2A3A` | Hairlines, card edges, header rule |
| `--accent` | `#00D8FF` | Primary neon — CTAs, links, focus, live markers, wordmark |
| `--accent-soft` | `#22D3EE` | Softer cyan for outlines, waveform ink, secondary neon |
| `--accent-ink` | `#0B0E14` | Text / icons on solid cyan fills |
| `--result` | `#E8EEF4` | Result numerals (size, **not** a second hue) |
| `--on` | `#B6FF3B` | Lime — ON badges, selected platform, Pass chip fill |
| `--on-ink` | `#0B0E14` | Text on lime fills |
| `--focus` | `2px solid #00D8FF` offset 2px | Keyboard focus |

### Functional (not brand accents)

Warn must **not** reuse cyan (cyan is the CTA). Irreversible stays red-family. Ok/Pass can use lime for fills; include the words **Pass** / **Check failed**.

| Token | Value | Use |
| --- | --- | --- |
| `--warn-bg` | `#2A2210` | Warning well (free tools + site disclaimers) |
| `--warn-border` | `#F0B429` | Warning edge — functional amber, **not** brand chrome |
| `--warn-text` | `#F6D9A0` | Warning copy |
| `--irreversible-bg` | `#2A1212` | Cutting / damage well |
| `--irreversible-border` | `#E07070` | Irreversible edge |
| `--irreversible-text` | `#F5C2C2` | Irreversible copy |
| `--ok` | `#B6FF3B` | Pass / ON (same as `--on`) |
| `--ok-ink` | `#0B0E14` | Text on ok fills |
| `--error` | `#FF6B6B` | Field errors, fail state (with words, not color alone) |

### Glow (apps + home product cards only)

| Token | Value | Use |
| --- | --- | --- |
| `--glow-cyan` | `0 0 24px rgba(0, 216, 255, 0.35)` | Soft outer glow on **product** mock cards |
| `--glow-cyan-strong` | `0 0 32px rgba(0, 216, 255, 0.55)` | Primary solid CTA hover (optional) |

**Do not** put `--glow-cyan` on free-tool result cards, inputs, or warnings. Restraint: product art glows; calculators stay flat high-contrast.

### Print / export (fret 1:1 only)

| Token | Value | Use |
| --- | --- | --- |
| `--print-bg` | `#FFFFFF` | Print sheet |
| `--print-text` | `#111111` | Print type and numerals |
| `--print-rule` | `#111111` | Scale bar and table rules |

Never use print tokens on the interactive page. `@media print` on fret export only.

### Contrast notes (WCAG 2.2, approximate — re-measure in Cursor before ship)

| Pair | Intent |
| --- | --- |
| `--text` on `--bg` / `--surface` | AAA body |
| `--text-muted` on `--bg` | ≥ 4.5:1 body floor |
| `--accent-ink` on `--accent` | AA button label |
| `--on-ink` on `--on` | AA badge label |
| `--accent` on `--bg` | Chrome / large UI only — **not** body text |
| `--on` on `--bg` | Large UI / badges only — **not** body text |
| `--warn-text` on `--warn-bg` | ≥ AA |
| `--irreversible-text` on `--irreversible-bg` | ≥ AA |

Cyan and lime are **chrome**. Body stays `--text`. Result stays `--result` at 40–64px.

---

## 3. Migration (Phase 2 brass → apps cyan)

| Old (retired) | New | Notes |
| --- | --- | --- |
| `--bg #101214` | `--bg #0B0E14` | Cooler charcoal |
| `--surface #1C2128` | `--surface #0A1622` | Navy panel |
| `--surface-2 #252B34` | `--surface-2 #111C2A` | Inset |
| `--text #F3EFE6` | `--text #E8EEF4` | Cool off-white |
| `--text-muted #B8B3A6` | `--text-muted #8B9BB0` | Cool muted |
| `--border #3A414C` | `--border #1E2A3A` | |
| `--accent #E8A54B` | `--accent #00D8FF` | Brand accent swap |
| `--accent-ink #101214` | `--accent-ink #0B0E14` | |
| `--result #F3EFE6` | `--result #E8EEF4` | Still size, not hue |
| `--warn-*` brass-tied | `--warn-*` amber functional | Warn ≠ accent |
| `--ok #7DCEA0` | `--ok` / `--on #B6FF3B` | Lime aligns with apps |
| *(none)* | `--accent-soft`, `--glow-cyan*` | New |
| `--page 72rem` (nit) | `--page 64rem` | Spec was 64; fix on retune |
| body 17px (nit) | 16px | Spec was 16 |

---

## 4. Typography

**One family for UI.** Match the apps: geometric sans. Free tools do not keep a separate “workshop” face.

| Role | Spec |
| --- | --- |
| UI / body | **Inter** (or system-ui geometric stack: `Inter, ui-sans-serif, system-ui, sans-serif`). Weights 400, 600. |
| App / section labels | Same family, **600**, tracking optional `0.04em`–`0.08em` for all-caps chrome labels (`PLATFORM`, `SPEAKERS`) |
| Numerals / formulas / copy payload | **IBM Plex Mono** or **JetBrains Mono**, tabular lining (`font-variant-numeric: tabular-nums`). Prefer IBM Plex Mono if already self-hosted from Phase 2. |
| Wordmark | Geometric sans 600 — `CougarCalc` / `CougarCalc.com`. No animal mark. Cyan allowed on wordmark. |

**Scale (free tools — keep Phase 2 sizes that passed):**

| Role | Mobile | Desktop ≥720px |
| --- | --- | --- |
| Caption | 13 | 13 |
| Body | 16 / 1.5 | 16 / 1.5 |
| Label | 16 | 16 |
| h2 section | 18 | 18 |
| Page title h1 | 22 | 28 |
| Result | 40–48 (`clamp`) | 56–64 |
| Result unit | 16 | 16 |

**Home / apps marketing:** hero can go larger (display 36–56). Free-tool result still dominates the tool column.

No display script, no slab “luthier” serif, no second personality font.

---

## 5. Spacing, radius, motion, width

| Token / rule | Value |
| --- | --- |
| Space scale | 4 base → 8, 12, 16, 24, 32, 48 |
| `--radius` | `4px` controls |
| `--radius-lg` | `8px` cards / panels (apps use soft rounds; keep 8px site-wide) |
| Chips / pills | Allowed for free-tools strip and ON badges; min height 36px, prefer 44px tap |
| Motion | 120ms color/opacity/glow only. No layout animation. `prefers-reduced-motion: reduce` = instant |
| `--tool` | `40rem` tool column |
| `--page` | `64rem` home / category / marketing |
| Soft glow | Product cards and primary CTA only |

---

## 6. Component mapping

### 6.1 Site home (from starred mock)

1. **Header** — cyan wordmark · nav (`Apps | Free Tools | Guitar | Audio | About` — nav split still open; default one Free Tools lane until Jeffrey picks) · outline cyan `Buy apps`
2. **Hero** — apps-first headline + cyan primary `See the apps` + ghost `Browse free tools` + three floating UI frames with `--glow-cyan`
3. **Podcast desk** — three equal cards, pipeline order **Stripper → Mixer → Leveler**, lime `ON` badge, `Learn more →`
4. **Free tools chip strip** — secondary; same `--surface` / `--border`; cyan label `Free tools`; tagline muted

### 6.2 Free tool page (structure unchanged)

Order stays:

1. Title → 2. One-liner → **warning** → 3. Calculator → 4–5. Result card (Copy / Reset) → 6–14 as locked.

| Piece | Token behavior |
| --- | --- |
| Warning under lede | `warn` or `irreversible` wells — amber / red, **not** cyan |
| Result card | `--surface`, `--border`, `--radius-lg`; numeral `--result` at clamp 40–64; eyebrow muted |
| Safety on card | Full locked sentence again (or one-line chip using same warn/irreversible tokens) |
| Primary button | Solid `--accent` / `--accent-ink` (`Copy result` when enabled) |
| Secondary | Outline `--border` / `--text` (`Reset`) |
| Pass | Lime fill or lime text + word **Pass** |
| Empty | Card stays; “Enter both paths” / “Enter a scale length”; Copy disabled; safety visible |
| Error | Inline under field + `role="alert"`; `--error`; no toast |

Locked safety copy (unchanged wording):

- Delay `warn`: Geometric delay is valid at one seat. Haas extra is signal- and level-dependent, not a physical constant. Verify with an impulse response (or a known measurement method) before the show. This is not Smaart and not a manufacturer preset.
- Fret `irreversible`: Theoretical 12-TET locations, not finished intonation. Verify the 12th fret equals half the scale (S/2) before you saw. Sawing is irreversible.

### 6.3 App chrome (reference for parity)

| Pattern | Token |
| --- | --- |
| Title all-caps cyan | `--accent` / `--accent-soft` |
| Solid primary action | `--accent` fill, `--accent-ink` label, optional `--glow-cyan-strong` |
| ON / selected | `--on` fill, `--on-ink` label |
| Panels | `--surface` on `--bg` |
| Footer trust line | Cyan smallcaps: local processing / nothing uploaded |

---

## 7. Paste-ready `:root` (Cursor)

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
  --sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
  --tool: 40rem;
  --page: 64rem;
}
```

Focus: `outline: 2px solid var(--accent); outline-offset: 2px;`

---

## 8. Cursor handoff checklist

- [ ] Star this token sheet (or Jeffrey skips second gate in chat)
- [ ] New MemoryMap-style repo consumes `:root` block above — **one** theme
- [ ] Home implements BRIEF IA (hero → podcast desk → free-tools strip)
- [ ] Free tools: 14-section template + both safety placements
- [ ] Strip all `#E8A54B` brand chrome from Origin prototypes when porting
- [ ] Re-measure contrast in DevTools; adjust `--text-muted` if needed
- [ ] No glow on calculator result cards
- [ ] No spend / no production publish until Founder says so
- [ ] Formulas untouched by UX

---

## 9. Open questions (not blocking the token lock)

1. Nav: single **Free Tools** lane vs split **Guitar | Audio** (BRIEF left open).
2. Second star on this sheet vs “draft and hold” — default: wait for star before prototype rewrite.
3. Mono face: keep IBM Plex Mono vs JetBrains Mono in the Cursor repo.

---

## 10. Handoff

- **Holding · COO** — star/kill this sheet; route Cursor build.
- **Calc · CougarCalc** — Founder acceptance of token lock.
- **Calc · Architecture / tools** — implement only after star; structure from `ux-prototypes.md`, paint from this file.

Related: `BRIEF-home-2026-09-09.md`, `ux-prototypes.md` (structure; palette section superseded), `brand-and-voice.md` (voice + 14-section unchanged), `visual-pass.md` (historical Phase 2 brass pass).
