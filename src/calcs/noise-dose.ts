/**
 * Educational noise dose from dBA and duration. Never compliance. Never a dosimeter.
 *
 * T = 8 / 2^((L − Lc) / q) hours
 * D% = 100 × Σ (C_i / T_i)
 * NIOSH: Lc = 85 dBA, q = 3 dB. OSHA 1910.95: Lc = 90 dBA, q = 5 dB.
 * NIOSH 98-126 PDF was unavailable to this prototype — that is labeled on the page.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatDb, formatFixed } from './format.ts';

export const NIOSH_LC = 85;
export const NIOSH_Q = 3;
export const OSHA_LC = 90;
export const OSHA_Q = 5;

export type DoseBand = {
	levelDba: number;
	hours: number;
};

export type NoiseDoseInput = {
	bands: DoseBand[];
};

export type CriterionResult = {
	name: string;
	lc: number;
	q: number;
	dosePct: number;
	twa: number | null;
	allowedHoursAtFirst: number;
};

export type NoiseDoseSuccess = {
	ok: true;
	niosh: CriterionResult;
	osha: CriterionResult;
};

export type NoiseDoseResult = NoiseDoseSuccess | CalcFailure;

export function allowedHours(levelDba: number, lc: number, q: number): number {
	return 8 / 2 ** ((levelDba - lc) / q);
}

export function dosePercent(bands: DoseBand[], lc: number, q: number): number {
	return 100 * bands.reduce((sum, b) => sum + b.hours / allowedHours(b.levelDba, lc, q), 0);
}

/** NIOSH TWA = 10 log10(D/100) + 85. OSHA TWA = 16.61 log10(D/100) + 90. */
export function twaFromDose(dosePct: number, lc: number, q: number): number | null {
	if (dosePct <= 0) return null;
	if (q === 3) return 10 * Math.log10(dosePct / 100) + lc;
	return (q / Math.log10(2)) * Math.log10(dosePct / 100) + lc;
}

export function computeNoiseDose(input: NoiseDoseInput): NoiseDoseResult {
	const errors: FieldError[] = [];
	if (input.bands.length === 0) {
		errors.push({ field: 'bands', message: 'Enter at least one dBA / duration band.' });
	}
	input.bands.forEach((b, i) => {
		if (!Number.isFinite(b.levelDba)) {
			errors.push({ field: `level-${i}`, message: `Band ${i + 1}: level must be a dBA number.` });
		}
		if (!Number.isFinite(b.hours) || b.hours < 0) {
			errors.push({ field: `hours-${i}`, message: `Band ${i + 1}: duration must be ≥ 0 hours.` });
		}
	});
	if (errors.length) return fail(errors);

	const nioshDose = dosePercent(input.bands, NIOSH_LC, NIOSH_Q);
	const oshaDose = dosePercent(input.bands, OSHA_LC, OSHA_Q);
	const first = input.bands[0];
	return {
		ok: true,
		niosh: {
			name: 'NIOSH REL',
			lc: NIOSH_LC,
			q: NIOSH_Q,
			dosePct: nioshDose,
			twa: twaFromDose(nioshDose, NIOSH_LC, NIOSH_Q),
			allowedHoursAtFirst: allowedHours(first.levelDba, NIOSH_LC, NIOSH_Q),
		},
		osha: {
			name: 'OSHA PEL (1910.95)',
			lc: OSHA_LC,
			q: OSHA_Q,
			dosePct: oshaDose,
			twa: twaFromDose(oshaDose, OSHA_LC, OSHA_Q),
			allowedHoursAtFirst: allowedHours(first.levelDba, OSHA_LC, OSHA_Q),
		},
	};
}

export function formatNoiseDoseCopy(result: NoiseDoseSuccess): string {
	return `Educational only, not compliance, not a dosimeter. NIOSH dose ${formatFixed(result.niosh.dosePct, 1)}% (85 dBA / 3 dB). OSHA dose ${formatFixed(result.osha.dosePct, 1)}% (90 dBA / 5 dB). dBA only. NIOSH 98-126 PDF was unavailable to this prototype.`;
}

export function formatDoseDb(value: number): string {
	return formatDb(value);
}
