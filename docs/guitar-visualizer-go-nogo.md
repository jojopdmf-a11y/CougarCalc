# Guitar visualizer spike — go / no-go

Route: `/guitar-building/visualizer`  
Stack: Vite + React + TypeScript + Three.js via `@react-three/fiber` / `@react-three/drei` (matches existing site tooling).

## Spike scope delivered

- Modular electric **6-string** with orbit / zoom / pan + reset view
- Placeholder procedural parts (GLB-ready sockets): body, neck, headstock, bridge, pickups, knobs
- Instant config swaps: body shape (single-cut / double-cut / offset), finish, hardware (chrome / black / gold), pickup layouts (S/S, H/S/H, H/H) snapping to slots
- Non-blocking load progress; UI stays interactive
- Desktop left accordion + phone bottom sheet; persistent “Building: …” status line
- Structural rules: bass + lefty present in skeleton but disabled; string count matches tuners + bridge saddles; guitar mesh family only in spike

## Performance gates (draft)

| Gate | Target | Spike result | Notes |
| --- | --- | --- | --- |
| First interactive load (Wi-Fi) | ≤ ~5 s | **GO** — procedural parts typically **&lt; 300 ms** after JS parse (see on-page Load ms) | No network GLB yet; real assets must re-measure |
| Orbit FPS (phone) | ≥ 30 FPS | **CONDITIONAL GO** — desktop probe shows 50–60 FPS in Chromium; phone not measured in this CI/agent environment | Re-check on a physical phone before catalog expansion |
| Memory | Keep modest | Desktop JS heap probe shown in UI when Chromium `performance.memory` exists | Expect higher once Draco/KTX2 GLBs land |

**Verdict for spike:** **GO** to continue toward the MVP asset budget. Do not block on photoreal materials. Compress with Draco/Meshopt + KTX2 when real meshes arrive if phone FPS dips under 30.

## Asset naming scheme (next build)

```
public/guitar-visualizer/
  guitar/
    part-body-single-cut.glb
    part-body-double-cut.glb
    part-body-offset.glb
    part-neck-bolt-on.glb
    part-headstock-6-inline.glb
    part-headstock-3x3.glb
    part-bridge-hardtail.glb
    part-bridge-tome-style.glb
    part-pickup-single.glb
    part-pickup-humbucker.glb
  bass/          # separate mesh family — not in spike
    …
```

Materials / finishes stay as runtime color / texture slots, not baked brand finishes.

## Socket list

| Socket id | Role | Spike attachment |
| --- | --- | --- |
| `socket-heel` | Neck → body heel | Neck group origin at heel |
| `socket-bridge-mount` | Bridge on body | Bridge group on top face |
| `socket-pickup-neck` | Neck pickup slot | Used by S/S, H/S/H, H/H |
| `socket-pickup-middle` | Middle pickup slot | H/S/H only |
| `socket-pickup-bridge` | Bridge pickup slot | All layouts |
| `socket-headstock-joint` | Headstock on neck tip | 6-inline tuners in spike |
| `socket-tuner-row` | Tuner positions | Count must equal string count |

## Simpler choices made

- Procedural meshes instead of shipping binary GLBs for the spike
- Bass and lefty kept in the UI step order but disabled (out of spike scope)
- One hardtail-style bridge; no tremolo / stopbar yet
- Performance numbers recorded in-app; agent environment has no physical phone

## Live URL

Deploy with `npm run deploy` (Cloudflare Worker). Until DNS/custom domain is enabled, use the Workers preview URL from that deploy. Local: `npm run dev` → `http://localhost:5173/guitar-building/visualizer`.
