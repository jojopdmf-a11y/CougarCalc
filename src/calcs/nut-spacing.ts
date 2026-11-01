/**
 * Nut spacing: equal remaining gap between string edges.
 * Centers from half-gauges + gaps.
 * E-to-E is center-to-center of the outer strings.
 * Slot clearance — no universal spec, not invented.
 */

import { convertScale } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type NutUnit = 'in' | 'mm';

export type NutSpacingInput = {
	eToE: number;
	unit: NutUnit;
	gauges: number[];
	gaugeUnit: NutUnit;
};

export type NutSpacingSuccess = {
	ok: true;
	unit: NutUnit;
	gap: number;
	centers: number[];
	gaugesInUnit: number[];
	eToE: number;
};

export type NutSpacingResult = NutSpacingSuccess | CalcFailure;

export function computeNutSpacing(input: NutSpacingInput): NutSpacingResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.eToE) || input.eToE <= 0) {
		errors.push({ field: 'eToE', message: 'E-to-E (outer string centers) must be greater than zero.' });
	}
	if (input.gauges.length < 2) {
		errors.push({ field: 'gauges', message: 'Enter at least two string gauges.' });
	}
	input.gauges.forEach((g, i) => {
		if (!Number.isFinite(g) || g <= 0) {
			errors.push({ field: `gauge-${i}`, message: `Gauge ${i + 1} must be greater than zero.` });
		}
	});
	if (errors.length) return fail(errors);

	const gauges = input.gauges.map((g) => convertScale(g, input.gaugeUnit, input.unit));
	const n = gauges.length;
	const innerSum = gauges.slice(1, n - 1).reduce((a, b) => a + b, 0);
	const occupied = gauges[0] / 2 + gauges[n - 1] / 2 + innerSum;
	const gap = (input.eToE - occupied) / (n - 1);
	if (gap <= 0) {
		return fail([
			{
				field: 'eToE',
				message: 'Gauges do not fit in this E-to-E with a positive remaining gap. Check units (inches vs millimetres).',
			},
		]);
	}

	const centers: number[] = [0];
	for (let i = 0; i < n - 1; i++) {
		centers.push(centers[i] + gauges[i] / 2 + gap + gauges[i + 1] / 2);
	}

	return { ok: true, unit: input.unit, gap, centers, gaugesInUnit: gauges, eToE: input.eToE };
}

export function formatNutSpacingCopy(result: NutSpacingSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	const centers = result.centers.map((c) => formatFixed(c, digits)).join(', ');
	return `Equal edge gap ${formatFixed(result.gap, digits)} ${result.unit}. Centers from first E: ${centers} ${result.unit}. Slot clearance is not specified — no universal spec.`;
}
