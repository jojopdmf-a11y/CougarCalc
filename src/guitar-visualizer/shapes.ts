import * as THREE from 'three'

/**
 * Silhouette paths for the Strat-style redo.
 * Brand-agnostic outlines: double-cut body + classic 6-inline paddle headstock.
 *
 * Body path derived from an open CNC Strat-style outline (dnewcome/grout
 * strat-body-outline.svg), scaled to scene units. No logos/trademarks.
 *
 * Units are scene meters; +Y in 2D = toward the headstock before extrudeFaceUp().
 * X: bass (−) / treble (+). Y: bridge (−) / neck (+).
 */

/** Body face sits near this world Y after extrudeFaceUp (top of slab). ~1.75" at body scale. */
export const BODY_TOP_Y = 0.2

/** Neck-pocket mouth Y in the Strat body shape (before extrude centering). */
export const STRAT_POCKET_MOUTH_Y = 0.756

/** Approximate pocket floor (heel butt) Y in the Strat body shape. */
export const STRAT_POCKET_FLOOR_Y = 0.669

export function extrudeFaceUp(
  shape: THREE.Shape,
  depth: number,
  bevel = true,
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel,
    bevelThickness: bevel ? 0.016 : 0,
    bevelSize: bevel ? 0.012 : 0,
    bevelSegments: bevel ? 3 : 0,
    curveSegments: 48,
  })
  // Face in XY, +Y toward neck → after rotateX(+90°), +Y maps to +Z (neck).
  geo.rotateX(Math.PI / 2)
  geo.computeBoundingBox()
  const box = geo.boundingBox!
  // Pin bottom to y=0 and center XZ — keeps the top face at ~depth for hardware seating.
  geo.translate(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2)
  return geo
}

/**
 * Double-cut / Strat-style body — traced CNC outline.
 * Clear longer bass horn, shorter treble horn, waist pinch, round lower bout,
 * and rectangular neck-pocket notch.
 */
export function createDoubleCutStratBodyShape(): THREE.Shape {
  const s = new THREE.Shape()
  // Start at treble wall of neck pocket (lower corner), go around lower bout →
  // bass horn → pocket mouth → close up the pocket wall.
  s.moveTo(0.12761, 0.53865)
  s.bezierCurveTo(0.12772, 0.52203, 0.13666, 0.50676, 0.15136, 0.49907)
  s.bezierCurveTo(0.17239, 0.4881, 0.19455, 0.47928, 0.21739, 0.47284)
  s.bezierCurveTo(0.23232, 0.46865, 0.24781, 0.46651, 0.2633, 0.46651)
  // Treble horn tip (shorter than bass)
  s.bezierCurveTo(0.42387, 0.46651, 0.44366, 0.63997, 0.45, 0.67728)
  s.bezierCurveTo(0.45237, 0.69108, 0.45859, 0.70386, 0.46798, 0.71426)
  s.bezierCurveTo(0.48132, 0.72907, 0.50043, 0.73767, 0.52044, 0.73767)
  s.bezierCurveTo(0.54396, 0.73767, 0.5659, 0.72602, 0.57913, 0.70657)
  // Treble flank → waist → lower bout
  s.bezierCurveTo(0.60932, 0.6619, 0.62549, 0.6091, 0.62549, 0.55516)
  s.bezierCurveTo(0.62549, 0.34325, 0.50948, 0.25279, 0.50948, 0.10013)
  s.bezierCurveTo(0.50948, 0.05954, 0.5183, 0.01928, 0.53514, -0.01781)
  s.bezierCurveTo(0.559, -0.06983, 0.58298, -0.12184, 0.60717, -0.17386)
  s.bezierCurveTo(0.64562, -0.25641, 0.67604, -0.34246, 0.6982, -0.43055)
  s.bezierCurveTo(0.71087, -0.48143, 0.71731, -0.53367, 0.71731, -0.58603)
  s.bezierCurveTo(0.71731, -0.60661, 0.71641, -0.6273, 0.71449, -0.64777)
  s.bezierCurveTo(0.71098, -0.68475, 0.70261, -0.72105, 0.68961, -0.75587)
  s.bezierCurveTo(0.67943, -0.78313, 0.66552, -0.80879, 0.64822, -0.8322)
  // Bridge-end round
  s.bezierCurveTo(0.60944, -0.88478, 0.559, -0.92787, 0.50088, -0.95806)
  s.bezierCurveTo(0.43122, -0.99413, 0.35467, -1.01516, 0.27642, -1.0198)
  s.bezierCurveTo(0.22983, -1.02251, 0.18324, -1.02421, 0.13666, -1.02455)
  s.bezierCurveTo(0.10217, -1.02477, 0.06768, -1.025, 0.0333, -1.025)
  s.bezierCurveTo(-0.03172, -1.025, -0.09663, -1.02443, -0.16153, -1.0233)
  s.bezierCurveTo(-0.22226, -1.02229, -0.28264, -1.01641, -0.34235, -1.00578)
  s.bezierCurveTo(-0.38249, -0.99865, -0.42184, -0.98734, -0.45961, -0.97197)
  s.bezierCurveTo(-0.51683, -0.94856, -0.56873, -0.91362, -0.61192, -0.8694)
  s.bezierCurveTo(-0.63477, -0.84588, -0.65422, -0.81931, -0.66959, -0.79036)
  s.bezierCurveTo(-0.69945, -0.73405, -0.71573, -0.67163, -0.7172, -0.60797)
  s.bezierCurveTo(-0.71731, -0.60356, -0.71731, -0.59903, -0.71731, -0.59462)
  // Bass flank up through waist
  s.bezierCurveTo(-0.71731, -0.56918, -0.71562, -0.54374, -0.71222, -0.51852)
  s.bezierCurveTo(-0.70148, -0.43846, -0.6835, -0.35942, -0.65851, -0.28253)
  s.bezierCurveTo(-0.63036, -0.19534, -0.59688, -0.10986, -0.55844, -0.02652)
  s.bezierCurveTo(-0.54577, 0.00107, -0.53413, 0.02912, -0.52361, 0.05761)
  s.bezierCurveTo(-0.50767, 0.10081, -0.49941, 0.14661, -0.49941, 0.19263)
  // Deep bass cutaway → long bass horn
  s.bezierCurveTo(-0.49941, 0.3584, -0.61837, 0.50326, -0.61837, 0.75599)
  s.bezierCurveTo(-0.61837, 0.91859, -0.55459, 1.025, -0.47657, 1.025)
  s.bezierCurveTo(-0.44118, 1.025, -0.41064, 0.99402, -0.41064, 0.94166)
  s.bezierCurveTo(-0.41064, 0.66892, -0.22825, 0.66869, -0.2097, 0.66869)
  // Into neck pocket (bass wall → mouth → treble wall)
  s.bezierCurveTo(-0.13338, 0.66869, -0.11732, 0.73088, -0.11506, 0.73846)
  s.bezierCurveTo(-0.11178, 0.74886, -0.10205, 0.75599, -0.09108, 0.75599)
  s.lineTo(0.1033, 0.75599)
  s.bezierCurveTo(0.11506, 0.75599, 0.12467, 0.74649, 0.12467, 0.73484)
  // Treble pocket wall back to start
  s.lineTo(0.12761, 0.53865)
  s.closePath()
  return s
}

