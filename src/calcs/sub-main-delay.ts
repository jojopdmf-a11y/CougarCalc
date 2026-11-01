/**
 * Sub / main crossover delay — geometric only.
 * This page’s air line (Visual Acoustic / Lumen delay page):
 *   c = 331.3 + 0.606 × T_C m/s
 * At 20 °C: 331.3 + 12.12 = 343.42 m/s (≈ 343.4). Do not hardcode 343.
 * Speaker-delay keeps Sengpiel simplified 0.6×T → 343.3 (locked A-C-01).
 * Do not unify the two c lines without CougarCalc UnHOLD.
 *
 * Δt = |r_sub − r_main| / c. Delay the earlier path.
 * φ(°) = 360 · fc · Δt_seconds, wrap ±180°, only if fc is entered.
 * No filter phase / FIR / SubAligner data.
 */

import { lengthToMeters, temperatureToCelsius, type LengthUnit, type TemperatureUnit } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatMeters, formatMs } from './format.ts';

export const SUB_MAIN_C0 = 331.3;
export const SUB_MAIN_LINEAR_CT = 0.606;

export function speedOfSoundSubMain(tempC: number): number {
	return SUB_MAIN_C0 + SUB_MAIN_LINEAR_CT * tempC;
}

/** Wrap degrees into (−180, 180]. */
export function wrapPhaseDeg(deg: number): number {
	const x = ((((deg + 180) % 360) + 360) % 360) - 180;
	return x === -180 ? 180 : x;
}

export type SubMainInput = {
	pathSub: number;
	pathMain: number;
	lengthUnit: LengthUnit;
	temperature: number;
	temperatureUnit: TemperatureUnit;
	filterDelayMs: number | null;
	crossoverHz?: number | null;
};

export type SubMainSuccess = {
	ok: true;
	c_m_s: number;
	pathSub_m: number;
	pathMain_m: number;
	geometricMs: number;
	delayChannel: 'sub' | 'main' | 'none';
	filterDelayMs: number;
	t_set: number;
	phaseDeg: number | null;
};

export type SubMainResult = SubMainSuccess | CalcFailure;

export function computeSubMainDelay(input: SubMainInput): SubMainResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.pathSub) || input.pathSub <= 0) {
		errors.push({ field: 'pathSub', message: 'Sub path must be greater than zero.' });
	}
	if (!Number.isFinite(input.pathMain) || input.pathMain <= 0) {
		errors.push({ field: 'pathMain', message: 'Main path must be greater than zero.' });
	}
	if (!Number.isFinite(input.temperature)) {
		errors.push({ field: 'temperature', message: 'Temperature must be a finite number.' });
	}
	if (input.filterDelayMs !== null && (!Number.isFinite(input.filterDelayMs) || input.filterDelayMs < 0)) {
		errors.push({ field: 'filterDelayMs', message: 'Filter delay must be ≥ 0 ms, or left empty for none.' });
	}
	if (input.crossoverHz != null && (!Number.isFinite(input.crossoverHz) || input.crossoverHz <= 0)) {
		errors.push({ field: 'crossoverHz', message: 'Crossover frequency must be greater than zero, or left empty.' });
	}
	if (errors.length) return fail(errors);

	const c = speedOfSoundSubMain(temperatureToCelsius(input.temperature, input.temperatureUnit));
	const pathSub_m = lengthToMeters(input.pathSub, input.lengthUnit);
	const pathMain_m = lengthToMeters(input.pathMain, input.lengthUnit);
	const tSub = pathSub_m / c;
	const tMain = pathMain_m / c;
	const dtSeconds = Math.abs(tSub - tMain);
	const geometricMs = 1000 * dtSeconds;
	let delayChannel: 'sub' | 'main' | 'none' = 'none';
	if (tSub < tMain) delayChannel = 'sub';
	else if (tMain < tSub) delayChannel = 'main';
	const filterDelayMs = input.filterDelayMs ?? 0;
	const t_set = geometricMs + filterDelayMs;
	const phaseDeg = input.crossoverHz == null ? null : wrapPhaseDeg(360 * input.crossoverHz * dtSeconds);
	return { ok: true, c_m_s: c, pathSub_m, pathMain_m, geometricMs, delayChannel, filterDelayMs, t_set, phaseDeg };
}

export function formatSubMainCopy(result: SubMainSuccess): string {
	const ch =
		result.delayChannel === 'none'
			? 'Paths equal.'
			: `Delay the ${result.delayChannel} (earlier) path.`;
	const phase =
		result.phaseDeg === null ? '' : ` Geometric φ ${result.phaseDeg.toFixed(1)}° (wrap ±180°).`;
	return `Geometric ${formatMs(result.geometricMs)} ms. Filter note ${formatMs(result.filterDelayMs)} ms. t_set ${formatMs(result.t_set)} ms. ${ch}${phase} Physics only — not a SubAligner trace. Path difference ${formatMeters(Math.abs(result.pathSub_m - result.pathMain_m))} m. c = 331.3 + 0.606×T_C (not speaker-delay 0.6×T).`;
}
