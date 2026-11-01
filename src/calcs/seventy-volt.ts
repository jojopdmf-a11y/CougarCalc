/**
 * 70 V (70.7 V) distributed-speaker taps. BGM / paging / under-balcony only.
 * REFUSE NFPA 72 / EN 54 / fire-alarm — no numbers in that mode.
 * Z_tap = V² / P_tap
 * I_tap = P_tap / V
 * total watts = Σ taps
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed, formatOhms } from './format.ts';

export const VOLTAGE_70V = 70.7;
export const VOLTAGE_100V = 100;

export type DistributedVoltage = 70.7 | 100;

export type TapRow = {
	watts: number;
	count: number;
};

export type SeventyVoltInput = {
	fireAlarm: boolean;
	voltage: DistributedVoltage;
	taps: TapRow[];
};

export type SeventyVoltSuccess = {
	ok: true;
	refused: false;
	voltage: number;
	totalWatts: number;
	totalZ: number;
	totalCurrent: number;
	rows: { watts: number; count: number; z: number; current: number }[];
};

export type SeventyVoltRefused = {
	ok: true;
	refused: true;
	message: string;
};

export type SeventyVoltResult = SeventyVoltSuccess | SeventyVoltRefused | CalcFailure;

export const FIRE_ALARM_REFUSAL =
	'This calculator refuses NFPA 72, EN 54, and fire-alarm / life-safety speaker circuits. It is only for BGM, paging, and under-balcony distributed audio. Use a listed fire-alarm design method.';

export function compute70vTap(input: SeventyVoltInput): SeventyVoltResult {
	if (input.fireAlarm) {
		return { ok: true, refused: true, message: FIRE_ALARM_REFUSAL };
	}
	const errors: FieldError[] = [];
	if (input.taps.length === 0) {
		errors.push({ field: 'taps', message: 'Add at least one tap row.' });
	}
	input.taps.forEach((tap, i) => {
		if (!Number.isFinite(tap.watts) || tap.watts <= 0) {
			errors.push({ field: `watts-${i}`, message: `Tap ${i + 1}: watts must be greater than zero.` });
		}
		if (!Number.isFinite(tap.count) || tap.count < 1 || !Number.isInteger(tap.count)) {
			errors.push({ field: `count-${i}`, message: `Tap ${i + 1}: count must be an integer ≥ 1.` });
		}
	});
	if (errors.length) return fail(errors);

	const V = input.voltage;
	const rows = input.taps.map((tap) => ({
		watts: tap.watts,
		count: tap.count,
		z: (V * V) / tap.watts,
		current: tap.watts / V,
	}));
	const totalWatts = input.taps.reduce((s, t) => s + t.watts * t.count, 0);
	const totalZ = (V * V) / totalWatts;
	const totalCurrent = totalWatts / V;
	return { ok: true, refused: false, voltage: V, totalWatts, totalZ, totalCurrent, rows };
}

export function format70vCopy(result: SeventyVoltSuccess | SeventyVoltRefused): string {
	if (result.refused) return result.message;
	return `${formatFixed(result.voltage, 1)} V distributed. Total ${formatFixed(result.totalWatts, 1)} W, Z_eq ${formatOhms(result.totalZ)} Ω, I ${formatFixed(result.totalCurrent, 3)} A. BGM/paging/under-balcony only.`;
}
