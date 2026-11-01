/**
 * Mottola saddle compensation from 12th-fret cents error.
 * n = 12 + (e / 100)
 * d = ((s − (s / 2^(n/12))) − (s / 2)) × 2
 * Elmendorp unavailable — not used.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type SaddleUnit = 'in' | 'mm';

export type SaddleInput = {
	scale: number;
	centsError: number;
	unit: SaddleUnit;
};

export type SaddleSuccess = {
	ok: true;
	n: number;
	displacement: number;
	unit: SaddleUnit;
	direction: 'away-from-nut' | 'toward-nut' | 'none';
};

export type SaddleResult = SaddleSuccess | CalcFailure;

export function mottolaN(centsError: number): number {
	return 12 + centsError / 100;
}

export function mottolaDisplacement(scale: number, centsError: number): number {
	const n = mottolaN(centsError);
	return (scale - scale / 2 ** (n / 12) - scale / 2) * 2;
}

export function computeSaddleCompensation(input: SaddleInput): SaddleResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.scale) || input.scale <= 0) {
		errors.push({ field: 'scale', message: 'Scale length must be greater than zero.' });
	}
	if (!Number.isFinite(input.centsError)) {
		errors.push({ field: 'centsError', message: 'Enter 12th-fret cents error (negative if flat).' });
	}
	if (errors.length) return fail(errors);
	const n = mottolaN(input.centsError);
	const displacement = mottolaDisplacement(input.scale, input.centsError);
	const direction =
		displacement > 0 ? 'away-from-nut' : displacement < 0 ? 'toward-nut' : 'none';
	return { ok: true, n, displacement, unit: input.unit, direction };
}

export function formatSaddleCopy(result: SaddleSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	const dir =
		result.direction === 'away-from-nut'
			? 'Move saddle away from the nut (fretted note was sharp).'
			: result.direction === 'toward-nut'
				? 'Move saddle toward the nut (fretted note was flat).'
				: 'No displacement.';
	return `n = ${formatFixed(result.n, 4)}. d = ${formatFixed(result.displacement, digits)} ${result.unit}. ${dir} Mottola only. Elmendorp not used.`;
}
