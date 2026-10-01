import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function resetView(controls: OrbitControlsImpl | null) {
  if (!controls) return
  controls.object.position.set(1.6, 1.2, 2.4)
  controls.target.set(0, 0.1, 0.4)
  controls.update()
}
