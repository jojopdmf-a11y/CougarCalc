import { LOCK_TEMPERATURE_C, speedOfSoundMps } from '../shared/speed-of-sound'
import { formatFixed } from '../shared/format'

export const RESULT_LABEL = 'Delay path B'

export type SpeakerDelayInput = {
  pathA_m: number
  pathB_m: number
  tempC?: number
}

export function pathDelayMs(distanceM: number, tempC = LOCK_TEMPERATURE_C): number {
  return (distanceM / speedOfSoundMps(tempC)) * 1000
}

/** Delay applied to path B so it arrives with path A. */
export function pathBDelayMs(
  pathA_m: number,
  pathB_m: number,
  tempC = LOCK_TEMPERATURE_C,
): number {
  return pathDelayMs(pathB_m - pathA_m, tempC)
}

export function formatDelayMs(ms: number): string {
  return formatFixed(ms, 1)
}

export function speakerDelay(input: SpeakerDelayInput) {
  const tempC = input.tempC ?? LOCK_TEMPERATURE_C
  const ms = pathBDelayMs(input.pathA_m, input.pathB_m, tempC)
  return {
    label: RESULT_LABEL,
    ms,
    display: `${formatDelayMs(ms)} ms`,
    tempC,
    c_mps: speedOfSoundMps(tempC),
  }
}
