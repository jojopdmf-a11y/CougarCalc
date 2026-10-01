import * as THREE from 'three'

/**
 * Silhouette paths for shape-set 1.
 * Brand-agnostic outlines: double-cut / Strat-style body + 6-inline headstock.
 * Units are scene meters; +Y in 2D = toward the headstock before extrudeFaceUp().
 */

export function extrudeFaceUp(
  shape: THREE.Shape,
  depth: number,
  bevel = true,
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel,
    bevelThickness: bevel ? 0.022 : 0,
    bevelSize: bevel ? 0.018 : 0,
    bevelSegments: bevel ? 3 : 0,
    curveSegments: 28,
  })
  // Face in XY, +Y toward neck → after rotateX(+90°), +Y maps to +Z (neck).
  geo.rotateX(Math.PI / 2)
  geo.center()
  // Keep the top face near y ≈ +depth/2 after center; nudge so top sits near y=0.09.
  geo.translate(0, depth / 2, 0)
  return geo
}

/** Double-cut / Strat-style body — horns at neck end, rounded bout at bridge end. */
export function createDoubleCutStratBodyShape(): THREE.Shape {
  const s = new THREE.Shape()
  // Start at neck-pocket center (bass edge), go clockwise: upper horn → bout → lower horn → pocket.
  // X: bass (−) / treble (+). Y: bridge (−) / neck (+).
  s.moveTo(-0.12, 0.92)

  // Bass-side upper horn (longer, pointed)
  s.bezierCurveTo(-0.28, 0.98, -0.48, 0.95, -0.58, 0.78)
  s.bezierCurveTo(-0.68, 0.58, -0.66, 0.38, -0.55, 0.22)

  // Bass waist into upper bout
  s.bezierCurveTo(-0.72, 0.05, -0.78, -0.25, -0.72, -0.52)
  s.bezierCurveTo(-0.68, -0.78, -0.48, -0.98, -0.18, -1.05)

  // Bridge-end bottom curve
  s.bezierCurveTo(0.05, -1.1, 0.28, -1.08, 0.48, -0.95)
  s.bezierCurveTo(0.68, -0.78, 0.74, -0.52, 0.7, -0.28)

  // Treble waist into lower horn (shorter, rounder)
  s.bezierCurveTo(0.66, -0.05, 0.58, 0.18, 0.42, 0.32)
  s.bezierCurveTo(0.55, 0.48, 0.58, 0.68, 0.48, 0.82)
  s.bezierCurveTo(0.38, 0.92, 0.22, 0.96, 0.1, 0.92)

  // Neck pocket mouth (treble → bass)
  s.lineTo(0.1, 0.92)
  s.bezierCurveTo(0.02, 0.88, -0.04, 0.88, -0.12, 0.92)

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
 * Classic 6-inline paddle headstock (all tuners on the bass side).
 * Local 2D: +Y toward tip, X across; origin near the nut joint.
 */
export function createSixInlineHeadstockShape(): THREE.Shape {
  const s = new THREE.Shape()
  // Nut-edge (wide end), clockwise around paddle tip.
  s.moveTo(-0.08, 0.0)
  s.lineTo(0.08, 0.0)
  // Treble edge (no tuners) — gentle curve toward tip
  s.bezierCurveTo(0.1, 0.08, 0.11, 0.2, 0.1, 0.32)
  s.bezierCurveTo(0.08, 0.42, 0.04, 0.5, -0.02, 0.55)
  // Tip
  s.bezierCurveTo(-0.06, 0.58, -0.1, 0.56, -0.12, 0.5)
  // Bass edge (tuner side) — stepped paddle silhouette
  s.bezierCurveTo(-0.16, 0.42, -0.18, 0.32, -0.17, 0.22)
  s.bezierCurveTo(-0.16, 0.12, -0.14, 0.05, -0.08, 0.0)
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
