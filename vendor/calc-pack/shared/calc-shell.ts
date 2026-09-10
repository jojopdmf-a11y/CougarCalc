import type { CalcSectionId } from './types'

/** Locked 14-section order. Do not reorder without UX. */
export const CALC_SECTIONS: readonly CalcSectionId[] = [
  'family',
  'title',
  'lede',
  'safety-lede',
  'inputs',
  'units',
  'presets',
  'compute',
  'result',
  'safety-result',
  'breakdown',
  'verify',
  'formula',
  'print',
] as const

export const CALC_SECTION_COUNT = 14

export function assertCalcSectionOrder(ids: readonly string[]): boolean {
  if (ids.length !== CALC_SECTIONS.length) return false
  return ids.every((id, i) => id === CALC_SECTIONS[i])
}
