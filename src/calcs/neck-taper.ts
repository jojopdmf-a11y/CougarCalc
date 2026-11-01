/**
 * Neck taper / width: linear interpolation between two measured stations.
 * w(x) = w1 + (w2 − w1) × (x − x1) / (x2 − x1)
 * Fender first/twelfth published table is neck depth (thickness), not width — labeled.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type TaperUnit = 'in' | 'mm';

export type NeckTaperInput = {
	x1: number;
	w1: number;
	x2: number;
	w2: number;
	x: number;
	unit: TaperUnit;
};

export type NeckTaperSuccess = {
	ok: true;
	width: number;
	unit: TaperUnit;
	t: number;
};

export type NeckTaperResult = NeckTaperSuccess | CalcFailure;

export function interpolateWidth(x1: number, w1: number, x2: number, w2: number, x: number): number {
	return w1 + ((w2 - w1) * (x - x1)) / (x2 - x1);
}

export function computeNeckTaper(input: NeckTaperInput): NeckTaperResult {
	const errors: FieldError[] = [];
	for (const [field, value] of [
		['x1', input.x1],
		['w1', input.w1],
		['x2', input.x2],
		['w2', input.w2],
		['x', input.x],
	] as const) {
		if (!Number.isFinite(value)) {
			errors.push({ field, message: `${field} must be a finite number.` });
		}
		if ((field === 'w1' || field === 'w2') && Number.isFinite(value) && value <= 0) {
			errors.push({ field, message: 'Width must be greater than zero.' });
		}
	}
	if (input.x1 === input.x2) {
		errors.push({ field: 'x2', message: 'The two stations cannot be the same location.' });
	}
	if (errors.length) return fail(errors);
	const t = (input.x - input.x1) / (input.x2 - input.x1);
	const width = interpolateWidth(input.x1, input.w1, input.x2, input.w2, input.x);
	return { ok: true, width, unit: input.unit, t };
}

export function formatNeckTaperCopy(result: NeckTaperSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	return `Interpolated width ${formatFixed(result.width, digits)} ${result.unit} (t = ${formatFixed(result.t, 3)}). Linear between two measured stations. Fender 1st/12th chart values are neck depth, not width.`;
}
