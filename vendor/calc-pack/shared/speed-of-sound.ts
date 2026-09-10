/** Locked dry-air approximation used by speaker-delay. */

export const SPEED_OF_SOUND_BASE_MPS = 331.3
export const SPEED_OF_SOUND_SLOPE = 0.606
export const LOCK_TEMPERATURE_C = 20

export function speedOfSoundMps(tempC: number): number {
  return SPEED_OF_SOUND_BASE_MPS + SPEED_OF_SOUND_SLOPE * tempC
}

/** 20 °C lock: 343.42 m/s */
export const SPEED_OF_SOUND_20C_MPS = speedOfSoundMps(LOCK_TEMPERATURE_C)
