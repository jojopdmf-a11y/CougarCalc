/**
 * Fretboard radius / sagitta.
 * s = r − √(r² − (l/2)²)
 * r = (s² + (l/2)²) / (2s)
 * Compound/conical: Hartstein/Mottola Rx = Rn × (1 + Dx × (Sf − Sn) / (Df × Sn))
 * Warmoth published pairs were not re-fetched — not invented.
 */

import { convertScale } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type RadiusUnit = 'in' | 'mm';
export type RadiusMode = 'sagitta' | 'radius-from-sagitta' | 'conical';

export type RadiusInput = {
	mode: RadiusMode;
	radius?: number;
	width?: number;
	sagitta?: number;
	unit: RadiusUnit;
	rn?: number;
	sn?: number;
	sf?: number;
	df?: number;
	dx?: number;
};

export type RadiusSuccess = {
	ok: true;
	mode: RadiusMode;
	sagitta: number | null;
	radius: number | null;
	rx: number | null;
	unit: RadiusUnit;
};

export type RadiusResult = RadiusSuccess | CalcFailure;

export function sagittaFromRadius(r: number, width: number): number {
	const half = width / 2;
	return r - Math.sqrt(r * r - half * half);
}

export function radiusFromSagitta(s: number, width: number): number {
	const half = width / 2;
	return (s * s + half * half) / (2 * s);
}

/** Hartstein via Mottola: radius of the cone at distance Dx from the nut. */
export function hartsteinRx(rn: number, sn: number, sf: number, df: number, dx: number): number {
	return rn * (1 + (dx * (sf - sn)) / (df * sn));
}

export function computeFretboardRadius(input: RadiusInput): RadiusResult {
	const errors: FieldError[] = [];
	if (input.mode === 'sagitta') {
		if (input.radius === undefined || !Number.isFinite(input.radius) || input.radius <= 0) {
			errors.push({ field: 'radius', message: 'Radius r must be greater than zero.' });
		}
		if (input.width === undefined || !Number.isFinite(input.width) || input.width <= 0) {
			errors.push({ field: 'width', message: 'Chord width l must be greater than zero.' });
		}
		if (
			input.radius !== undefined &&
			input.width !== undefined &&
			input.width / 2 >= input.radius
		) {
			errors.push({ field: 'width', message: 'Chord half-width must be less than the radius.' });
		}
	} else if (input.mode === 'radius-from-sagitta') {
		if (input.sagitta === undefined || !Number.isFinite(input.sagitta) || input.sagitta <= 0) {
			errors.push({ field: 'sagitta', message: 'Sagitta s must be greater than zero.' });
		}
		if (input.width === undefined || !Number.isFinite(input.width) || input.width <= 0) {
			errors.push({ field: 'width', message: 'Chord width l must be greater than zero.' });
		}
	} else {
		for (const [field, value] of [
			['rn', input.rn],
			['sn', input.sn],
			['sf', input.sf],
			['df', input.df],
			['dx', input.dx],
		] as const) {
			if (value === undefined || !Number.isFinite(value) || value <= 0) {
				errors.push({ field, message: `${field} must be greater than zero for the Hartstein/Mottola cone.` });
			}
		}
	}
	if (errors.length) return fail(errors);

	if (input.mode === 'sagitta') {
		const s = sagittaFromRadius(input.radius!, input.width!);
		return { ok: true, mode: input.mode, sagitta: s, radius: input.radius!, rx: null, unit: input.unit };
	}
	if (input.mode === 'radius-from-sagitta') {
		const r = radiusFromSagitta(input.sagitta!, input.width!);
		return { ok: true, mode: input.mode, sagitta: input.sagitta!, radius: r, rx: null, unit: input.unit };
	}
	const rx = hartsteinRx(input.rn!, input.sn!, input.sf!, input.df!, input.dx!);
	return { ok: true, mode: input.mode, sagitta: null, radius: null, rx, unit: input.unit };
}

export function formatRadiusCopy(result: RadiusSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	if (result.mode === 'conical') {
		return `Hartstein/Mottola Rx = ${formatFixed(result.rx ?? 0, digits)} ${result.unit}. Warmoth radius pairs were not re-fetched and are not invented here.`;
	}
	if (result.mode === 'sagitta') {
		return `s = ${formatFixed(result.sagitta ?? 0, digits)} ${result.unit} for r = ${formatFixed(result.radius ?? 0, digits)} ${result.unit}.`;
	}
	return `r = ${formatFixed(result.radius ?? 0, digits)} ${result.unit} from sagitta ${formatFixed(result.sagitta ?? 0, digits)} ${result.unit}.`;
}

export function toInches(value: number, unit: RadiusUnit): number {
	return convertScale(value, unit, 'in');
}
