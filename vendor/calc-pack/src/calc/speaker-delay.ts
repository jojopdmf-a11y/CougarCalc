/**
 * Speaker delay / time-alignment.
 *
 * c = 331.3 + 0.6 × T_C m/s  (Sengpiel simplified; not AudioCalcs 1086+1.08×T_F)
 * delay_ms = 1000 × |rA − rB| / c
 * t_set = delay_ms + t_Haas − t_lat_early + t_lat_late
 *
 * Delay the closer (earlier) path (shorter acoustic + latency). Result
 * milliseconds are always ≥ 0.
 *
 * If existing latency already overshoots geometry, geometric delay is 0 and
 * the result card says so. Haas is a separate labeled choice.
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
	/** Acoustic geometric delay: 1000 × |rA−rB| / c. Never rounded. */
	delay_ms: number;
	geometricDelay_ms: number;
	haasMs: number;
	latencyAMs: number;
	latencyBMs: number;
	t_lat_early: number;
	t_lat_late: number;
	/** delay_ms − t_lat_early + t_lat_late, before clamp. */
	t_geo_raw: number;
	latencyOvershoot: boolean;
	overshootMs: number;
	/** Geometric contribution actually applied (≥ 0). */
	t_geo_applied: number;
	/** Processor set: t_geo_applied + t_Haas. Always ≥ 0. */
	t_set: number;
	delayChannel: DelayChannel;
	delayChannelLabel: string;
	fartherPath: DelayChannel;
	samples: number | null;
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

function latOf(path: DelayChannel, latA: number, latB: number): number {
	if (path === 'A') return latA;
	if (path === 'B') return latB;
	return 0;
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

	const tA = (1000 * pathA_m) / c_m_s + latencyAMs;
	const tB = (1000 * pathB_m) / c_m_s + latencyBMs;

	let delayChannel: DelayChannel;
	if (tA === tB) {
		delayChannel = 'none';
	} else if (tA < tB) {
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

	const acousticEarly: DelayChannel =
		pathA_m === pathB_m ? 'none' : pathA_m < pathB_m ? 'A' : 'B';
	const acousticLate: DelayChannel =
		acousticEarly === 'A' ? 'B' : acousticEarly === 'B' ? 'A' : 'none';
	const leftoverAcoustic =
		delay_ms - latOf(acousticEarly, latencyAMs, latencyBMs) + latOf(acousticLate, latencyAMs, latencyBMs);
	const latencyOvershoot = leftoverAcoustic < 0;
	const overshootMs = latencyOvershoot ? -leftoverAcoustic : 0;

	const other: DelayChannel = delayChannel === 'A' ? 'B' : delayChannel === 'B' ? 'A' : 'none';
	const t_lat_early = latOf(delayChannel, latencyAMs, latencyBMs);
	const t_lat_late = latOf(other, latencyAMs, latencyBMs);
	const t_geo_raw = delayChannel === 'none' ? 0 : delay_ms - t_lat_early + t_lat_late;
	const t_geo_applied = latencyOvershoot || t_geo_raw < 0 ? 0 : t_geo_raw;
	const t_set = t_geo_applied + haasMs;

	const delayChannelLabel =
		delayChannel === 'none' ? 'Paths match at this seat' : `Delay path ${delayChannel}`;

	const samples = (t_set * sampleRate) / 1000;

	return {
		ok: true,
		c_m_s,
		pathA_m,
		pathB_m,
		pathDifference_m,
		delay_ms,
		geometricDelay_ms: delay_ms,
		haasMs,
		latencyAMs,
		latencyBMs,
		t_lat_early,
		t_lat_late,
		t_geo_raw,
		latencyOvershoot,
		overshootMs,
		t_geo_applied,
		t_set,
		delayChannel,
		delayChannelLabel,
		fartherPath,
		samples,
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

	if (result.latencyOvershoot) {
		core += ` Existing latency overshoots geometry by ${formatDelayMsDisplay(result.overshootMs)} ms; no geometric delay added.`;
	}

	return `${core} Verify with IR at the seat.`;
}
