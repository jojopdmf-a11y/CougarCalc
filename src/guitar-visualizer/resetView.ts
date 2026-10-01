import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

/** Matches GuitarScene default camera framing for the Strat silhouette redo. */
export function resetView(controls: OrbitControlsImpl | null) {
  if (!controls) return
  controls.object.position.set(2.35, 1.75, 1.15)
  controls.target.set(0, 0.14, 0.45)
  controls.update()
}
