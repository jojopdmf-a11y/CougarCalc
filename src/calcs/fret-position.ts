/**
 * 12-TET fret positions from the nut face.
 *
 *   d(n) = S * (1 - 1 / 2^(n/12))
 *
 * so d(12) = S/2 exactly in real arithmetic.
 *
 * Datum is nut face only. Zero-fret shift is not in this prototype.
 * 1 in = 25.4 mm is a conversion, not a maker spec.
 * 650 mm is not 25.5 in (25.500 × 25.4 = 647.7 mm).
 */

import { convertScale } from './units.ts';

export const MIN_FRET_COUNT = 1;
export const MAX_FRET_COUNT = 36;
export const DEFAULT_FRET_COUNT = 22;

export const MIN_SCALE_IN = 8;
export const MAX_SCALE_IN = 40;

export const FENDER_SCALE_IN = 25.5;
export const METRIC_650_MM = 650;
export const METRIC_660_MM = 660;

export type ScaleUnit = 'in' | 'mm';

export type FretRow = {
	fret: number;
	distanceFromNut: number;
	fretToFret: number;
};

export type FretFieldError = {
	field: 'scale' | 'fretCount' | 'kerf' | 'form';
	message: string;
};

export type FretPositionInput = {
	scale: number;
	scaleUnit: ScaleUnit;
	fretCount?: number;
	outputUnit?: ScaleUnit;
	/** Recorded only. Slot center remains d(n); kerf does not shift the cut. */
	kerf?: number;
};

export type FretPositionSuccess = {
	ok: true;
	scale: number;
	scaleUnit: ScaleUnit;
	fretCount: number;
	twelfthFret: number;
	halfScale: number;
	twelfthEqualsHalf: boolean;
	twelfthCheck: 'Pass' | 'Check failed';
	kerf: number | null;
	rows: FretRow[];
};

export type FretPositionFailure = {
	ok: false;
	errors: FretFieldError[];
};

export type FretPositionResult = FretPositionSuccess | FretPositionFailure;

/** 12-TET nut-to-fret distance. Intermediates are not rounded. */
export function tetDistanceFromNut(scale: number, fret: number): number {
	return scale * (1 - 1 / 2 ** (fret / 12));
}

/**
 * Sequential Rule of 18: each fret is remaining length / 18.
 * Kept as a pure helper; not shown in this prototype’s UI.
 */
export function ruleOf18DistanceFromNut(scale: number, fret: number): number {
	let remaining = scale;
	let fromNut = 0;
	for (let i = 1; i <= fret; i++) {
		const step = remaining / 18;
		fromNut += step;
		remaining -= step;
	}
	return fromNut;
}

export function computeFretPositions(input: FretPositionInput): FretPositionResult {
	const errors: FretFieldError[] = [];
	const fretCount = input.fretCount ?? DEFAULT_FRET_COUNT;
	const outputUnit = input.outputUnit ?? input.scaleUnit;

	if (!Number.isFinite(input.scale)) {
		errors.push({ field: 'scale', message: 'Scale length must be a finite number.' });
	} else if (input.scale <= 0) {
		errors.push({ field: 'scale', message: 'Scale length must be greater than zero.' });
	}

	if (!Number.isFinite(fretCount)) {
		errors.push({ field: 'fretCount', message: 'Fret count must be a finite number.' });
	} else if (!Number.isInteger(fretCount)) {
		errors.push({ field: 'fretCount', message: 'Fret count must be a whole number.' });
	} else if (fretCount < MIN_FRET_COUNT || fretCount > MAX_FRET_COUNT) {
		errors.push({
			field: 'fretCount',
			message: `Fret count must be between ${MIN_FRET_COUNT} and ${MAX_FRET_COUNT}.`,
		});
	}

	if (input.kerf !== undefined) {
		if (!Number.isFinite(input.kerf)) {
			errors.push({ field: 'kerf', message: 'Kerf must be a finite number if provided.' });
		} else if (input.kerf < 0) {
			errors.push({ field: 'kerf', message: 'Kerf cannot be negative. Leave empty for none.' });
		}
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	const scaleInInches = convertScale(input.scale, input.scaleUnit, 'in');
	if (scaleInInches < MIN_SCALE_IN || scaleInInches > MAX_SCALE_IN) {
		return {
			ok: false,
			errors: [
				{
					field: 'scale',
					message: `Scale length equals ${scaleInInches} in after conversion. This tool accepts ${MIN_SCALE_IN}–${MAX_SCALE_IN} in.`,
				},
			],
		};
	}

	const scale = convertScale(input.scale, input.scaleUnit, outputUnit);
	const rows: FretRow[] = [];
	let previousTet = 0;

	for (let n = 1; n <= fretCount; n++) {
		const distanceFromNut = tetDistanceFromNut(scale, n);
		rows.push({
			fret: n,
			distanceFromNut,
			fretToFret: distanceFromNut - previousTet,
		});
		previousTet = distanceFromNut;
	}

	const twelfthFret = tetDistanceFromNut(scale, 12);
	const halfScale = scale / 2;
	const twelfthEqualsHalf = twelfthFret === halfScale;

	return {
		ok: true,
		scale,
		scaleUnit: outputUnit,
		fretCount,
		twelfthFret,
		halfScale,
		twelfthEqualsHalf,
		twelfthCheck: twelfthEqualsHalf ? 'Pass' : 'Check failed',
		kerf: input.kerf === undefined ? null : input.kerf,
		rows,
	};
}

export function formatScaleDisplay(value: number, unit: ScaleUnit): string {
	return unit === 'in' ? value.toFixed(3) : value.toFixed(2);
}

export function formatFretCopy(result: FretPositionSuccess): string {
	const unit = result.scaleUnit;
	const s = formatScaleDisplay(result.scale, unit);
	const d12 = formatScaleDisplay(result.twelfthFret, unit);
	return `${s} ${unit} scale, ${result.fretCount} frets, 12-TET from nut. 12th fret ${d12} ${unit} = S/2. Theoretical locations; verify before sawing.`;
}

export function formatFretTableTsv(result: FretPositionSuccess): string {
	const unit = result.scaleUnit;
	const lines = [`fret\tfrom nut (${unit})\tfret to fret (${unit})`];
	for (const row of result.rows) {
		lines.push(
			`${row.fret}\t${formatScaleDisplay(row.distanceFromNut, unit)}\t${formatScaleDisplay(row.fretToFret, unit)}`,
		);
	}
	return lines.join('\n');
}
