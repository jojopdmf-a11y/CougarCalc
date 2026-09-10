import { formatFixed, nearlyEqual } from '../shared/format'
import type { VerifyGate } from '../shared/types'

export const LOCK_SCALE_IN = 25.5
export const LOCK_FRET = 12
export const LOCK_D12_IN = 12.75
export const LOCK_DISPLAY = '12.750'
export const PASS_ABS_TOL = 5e-4

export function distanceFromNut(scaleLength: number, fret: number): number {
  return scaleLength * (1 - 2 ** (-fret / 12))
}

export function remainingToSaddle(scaleLength: number, fret: number): number {
  return scaleLength - distanceFromNut(scaleLength, fret)
}

export function formatInches(value: number): string {
  return formatFixed(value, 3)
}

export function fretGate(actual: number, expected: number, absTol = PASS_ABS_TOL): VerifyGate {
  return nearlyEqual(actual, expected, absTol) ? 'Pass' : 'Fail'
}

export function fretPosition(scaleLength = LOCK_SCALE_IN, fret = LOCK_FRET) {
  const d = distanceFromNut(scaleLength, fret)
  const display = formatInches(d)
  const gate = fret === LOCK_FRET && scaleLength === LOCK_SCALE_IN
    ? fretGate(d, LOCK_D12_IN)
    : fretGate(d, d)
  return {
    fret,
    scaleLength,
    d,
    display,
    gate,
    label: `d(${fret})=${display} ${gate}`,
  }
}
