import * as THREE from 'three'

/**
 * Silhouette paths for shape-set 1.
 * Brand-agnostic outlines: double-cut / Strat-style body + 6-inline headstock.
 * Units are scene meters; +Y in 2D = toward the headstock before extrudeFaceUp().
 */

/** Body face sits near this world Y after extrudeFaceUp (top of slab). */
export const BODY_TOP_Y = 0.17

export function extrudeFaceUp(
  shape: THREE.Shape,
  depth: number,
  bevel = true,
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel,
    bevelThickness: bevel ? 0.018 : 0,
    bevelSize: bevel ? 0.014 : 0,
    bevelSegments: bevel ? 2 : 0,
    curveSegments: 36,
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
 * Double-cut / Strat-style body.
 * Deep cutaways, longer bass horn, shorter treble horn — readable at a glance.
 */
export function createDoubleCutStratBodyShape(): THREE.Shape {
  const s = new THREE.Shape()
  // X: bass (−) / treble (+). Y: bridge (−) / neck (+).
  // Start at bass edge of neck pocket.
  s.moveTo(-0.11, 0.88)

  // Long bass horn (points past the pocket toward the headstock)
  s.bezierCurveTo(-0.22, 1.02, -0.42, 1.08, -0.55, 0.98)
  s.bezierCurveTo(-0.68, 0.88, -0.72, 0.68, -0.66, 0.5)

  // Deep bass cutaway into waist
  s.bezierCurveTo(-0.58, 0.34, -0.48, 0.22, -0.42, 0.08)
  s.bezierCurveTo(-0.55, -0.05, -0.7, -0.22, -0.74, -0.45)
  s.bezierCurveTo(-0.78, -0.7, -0.68, -0.95, -0.42, -1.08)

  // Bridge-end bout
  s.bezierCurveTo(-0.18, -1.18, 0.18, -1.18, 0.42, -1.08)
  s.bezierCurveTo(0.68, -0.95, 0.78, -0.7, 0.74, -0.45)
  s.bezierCurveTo(0.7, -0.22, 0.55, -0.05, 0.4, 0.1)

  // Treble waist → shorter rounded horn
  s.bezierCurveTo(0.32, 0.22, 0.28, 0.34, 0.34, 0.48)
  s.bezierCurveTo(0.42, 0.62, 0.52, 0.72, 0.48, 0.82)
  s.bezierCurveTo(0.44, 0.9, 0.3, 0.94, 0.14, 0.9)

  // Neck pocket mouth (treble → bass)
  s.lineTo(0.11, 0.88)
  s.lineTo(-0.11, 0.88)

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
 * Strongly asymmetric: straighter treble edge, scalloped bass edge, tipped point.
 */
export function createSixInlineHeadstockShape(): THREE.Shape {
  const s = new THREE.Shape()
  // Nut edge (wide), clockwise toward tip.
  s.moveTo(-0.07, 0.0)
  s.lineTo(0.075, 0.0)
  // Treble edge — mostly straight, slight taper
  s.lineTo(0.085, 0.12)
  s.bezierCurveTo(0.09, 0.28, 0.08, 0.42, 0.055, 0.52)
  // Tip bends toward bass side
  s.bezierCurveTo(0.03, 0.58, -0.02, 0.6, -0.07, 0.56)
  s.bezierCurveTo(-0.11, 0.52, -0.13, 0.46, -0.135, 0.4)
  // Bass edge — stepped / scalloped tuner side
  s.bezierCurveTo(-0.15, 0.34, -0.155, 0.28, -0.15, 0.22)
  s.bezierCurveTo(-0.145, 0.16, -0.14, 0.1, -0.13, 0.06)
  s.bezierCurveTo(-0.12, 0.03, -0.1, 0.01, -0.07, 0.0)
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
