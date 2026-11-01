/**
 * Speaker delay / time-alignment.
 *
 * c = 331.3 + 0.6 × T_C m/s  (Sengpiel simplified only; not AudioCalcs, not 344 m/s)
 *
 * t_A = r_A / c + L_A
 * t_B = r_B / c + L_B
 * Delay the earlier arrival by 1000 × |t_A − t_B| ms. Always ≥ 0.
 * Haas extra ADDS to that already-chosen channel. Latency can flip which channel.
 *
 * L is stored in milliseconds at the UI and converted to seconds here.
 */

import { lengthToMeters, metersToLength, temperatureToCelsius, type LengthUnit, type TemperatureUnit } from './units.ts';

export const LINEAR_C0 = 331.3;
export const LINEAR_CT = 0.6;

export const DEFAULT_TEMP_C = 20;
export const DEFAULT_SAMPLE_RATE = 48000;
export const SAMPLE_RATES = [44100, 48000, 96000] as const;

export type FillType = 'none' | 'front-fill' | 'underbalcony' | 'delay-tower';

/** Starting Haas offsets (ms). Practice range, not a physical constant. */
export const HAAS_SUGGESTION_MS: Record<FillType, number> = {
	none: 0,
	'front-fill': 8,
	underbalcony: 10,
	'delay-tower': 15,
};

export type DelayChannel = 'A' | 'B' | 'none';

export type FieldError = {
	field: 'pathA' | 'pathB' | 'temperature' | 'haasMs' | 'sampleRate' | 'latencyA' | 'latencyB' | 'form';
	message: string;
};

export type SpeakerDelayInput = {
	pathA: number;
	pathB: number;
	lengthUnit: LengthUnit;
	temperature: number;
	temperatureUnit: TemperatureUnit;
	haasMs?: number;
	latencyAMs?: number;
	latencyBMs?: number;
	sampleRate?: number;
};

export type SpeakerDelaySuccess = {
	ok: true;
	c_m_s: number;
	pathA_m: number;
	pathB_m: number;
	pathDifference_m: number;
	/** Acoustic times in seconds: r/c + L. */
	tA_s: number;
	tB_s: number;
	/** 1000 × |rA − rB| / c. Display/copy “geometric”. Never rounded. */
	delay_ms: number;
	/** 1000 × |tA − tB|. Always ≥ 0. */
	arrivalDelay_ms: number;
	haasMs: number;
	latencyAMs: number;
	latencyBMs: number;
	/** arrivalDelay_ms + Haas. Always ≥ 0. */
	t_set: number;
	delayChannel: DelayChannel;
	delayChannelLabel: string;
	fartherPath: DelayChannel;
	samples: number;
	nearestSample: number;
	temperatureC: number;
};

export type SpeakerDelayFailure = {
	ok: false;
	errors: FieldError[];
};

export type SpeakerDelayResult = SpeakerDelaySuccess | SpeakerDelayFailure;

const MIN_PATH_M = 0.01;
const MAX_PATH_M = 2000;
const MIN_TEMP_C = -40;
const MAX_TEMP_C = 50;
const MAX_HAAS_MS = 50;
const MAX_LATENCY_MS = 500;

export function speedOfSoundSengpiel(tempC: number): number {
	return LINEAR_C0 + LINEAR_CT * tempC;
}

