/**
 * Pickup pole spacing. Duncan figures only.
 * Standard humbucker 1.930 in (49 mm). Trembucker 2.070 in (52.6 mm).
 * Bridge E-to-E > 2 in → Trembucker suggestion (Seymour Duncan).
 * DiMarzio official spacing was unavailable — not invented.
 */

import { convertScale } from './units.ts';
import { fail, type CalcFailure } from './types.ts';
import { formatInches, formatMm } from './format.ts';

export const DUNCAN_HUMBUCKER_IN = 1.93;
export const DUNCAN_TREMBUCKER_IN = 2.07;
export const DUNCAN_SPLIT_IN = 2;

export type PickupUnit = 'in' | 'mm';

export type PickupInput = {
	eToE: number;
	unit: PickupUnit;
	position: 'bridge' | 'neck';
};

export type PickupSuggestion = 'humbucker' | 'trembucker' | 'measure';

export type PickupSuccess = {
	ok: true;
	eToE_in: number;
	suggestion: PickupSuggestion;
	deltaHumbuckerIn: number;
	deltaTrembuckerIn: number;
	dimarzioNote: string;
};

export type PickupResult = PickupSuccess | CalcFailure;

export function computePickupPoles(input: PickupInput): PickupResult {
	if (!Number.isFinite(input.eToE) || input.eToE <= 0) {
		return fail([{ field: 'eToE', message: 'E-to-E at the pickup must be greater than zero.' }]);
	}
	const eToE_in = convertScale(input.eToE, input.unit, 'in');
	let suggestion: PickupSuggestion = 'measure';
	if (input.position === 'bridge') {
		suggestion = eToE_in > DUNCAN_SPLIT_IN ? 'trembucker' : 'humbucker';
	}
	return {
		ok: true,
		eToE_in,
		suggestion,
		deltaHumbuckerIn: eToE_in - DUNCAN_HUMBUCKER_IN,
		deltaTrembuckerIn: eToE_in - DUNCAN_TREMBUCKER_IN,
		dimarzioNote: 'DiMarzio official pole-spacing figures were unavailable. They are not invented here.',
	};
}

export function formatPickupCopy(result: PickupSuccess): string {
	const rec =
		result.suggestion === 'trembucker'
			? 'Bridge E-to-E > 2 in → Trembucker per Duncan.'
			: result.suggestion === 'humbucker'
				? 'Bridge E-to-E ≤ 2 in → standard humbucker per Duncan.'
				: 'Neck position: Duncan says spacing is a bridge-pickup question; a humbucker usually covers the neck.';
	return `Measured ${formatInches(result.eToE_in)} in (${formatMm(result.eToE_in * 25.4)} mm). Duncan 1.930 in / 2.070 in. ${rec} ${result.dimarzioNote}`;
}
