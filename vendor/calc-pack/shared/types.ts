/** Portable calc-pack types. No DOM. */

export type ToolLane = 'audio-live-sound' | 'guitar-building'

export type ToolStatus = 'in-pack' | 'origin'

export type CalcSectionId =
  | 'family'
  | 'title'
  | 'lede'
  | 'safety-lede'
  | 'inputs'
  | 'units'
  | 'presets'
  | 'compute'
  | 'result'
  | 'safety-result'
  | 'breakdown'
  | 'verify'
  | 'formula'
  | 'print'

export type VerifyGate = 'Pass' | 'Warn' | 'Fail'

export type ToolRecord = {
  slug: string
  lane: ToolLane
  title: string
  sitePath: string
  status: ToolStatus
}