export function computeSpeakerDelay(input: SpeakerDelayInput): SpeakerDelayResult {
	const errors: FieldError[] = [];
	const haasMs = input.haasMs ?? 0;
	const latencyAMs = input.latencyAMs ?? 0;
	const latencyBMs = input.latencyBMs ?? 0;
	const sampleRate = input.sampleRate ?? DEFAULT_SAMPLE_RATE;

	if (!Number.isFinite(input.pathA)) {
		errors.push({ field: 'pathA', message: 'Path A must be a finite number.' });
	} else if (input.pathA <= 0) {
		errors.push({ field: 'pathA', message: 'Path A must be greater than zero.' });
	}

	if (!Number.isFinite(input.pathB)) {
		errors.push({ field: 'pathB', message: 'Path B must be a finite number.' });
	} else if (input.pathB <= 0) {
		errors.push({ field: 'pathB', message: 'Path B must be greater than zero.' });
	}

	if (!Number.isFinite(input.temperature)) {
		errors.push({ field: 'temperature', message: 'Temperature must be a finite number.' });
	}

	if (!Number.isFinite(haasMs)) {
		errors.push({ field: 'haasMs', message: 'Haas extra must be a finite number.' });
	} else if (haasMs < 0) {
		errors.push({
			field: 'haasMs',
			message: 'Haas extra cannot be negative. Use fill type None for 0 ms.',
		});
	} else if (haasMs > MAX_HAAS_MS) {
		errors.push({
			field: 'haasMs',
			message: `Haas extra of ${haasMs} ms is outside the range this tool accepts (0–${MAX_HAAS_MS} ms).`,
		});
	}

	for (const [field, value, label] of [
		['latencyA', latencyAMs, 'Path A latency'],
		['latencyB', latencyBMs, 'Path B latency'],
	] as const) {
		if (!Number.isFinite(value)) {
			errors.push({ field, message: `${label} must be a finite number.` });
		} else if (value < 0) {
			errors.push({ field, message: `${label} cannot be negative. Leave the field empty for 0 ms.` });
		} else if (value > MAX_LATENCY_MS) {
			errors.push({
				field,
				message: `${label} of ${value} ms is outside the range this tool accepts (0–${MAX_LATENCY_MS} ms).`,
			});
		}
	}

	if (!Number.isFinite(sampleRate)) {
		errors.push({ field: 'sampleRate', message: 'Sample rate must be a finite number.' });
	} else if (!(SAMPLE_RATES as readonly number[]).includes(sampleRate)) {
		errors.push({ field: 'sampleRate', message: 'Sample rate must be 44.1, 48, or 96 kHz.' });
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	const pathA_m = lengthToMeters(input.pathA, input.lengthUnit);
	const pathB_m = lengthToMeters(input.pathB, input.lengthUnit);
	const temperatureC = temperatureToCelsius(input.temperature, input.temperatureUnit);

	if (pathA_m < MIN_PATH_M || pathA_m > MAX_PATH_M) {
		errors.push({
			field: 'pathA',
			message: `Path A equals ${pathA_m} m after conversion. Use a length between ${MIN_PATH_M} m and ${MAX_PATH_M} m.`,
		});
	}
	if (pathB_m < MIN_PATH_M || pathB_m > MAX_PATH_M) {
		errors.push({
			field: 'pathB',
			message: `Path B equals ${pathB_m} m after conversion. Use a length between ${MIN_PATH_M} m and ${MAX_PATH_M} m.`,
		});
	}
	if (temperatureC < MIN_TEMP_C || temperatureC > MAX_TEMP_C) {
		errors.push({
			field: 'temperature',
			message: `Temperature equals ${temperatureC} °C after conversion. This air formula is limited to ${MIN_TEMP_C} to ${MAX_TEMP_C} °C.`,
		});
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	const c_m_s = speedOfSoundSengpiel(temperatureC);
	const pathDifference_m = Math.abs(pathA_m - pathB_m);
	const delay_ms = (1000 * pathDifference_m) / c_m_s;

	const tA_s = pathA_m / c_m_s + latencyAMs / 1000;
	const tB_s = pathB_m / c_m_s + latencyBMs / 1000;
	const arrivalDelay_ms = 1000 * Math.abs(tA_s - tB_s);

	let delayChannel: DelayChannel;
	if (tA_s === tB_s) {
		delayChannel = 'none';
	} else if (tA_s < tB_s) {
		delayChannel = 'A';
	} else {
		delayChannel = 'B';
	}

	let fartherPath: DelayChannel;
	if (pathA_m === pathB_m) {
		fartherPath = 'none';
	} else if (pathA_m > pathB_m) {
		fartherPath = 'A';
	} else {
		fartherPath = 'B';
	}

	const t_set = arrivalDelay_ms + haasMs;
	const samples = (t_set * sampleRate) / 1000;
	const nearestSample = Math.round(samples);

	const delayChannelLabel =
		delayChannel === 'none' ? 'Paths match at this seat' : `Delay path ${delayChannel}`;

	return {
		ok: true,
		c_m_s,
		pathA_m,
		pathB_m,
		pathDifference_m,
		tA_s,
		tB_s,
		delay_ms,
		arrivalDelay_ms,
		haasMs,
		latencyAMs,
		latencyBMs,
		t_set,
		delayChannel,
		delayChannelLabel,
		fartherPath,
		samples,
		nearestSample,
		temperatureC,
	};
}

export function equivalentDistanceIn(meters: number, unit: LengthUnit): number {
	return metersToLength(meters, unit);
}

/** Display rounding for milliseconds (one decimal). Math never uses this. */
export function formatDelayMsDisplay(ms: number): string {
	return ms.toFixed(1);
}

export function formatDelayCopy(result: SpeakerDelaySuccess): string {
	const tSet = formatDelayMsDisplay(result.t_set);
	const geo = formatDelayMsDisplay(result.delay_ms);
	const haas = Number.isInteger(result.haasMs) ? String(result.haasMs) : formatDelayMsDisplay(result.haasMs);
	const tempLabel = result.temperatureC === 20 ? '20 °C' : `${result.temperatureC} °C`;
	const farther =
		result.fartherPath === 'none' ? 'Paths are the same length.' : `Farther path is path ${result.fartherPath}.`;
	const channel =
		result.delayChannel === 'none' ? 'Paths match' : `Delay path ${result.delayChannel}`;

	let core: string;
	if (result.haasMs === 0) {
		core = `${channel} ${tSet} ms (geometric) at ${tempLabel}. ${farther}`;
	} else {
		core = `${channel} ${tSet} ms (geometric ${geo} ms + Haas ${haas} ms) at ${tempLabel}. ${farther}`;
	}

	return `${core} Verify with IR at the seat.`;
}
