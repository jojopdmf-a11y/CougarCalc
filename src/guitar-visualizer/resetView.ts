import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

/** Matches GuitarScene default camera framing for shape-set 1. */
export function resetView(controls: OrbitControlsImpl | null) {
  if (!controls) return
  controls.object.position.set(2.2, 1.6, 1.1)
  controls.target.set(0, 0.12, 0.55)
  controls.update()
}
