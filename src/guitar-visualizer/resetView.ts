import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export type ViewPreset = 'full' | 'body-top' | 'headstock'

const PRESETS: Record<ViewPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  /** Default 3/4 overview of the whole guitar including headstock. */
  full: {
    position: [3.8, 3.0, 2.2],
    target: [0, 0.1, 0.95],
  },
  /** Slightly offset top-down to avoid OrbitControls gimbal lock. */
  'body-top': {
    position: [0.2, 4.6, 0.35],
    target: [0, 0.05, -0.05],
  },
  /** Top-down headstock so the hooked paddle silhouette reads clearly. */
  headstock: {
    position: [0.2, 1.55, 2.55],
    target: [-0.05, 0.18, 2.55],
  },
}

/** Apply a named framing preset (also used by Reset view → full). */
export function setViewPreset(controls: OrbitControlsImpl | null, preset: ViewPreset = 'full') {
  if (!controls) return
  const { position, target } = PRESETS[preset]
  controls.object.position.set(...position)
  controls.target.set(...target)
  controls.update()
}

/** Matches GuitarScene default camera framing for the Strat silhouette redo. */
export function resetView(controls: OrbitControlsImpl | null) {
  setViewPreset(controls, 'full')
}