/** Softer single-cut silhouette (placeholder until its own shape set). */
export function createSingleCutBodyShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.14, 0.9)
  s.bezierCurveTo(-0.35, 0.98, -0.62, 0.85, -0.7, 0.55)
  s.bezierCurveTo(-0.78, 0.2, -0.75, -0.25, -0.62, -0.55)
  s.bezierCurveTo(-0.5, -0.85, -0.22, -1.05, 0.12, -1.08)
  s.bezierCurveTo(0.45, -1.05, 0.7, -0.85, 0.75, -0.5)
  s.bezierCurveTo(0.8, -0.1, 0.72, 0.3, 0.55, 0.55)
  s.bezierCurveTo(0.42, 0.72, 0.28, 0.88, 0.12, 0.92)
  s.bezierCurveTo(0.02, 0.88, -0.06, 0.88, -0.14, 0.9)
  return s
}

/** Offset / asymmetric silhouette (placeholder until its own shape set). */
export function createOffsetBodyShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.1, 0.88)
  s.bezierCurveTo(-0.3, 0.95, -0.55, 0.82, -0.62, 0.55)
  s.bezierCurveTo(-0.78, 0.25, -0.85, -0.15, -0.7, -0.48)
  s.bezierCurveTo(-0.55, -0.82, -0.2, -1.05, 0.2, -1.02)
  s.bezierCurveTo(0.55, -0.95, 0.82, -0.65, 0.78, -0.25)
  s.bezierCurveTo(0.75, 0.1, 0.55, 0.4, 0.35, 0.55)
  s.bezierCurveTo(0.55, 0.7, 0.5, 0.92, 0.28, 0.98)
  s.bezierCurveTo(0.12, 0.95, 0.0, 0.9, -0.1, 0.88)
  return s
}

/**
 * Classic asymmetric 6-inline paddle headstock.
 * Traced from published Strat-style builder proportions (brand-agnostic):
 * ~6.5" tip length, nut ~1-11/16", tip hooked toward bass, scalloped tuner edge.
 * Local coords: nut at y=0, tip toward +y; bass (−x) / treble (+x).
 */
export function createSixInlineHeadstockShape(): THREE.Shape {
  const s = new THREE.Shape()
  // Nut edge (matches fretboard width ~0.175 plus slight overhang)
  s.moveTo(-0.095, 0.0)
  s.lineTo(0.092, 0.0)

  // Treble edge — mostly clean, slight flare then taper to tip
  s.bezierCurveTo(0.108, 0.04, 0.118, 0.1, 0.122, 0.18)
  s.bezierCurveTo(0.126, 0.28, 0.12, 0.4, 0.1, 0.52)
  s.bezierCurveTo(0.088, 0.58, 0.07, 0.64, 0.045, 0.69)

  // Tip — classic hooked point toward bass side
  s.bezierCurveTo(0.025, 0.725, 0.0, 0.745, -0.03, 0.75)
  s.bezierCurveTo(-0.06, 0.754, -0.095, 0.74, -0.12, 0.71)
  s.bezierCurveTo(-0.14, 0.685, -0.152, 0.65, -0.158, 0.61)

  // Bass edge — scalloped pockets for 6 inline tuners (tip → nut)
  s.bezierCurveTo(-0.165, 0.56, -0.172, 0.52, -0.175, 0.48)
  s.bezierCurveTo(-0.178, 0.43, -0.176, 0.385, -0.172, 0.34)
  s.bezierCurveTo(-0.168, 0.295, -0.17, 0.25, -0.168, 0.205)
  s.bezierCurveTo(-0.166, 0.16, -0.162, 0.115, -0.155, 0.075)
  s.bezierCurveTo(-0.148, 0.04, -0.13, 0.015, -0.095, 0.0)

  return s
}

export function bodyShapeFor(kind: 'single-cut' | 'double-cut' | 'offset'): THREE.Shape {
  switch (kind) {
    case 'single-cut':
      return createSingleCutBodyShape()
    case 'double-cut':
      return createDoubleCutStratBodyShape()
    case 'offset':
      return createOffsetBodyShape()
  }
}
