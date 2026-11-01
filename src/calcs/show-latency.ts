/**
 * Show latency: series sum of stage times.
 * t_total = Σ t_i
 * t_ms = 1000 × N / fs
 * optional air path = c × t at 343 m/s @ 20 °C (Sengpiel 331.3+0.6×20)
 * Dante hops are discrete Audinate-table suggestions, not an interpolated law.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatMeters, formatMs } from './format.ts';

/** Sengpiel simplified at 20 °C. Same line as speaker-delay. */
export const AIR_C_20C = 331.3 + 0.6 * 20;

/**
 * Audinate Dante Controller support: latency vs switch hops.
 * Discrete rows only — do not interpolate.
 * https://support.getdante.com/hc/en-gb/articles/5508275296415-How-is-latency-adjusted-in-a-Dante-system
 */
export const DANTE_HOP_TABLE = [
	{ hops: 1, ms: 0.25, label: '1 switch hop (very small network) → 0.25 ms' },
	{ hops: 3, ms: 0.5, label: '3 switch hops (small network) → 0.5 ms' },
	{ hops: 5, ms: 1, label: '5 switch hops (medium network) → 1 ms' },
	{ hops: 10, ms: 2, label: '10 switch hops (large network) → 2 ms' },
	{ hops: 11, ms: 5, label: '+10 switch hops (very large network) → 5 ms' },
] as const;

export const PSW_ROUNDTRIP_GUIDELINE_MS = 5;

export type LatencyStage = {
	label: string;
	ms?: number;
	samples?: number;
	sampleRate?: number;
};

export type ShowLatencyInput = {
	stages: LatencyStage[];
	includeAirPath: boolean;
};

export type ShowLatencySuccess = {
	ok: true;
	totalMs: number;
	airPath_m: number | null;
	stageMs: number[];
};

export type ShowLatencyResult = ShowLatencySuccess | CalcFailure;

export function samplesToMs(samples: number, fs: number): number {
	return (1000 * samples) / fs;
}

export function computeShowLatency(input: ShowLatencyInput): ShowLatencyResult {
	const errors: FieldError[] = [];
	if (input.stages.length === 0) {
		errors.push({ field: 'stages', message: 'Add at least one stage.' });
	}
	const stageMs: number[] = [];
	input.stages.forEach((stage, i) => {
		if (stage.samples !== undefined && stage.samples !== null) {
			if (!Number.isFinite(stage.samples) || stage.samples < 0) {
				errors.push({ field: `samples-${i}`, message: `Stage ${i + 1}: sample count must be ≥ 0.` });
			}
			if (stage.sampleRate === undefined || !Number.isFinite(stage.sampleRate) || stage.sampleRate <= 0) {
				errors.push({ field: `fs-${i}`, message: `Stage ${i + 1}: sample rate must be greater than zero.` });
			} else if (Number.isFinite(stage.samples) && stage.samples >= 0) {
				stageMs[i] = samplesToMs(stage.samples, stage.sampleRate);
			}
		} else if (stage.ms !== undefined) {
			if (!Number.isFinite(stage.ms) || stage.ms < 0) {
				errors.push({ field: `ms-${i}`, message: `Stage ${i + 1}: time must be ≥ 0 ms.` });
			} else stageMs[i] = stage.ms;
		} else {
			errors.push({ field: `stage-${i}`, message: `Stage ${i + 1}: enter milliseconds or samples.` });
		}
	});
	if (errors.length) return fail(errors);

	const totalMs = stageMs.reduce((a, b) => a + b, 0);
	const airPath_m = input.includeAirPath ? AIR_C_20C * (totalMs / 1000) : null;
	return { ok: true, totalMs, airPath_m, stageMs };
}

export function formatShowLatencyCopy(result: ShowLatencySuccess): string {
	const air =
		result.airPath_m === null
			? 'Air path not requested.'
			: `Equivalent air path ${formatMeters(result.airPath_m)} m at ${AIR_C_20C} m/s (20 °C).`;
	return `Series total ${formatMs(result.totalMs)} ms. ${air} Controller latency is not analog I/O latency. PSW ~${PSW_ROUNDTRIP_GUIDELINE_MS} ms is a guideline, not a law.`;
}
