/**
 * 12-TET fret positions from the nut.
 *
 *   d(n) = S * (1 - 1 / 2^(n/12))
 *
 * so d(12) = S/2 exactly in real arithmetic.
 *
 * Optional Rule of 18 is a historical comparison, not 12-TET:
 *   d18(n) = S * (1 - (17/18)^n)
 * which is the closed form of sequential remaining-length / 18.
 */

import { convertScale } from './units.ts';

export const MIN_FRET_COUNT = 1;
export const MAX_FRET_COUNT = 36;
export const DEFAULT_FRET_COUNT = 22;

/** Practical shop bounds. Not a claim about what instruments exist. */
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
	ruleOf18FromNut: number | null;
	ruleOf18FretToFret: number | null;
};

export type FretFieldError = {
	field: 'scale' | 'fretCount' | 'form';
	message: string;
};

export type FretPositionInput = {
	scale: number;
	scaleUnit: ScaleUnit;
	fretCount?: number;
	showRuleOf18?: boolean;
	/** Unit to report distances in. Defaults to the input unit. */
	outputUnit?: ScaleUnit;
};

export type FretPositionSuccess = {
	ok: true;
	scale: number;
	scaleUnit: ScaleUnit;
	fretCount: number;
	showRuleOf18: boolean;
	twelfthFret: number;
	halfScale: number;
	twelfthEqualsHalf: boolean;
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
 * Sequential Rule of 18 closed form: each fret is remaining / 18.
 * Remaining after n frets is S * (17/18)^n.
 */
export function ruleOf18DistanceFromNut(scale: number, fret: number): number {
	return scale * (1 - (17 / 18) ** fret);
}

export function computeFretPositions(input: FretPositionInput): FretPositionResult {
	const errors: FretFieldError[] = [];
	const fretCount = input.fretCount ?? DEFAULT_FRET_COUNT;
	const showRuleOf18 = input.showRuleOf18 ?? false;
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
					message: `Scale length equals ${scaleInInches} in after conversion. This tool accepts ${MIN_SCALE_IN}–${MAX_SCALE_IN} in (${convertScale(MIN_SCALE_IN, 'in', 'mm')}–${convertScale(MAX_SCALE_IN, 'in', 'mm')} mm).`,
				},
			],
		};
	}

	const scale = convertScale(input.scale, input.scaleUnit, outputUnit);
	const rows: FretRow[] = [];
	let previousTet = 0;
	let previousR18 = 0;

	for (let n = 1; n <= fretCount; n++) {
		const distanceFromNut = tetDistanceFromNut(scale, n);
		const fretToFret = distanceFromNut - previousTet;
		const ruleOf18FromNut = showRuleOf18 ? ruleOf18DistanceFromNut(scale, n) : null;
		const ruleOf18FretToFret = showRuleOf18 && ruleOf18FromNut !== null ? ruleOf18FromNut - previousR18 : null;
		rows.push({
			fret: n,
			distanceFromNut,
			fretToFret,
			ruleOf18FromNut,
			ruleOf18FretToFret,
		});
		previousTet = distanceFromNut;
		if (ruleOf18FromNut !== null) {
			previousR18 = ruleOf18FromNut;
		}
	}

	const twelfthFret = tetDistanceFromNut(scale, 12);
	const halfScale = scale / 2;

	return {
		ok: true,
		scale,
		scaleUnit: outputUnit,
		fretCount,
		showRuleOf18,
		twelfthFret,
		halfScale,
		twelfthEqualsHalf: twelfthFret === halfScale,
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
	const check = result.twelfthEqualsHalf ? 'Pass' : 'Check failed';
	return `${s} ${unit} scale, ${result.fretCount} frets, 12-TET from nut. 12th fret ${d12} ${unit} = S/2 (${check}). Theoretical locations; verify before sawing.`;
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
