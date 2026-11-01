/**
 * Wireless antenna spacing.
 *
 * RF λ = c / f with c = 2.99792458e8 m/s (NOT 343 m/s air).
 * λ(m) ≈ 300 / f_MHz  (rule of thumb, shown beside the exact value)
 * Diversity minimum = ¼λ
 * Coax loss = (L/100) × α(f) only near a cited α.
 * Opened figure: Belden 9913 11.8 dB / 100 m @ 700 MHz (Shure / Belden 3.6 dB/100 ft).
 * No 468/f ham formula. Other α values are not invented.
 */

import { lengthToMeters, type LengthUnit } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed, formatMeters } from './format.ts';

export const RF_C_MPS = 2.99792458e8;
export const BELDEN_9913_ALPHA_DB_PER_100M_700MHZ = 11.8;
export const BELDEN_9913_FREQ_MHZ = 700;

export type WirelessInput = {
	frequencyHz: number;
	applyCoax: boolean;
	coaxLength?: number;
	coaxLengthUnit?: LengthUnit;
};

export type WirelessSuccess = {
	ok: true;
	lambda_m: number;
	lambdaApprox_m: number;
	quarterWave_m: number;
	frequencyMHz: number;
	coaxLossDb: number | null;
	coaxNote: string;
};

export type WirelessResult = WirelessSuccess | CalcFailure;

export function rfLambda(frequencyHz: number): number {
	return RF_C_MPS / frequencyHz;
}

export function lambdaApproxFromMHz(fMHz: number): number {
	return 300 / fMHz;
}

export function computeWirelessSpacing(input: WirelessInput): WirelessResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.frequencyHz) || input.frequencyHz <= 0) {
		errors.push({ field: 'frequencyHz', message: 'Frequency must be greater than zero.' });
	}
	if (input.applyCoax) {
		if (input.coaxLength === undefined || !Number.isFinite(input.coaxLength) || input.coaxLength < 0) {
			errors.push({ field: 'coaxLength', message: 'Enter a coax length ≥ 0, or leave coax off.' });
		}
	}
	if (errors.length) return fail(errors);

	const fMHz = input.frequencyHz / 1e6;
	const lambda_m = rfLambda(input.frequencyHz);
	const lambdaApprox_m = lambdaApproxFromMHz(fMHz);
	const quarterWave_m = lambda_m / 4;

	let coaxLossDb: number | null = null;
	let coaxNote =
		'Coax loss is not applied. The only opened α in this tool is Belden 9913 11.8 dB/100 m at 700 MHz. Other cables are not invented here.';
	if (input.applyCoax && input.coaxLength !== undefined) {
		const length_m = lengthToMeters(input.coaxLength, input.coaxLengthUnit ?? 'm');
		coaxLossDb = (length_m / 100) * BELDEN_9913_ALPHA_DB_PER_100M_700MHZ;
		coaxNote = `Loss = (L/100) × 11.8 dB using Belden 9913 @ 700 MHz only. Near ${formatFixed(fMHz, 1)} MHz this figure is valid only near 700 MHz; it is not interpolated to other frequencies.`;
	}

	return {
		ok: true,
		lambda_m,
		lambdaApprox_m,
		quarterWave_m,
		frequencyMHz: fMHz,
		coaxLossDb,
		coaxNote,
	};
}

export function formatWirelessCopy(result: WirelessSuccess): string {
	const loss =
		result.coaxLossDb === null ? 'Coax not applied.' : `Coax loss ${formatFixed(result.coaxLossDb, 2)} dB (9913 @ 700 MHz α only).`;
	return `f = ${formatFixed(result.frequencyMHz, 3)} MHz. λ = ${formatMeters(result.lambda_m)} m (c/f). ≈ ${formatMeters(result.lambdaApprox_m)} m from 300/f_MHz. Diversity min ¼λ = ${formatMeters(result.quarterWave_m)} m. ${loss}`;
}
