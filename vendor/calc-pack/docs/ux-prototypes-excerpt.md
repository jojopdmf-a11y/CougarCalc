# UX prototypes excerpt — locked 14-section order + safety visibility

**Source:** `docs/ux-prototypes.md` (excerpt only; not the full ~900-line file).
**Keep:** 14-section order, safety under lede + on result card, result by size not hue, no product glow on free-tool result cards.

---
## 2. Design principles (Phase 2)

1. **Mobile-first.** One column to 720px. Sticky result card after inputs on small screens (see §8).
2. **High contrast.** Body and results meet WCAG 2.2 AA at minimum. Result numerals target AAA (7:1). Measured ratios live in §3.
3. **Results visually dominate.** The number is the largest type on the page.
4. **No clutter.** No ads, no popups, no newsletter gates, no cookie walls, no chat widgets, no affiliate modules, no “related products.”
5. **Inputs readable from a tape, disto, mixer, amp, or workbench.** Large tap targets (min 44px). 16px input text (no iOS zoom). Labeled units on every field.
6. **Safety visible, not buried.** Warning sits under the one-sentence explanation **and** is repeated on the result card. Disclaimer is section 14, still reachable without a modal.
7. **Copy / reset live on the result card.** Share in Phase 2 = copy a plain-language sentence. No native share sheet required.
8. **Print / export (fret) is a light surface; the interactive UI is dark.** Do not force a site-wide light theme.

---


---

## 8. Locked 14-section tool page (shared template)

Every tool page, in this exact order. Architecture must not reorder.

1. Plain-language title (`h1`)
2. One-sentence explanation
3. Calculator interface
4. Result display
5. Copy / share result (on the result card; listed separately because the charter lists it separately)
6. What the result means
7. Formula or method
8. Worked example
9. Assumptions and limitations
10. Practical notes
11. FAQs from real confusion (research-backed, not invented persona FAQs)
12. Related tools
13. Sources and last-reviewed date (2026-08-31 PST for prototypes, citing research dossiers)
14. Disclaimer

Page chrome: warning component sits **between 2 and 3** (visible). Result card is **4 + 5**. On mobile, after the user leaves the last input, keep the result card sticky at the bottom until they scroll into section 6.

```
┌─────────────────────────────────────────┐
│ CougarCalc                              │  header
│ Audio / live sound   Guitar building    │
├─────────────────────────────────────────┤
│ Speaker delay calculator                │  1  h1
│ How many milliseconds to put on the     │  2
│ closer (earlier) path so both arrivals  │
│ meet at one seat, and which channel     │
│ to delay.                               │
│                                         │
│ ┌ warn ──────────────────────────────┐  │  between 2 and 3
│ │ Geometric delay is valid at one    │  │
│ │ seat. Haas extra is signal- and    │  │
│ │ level-dependent…                   │  │
│ └────────────────────────────────────┘  │
│                                         │
│ Path A  [  30.0  ] m                    │  3  inputs
│ Path B  [  20.0  ] m                    │
│ Temperature  Default 20 °C (68 °F)      │
│ Fill type   [ Underbalcony ▾ ]          │
│ …                                       │
│                                         │
│ ┌ Result ────────────────────────────┐  │  4 + 5
│ │ 12.4 ms                            │  │  largest type
│ │ Delay path B · underbalcony        │  │
│ │ geometric 7.4 + Haas 5.0           │  │
│ │ [Copy result]  [Reset]             │  │
│ │ chip: Geometric delay is valid…    │  │
│ └────────────────────────────────────┘  │
│                                         │  on mobile this card
│                                         │  sticks to the bottom
│                                         │  until §6 is in view
│ What the result means                   │  6  h2
│ Formula or method                       │  7
│ Worked example                          │  8
│ Assumptions and limitations             │  9
│ Practical notes                         │ 10
│ FAQs                                    │ 11
│ Related tools                           │ 12
│ Sources · last reviewed 2026-08-31 PST  │ 13
│ Disclaimer                              │ 14
│ (footer)                                │
└─────────────────────────────────────────┘
```

Section headings 6–14 are `h2`. Do not collapse 9–14 behind an accordion in Phase 2. Safety is already visible above the fold; the rest is for the person who has to defend the number.

---


---

## 9. Prototype A — Speaker delay

**URL:** `/audio-live-sound/speaker-delay`  
**Title:** Speaker delay calculator  
**One sentence:** “How many milliseconds to put on the closer (earlier) path so both arrivals meet at one seat, and which channel to delay.”

**Safety (visible, `warn`):**

> Geometric delay is valid at one seat. Haas extra is signal- and level-dependent, not a physical constant. Verify with an impulse response (or a known measurement method) before the show. This is not Smaart and not a manufacturer preset.


---

## 10. Prototype B — Fret position

**URL:** `/guitar-building/fret-position-calculator`  
**Title:** Fret position calculator  
**One sentence:** “Nut-to-fret distances for any scale length in 12-TET, so you can mark a board from the nut and check the 12th before you saw.”

**Safety (visible, `irreversible`):**

> Theoretical 12-TET locations, not finished intonation. Verify the 12th fret equals half the scale (S/2) before you saw. Sawing is irreversible.


---

