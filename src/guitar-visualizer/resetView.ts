import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function resetView(controls: OrbitControlsImpl | null) {
  if (!controls) return
  controls.object.position.set(2.2, 1.5, 2.8)
  controls.target.set(0, 0.95, 0)
  controls.update()
}
