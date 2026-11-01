/**
 * Speaker impedance: series, parallel, bridged.
 * Bridged Z_ch = Z_load / 2  (each amplifier half sees half the load).
 * Ohm’s law at the speakON: V, I, P from the combination.
 * No mains / breaker. No invented 2×/4× power claims.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed, formatOhms } from './format.ts';

export type ImpedanceMode = 'series' | 'parallel' | 'bridged';

export type SpeakerImpedanceInput = {
	mode: ImpedanceMode;
	impedances: number[];
	voltageV?: number;
};

export type SpeakerImpedanceSuccess = {
	ok: true;
	zLoad: number;
	zPerChannel: number | null;
	currentA: number | null;
	powerW: number | null;
	mode: ImpedanceMode;
};

export type SpeakerImpedanceResult = SpeakerImpedanceSuccess | CalcFailure;

export function seriesZ(zs: number[]): number {
	return zs.reduce((a, b) => a + b, 0);
}

export function parallelZ(zs: number[]): number {
	const recip = zs.reduce((a, b) => a + 1 / b, 0);
	return 1 / recip;
}

export function computeSpeakerImpedance(input: SpeakerImpedanceInput): SpeakerImpedanceResult {
	const errors: FieldError[] = [];
	if (input.impedances.length === 0) {
		errors.push({ field: 'impedances', message: 'Enter at least one cabinet impedance.' });
	}
	input.impedances.forEach((z, i) => {
		if (!Number.isFinite(z) || z <= 0) {
			errors.push({ field: `z-${i}`, message: `Cabinet ${i + 1}: Z must be greater than zero.` });
		}
	});
	if (input.voltageV !== undefined && (!Number.isFinite(input.voltageV) || input.voltageV < 0)) {
		errors.push({ field: 'voltageV', message: 'SpeakON voltage must be ≥ 0, or left empty.' });
	}
	if (errors.length) return fail(errors);

	const zCombo = input.mode === 'parallel' ? parallelZ(input.impedances) : seriesZ(input.impedances);
	const zLoad = input.mode === 'bridged' ? (input.impedances.length === 1 ? input.impedances[0] : zCombo) : zCombo;
	const zPerChannel = input.mode === 'bridged' ? zLoad / 2 : null;

	let currentA: number | null = null;
	let powerW: number | null = null;
	if (input.voltageV !== undefined) {
		currentA = input.voltageV / zLoad;
		powerW = input.voltageV * currentA;
	}

	return { ok: true, zLoad, zPerChannel, currentA, powerW, mode: input.mode };
}

export function formatImpedanceCopy(result: SpeakerImpedanceSuccess): string {
	const ch =
		result.zPerChannel === null ? '' : ` Bridged Z_ch = ${formatOhms(result.zPerChannel)} Ω (Z_load/2).`;
	const vi =
		result.currentA === null || result.powerW === null
			? ''
			: ` I = ${formatFixed(result.currentA, 2)} A, P = ${formatFixed(result.powerW, 1)} W at the speakON.`;
	return `Z_load ${formatOhms(result.zLoad)} Ω (${result.mode}).${ch}${vi} No mains calculation. No 2×/4× power invention.`;
}
