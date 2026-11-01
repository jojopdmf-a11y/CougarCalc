/**
 * Bridge placement.
 * Break length ≈ S (nut to saddle contact as a first layout).
 * Speaking length ≈ S + compensation along the string path, not the centerline.
 * Exact compensation millimetres are unavailable — user supplies the offset.
 */

import { convertScale } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type BridgeUnit = 'in' | 'mm';

export type BridgeInput = {
	scale: number;
	compensation: number;
	unit: BridgeUnit;
};

export type BridgeSuccess = {
	ok: true;
	breakLength: number;
	speakingLength: number;
	compensation: number;
	unit: BridgeUnit;
};

export type BridgeResult = BridgeSuccess | CalcFailure;

export function computeBridgePlacement(input: BridgeInput): BridgeResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.scale) || input.scale <= 0) {
		errors.push({ field: 'scale', message: 'Scale length must be greater than zero.' });
	}
	if (!Number.isFinite(input.compensation)) {
		errors.push({ field: 'compensation', message: 'Compensation must be a number (0 if none). Exact mm is not published here.' });
	}
	if (errors.length) return fail(errors);
	return {
		ok: true,
		breakLength: input.scale,
		speakingLength: input.scale + input.compensation,
		compensation: input.compensation,
		unit: input.unit,
	};
}

export function formatBridgeCopy(result: BridgeSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	return `Break ≈ ${formatFixed(result.breakLength, digits)} ${result.unit}. Speaking ≈ ${formatFixed(result.speakingLength, digits)} ${result.unit} along the string path (S + compensation). Not centerline. Exact compensation millimetres are not a universal figure.`;
}

export function compensationInInches(result: BridgeSuccess): number {
	return convertScale(result.compensation, result.unit, 'in');
}
