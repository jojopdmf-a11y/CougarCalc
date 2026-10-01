/** Brand-agnostic guitar visualizer config — spike types. */

export type Instrument = 'guitar' | 'bass'
export type BodyShape = 'single-cut' | 'double-cut' | 'offset'
export type Handedness = 'right' | 'left'
export type BodyFinish = 'black' | 'sunburst' | 'natural' | 'racing-green' | 'olympic-white'
export type HardwareColor = 'chrome' | 'black' | 'gold'
export type PickupLayout = 'S/S' | 'H/S/H' | 'H/H'
export type PickupKind = 'single' | 'humbucker'

export type ConfigState = {
  instrument: Instrument
  bodyShape: BodyShape
  handedness: Handedness
  bodyFinish: BodyFinish
  hardware: HardwareColor
  pickupLayout: PickupLayout
  highlightChanges: boolean
}

export type SocketId =
  | 'heel'
  | 'bridge-mount'
  | 'pickup-neck'
  | 'pickup-middle'
  | 'pickup-bridge'
  | 'headstock-joint'
  | 'tuner-row'

export type LoadStats = {
  startedAt: number
  readyAt: number | null
  loadMs: number | null
  fps: number | null
  memoryMb: number | null
}

export const FINISH_COLORS: Record<BodyFinish, string> = {
  black: '#1a1a1a',
  sunburst: '#8B4513',
  natural: '#C4A574',
  'racing-green': '#0B3D2E',
  'olympic-white': '#F2F0E8',
}

export const HARDWARE_COLORS: Record<HardwareColor, string> = {
  chrome: '#C0C8D0',
  black: '#2A2A2A',
  gold: '#D4AF37',
}

export function pickupSlots(layout: PickupLayout): PickupKind[] {
  switch (layout) {
    case 'S/S':
      return ['single', 'single']
    case 'H/S/H':
      return ['humbucker', 'single', 'humbucker']
    case 'H/H':
      return ['humbucker', 'humbucker']
  }
}

export function statusLine(config: ConfigState): string {
  const strings = config.instrument === 'guitar' ? '6-string' : '4-string'
  return `Building: ${strings}, ${config.bodyShape} body`
}

export const DEFAULT_CONFIG: ConfigState = {
  instrument: 'guitar',
  bodyShape: 'offset',
  handedness: 'right',
  bodyFinish: 'black',
  hardware: 'chrome',
  pickupLayout: 'H/S/H',
  highlightChanges: false,
}

/** Structural rules for the spike UI. */
export function isOptionEnabled(
  field: keyof ConfigState,
  value: string,
  config: ConfigState,
): boolean {
  if (field === 'instrument' && value === 'bass') {
    // Bass kit is out of spike scope — keep in skeleton, disable selection.
    return false
  }
  if (field === 'handedness' && value === 'left') {
    // Left-handed geometry is out of spike scope.
    return false
  }
  if (config.instrument === 'bass' && field === 'pickupLayout') {
    // Bass uses separate mesh/layout family (P / J) — not in spike.
    return false
  }
  return true
}
