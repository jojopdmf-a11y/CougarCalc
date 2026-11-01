/**
 * Speaker-level copper cable loss. Never NEC. Never 70 V.
 *
 * loop R = 2 × L_ft × DCR_per_kft / 1000
 * voltage ratio = Z / (Z + R)
 * Lumen power shortfall % = 100 × (1 − ratio²)
 * BoomSpeaker resistance-ratio % = 100 × R / (R + Z)
 * atten = −20 log10(ratio)
 * DF = Re / (Zamp + Rcable) only with user-entered Re and Zamp
 *
 * Cited AWG preset: 12 AWG = 1.588 Ω/kft (PowerStream + Lumen JS observed).
 * Other AWG presets fail closed. Custom DCR (Ω/kft or Ω/km) stays.
 * Do not bake Re = 6.4 (Butler Audio only if ever shown; not McGregor).
 */

import { METERS_PER_FOOT, type LengthUnit, lengthToMeters } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatDb, formatFixed, formatOhms } from './format.ts';

export const AWG_UNCITED_REFUSAL =
	'That AWG/gauge DCR is not cited from PowerStream + Lumen JS in this checkout. Enter a custom DCR, or use the cited 12 AWG cell. Fail closed — no silent Ω/kft.';

export const COPPER_DCR_SOURCE = 'PowerStream + Lumen JS observed (Audio Research)';

/** Only gauges cited the same way as 12 AWG. Uncited gauges are not listed here. */
export const COPPER_DCR_OHM_PER_KFT: Record<string, { awg: string; dcr: number; source: string }> = {
	'12': { awg: '12', dcr: 1.588, source: COPPER_DCR_SOURCE },
};

export const UNCITED_AWG_PRESET_IDS = ['10', '14', '16', '18'] as const;

export type DcrUnit = 'ohm-per-kft' | 'ohm-per-km';

export type CableLossInput = {
	length: number;
	lengthUnit: LengthUnit;
	dcr: number | null;
	dcrUnit: DcrUnit;
	awgPreset?: string | null;
	loadZ: number;
	reOhm: number | null;
	zAmpOhm: number | null;
};

export type CableLossSuccess = {
	ok: true;
	length_ft: number;
	dcrOhmPerKft: number;
	dcrSource: string;
	awg: string | null;
	loopR: number;
	voltageRatio: number;
	powerShortfallPct: number;
	resistanceRatioPct: number;
	attenDb: number;
	dampingFactor: number | null;
};

export type CableLossResult = CableLossSuccess | CalcFailure;

/** 1000 ft = 304.8 m, so Ω/kft = (Ω/km) × 0.3048. */
export function dcrToOhmPerKft(dcr: number, unit: DcrUnit): number {
	return unit === 'ohm-per-kft' ? dcr : dcr * METERS_PER_FOOT;
}

export function lookupCitedAwg(awg: string): { awg: string; dcr: number; source: string } | undefined {
	return COPPER_DCR_OHM_PER_KFT[awg];
}

export function computeSpeakerCableLoss(input: CableLossInput): CableLossResult {
	if (input.awgPreset) {
		const cited = lookupCitedAwg(input.awgPreset);
		if (!cited) {
			return fail([{ field: 'awgPreset', message: AWG_UNCITED_REFUSAL }]);
		}
	}

	const errors: FieldError[] = [];
	if (!Number.isFinite(input.length) || input.length <= 0) {
		errors.push({ field: 'length', message: 'Cable length must be greater than zero.' });
	}

	const cited = input.awgPreset ? lookupCitedAwg(input.awgPreset) : undefined;
	let dcrOhmPerKft: number | null = null;
	let dcrSource = 'User-cited DCR';
	let awg: string | null = null;
	if (cited) {
		dcrOhmPerKft = cited.dcr;
		dcrSource = cited.source;
		awg = cited.awg;
	} else if (input.dcr !== null && Number.isFinite(input.dcr) && input.dcr > 0) {
		dcrOhmPerKft = dcrToOhmPerKft(input.dcr, input.dcrUnit);
	} else {
		errors.push({
			field: 'dcr',
			message: 'Enter a custom DCR (Ω/kft or Ω/km), or pick the cited 12 AWG cell. Uncited AWG presets fail closed.',
		});
	}

	if (!Number.isFinite(input.loadZ) || input.loadZ <= 0) {
		errors.push({ field: 'loadZ', message: 'Load Z must be greater than zero.' });
	}
	const reEntered = input.reOhm !== null && Number.isFinite(input.reOhm);
	const zampEntered = input.zAmpOhm !== null && Number.isFinite(input.zAmpOhm);
	if (reEntered && input.reOhm !== null && input.reOhm <= 0) {
		errors.push({ field: 'reOhm', message: 'Re must be greater than zero for damping factor.' });
	}
	if (zampEntered && input.zAmpOhm !== null && input.zAmpOhm < 0) {
		errors.push({ field: 'zAmpOhm', message: 'Amplifier source Z must be ≥ 0.' });
	}
	if (errors.length) return fail(errors);
	if (dcrOhmPerKft === null) return fail(errors);

	const length_ft =
		input.lengthUnit === 'ft' ? input.length : lengthToMeters(input.length, input.lengthUnit) / METERS_PER_FOOT;
	const loopR = 2 * length_ft * (dcrOhmPerKft / 1000);
	const voltageRatio = input.loadZ / (input.loadZ + loopR);
	const powerShortfallPct = 100 * (1 - voltageRatio * voltageRatio);
	const resistanceRatioPct = 100 * (loopR / (loopR + input.loadZ));
	const attenDb = -20 * Math.log10(voltageRatio);
	const dampingFactor =
		reEntered && zampEntered && input.reOhm !== null && input.zAmpOhm !== null
			? input.reOhm / (input.zAmpOhm + loopR)
			: null;

	return {
		ok: true,
		length_ft,
		dcrOhmPerKft,
		dcrSource,
		awg,
		loopR,
		voltageRatio,
		powerShortfallPct,
		resistanceRatioPct,
		attenDb,
		dampingFactor,
	};
}

export function formatCableLossCopy(result: CableLossSuccess): string {
	const item = result.awg ? ` ${result.awg} AWG.` : '';
	const df =
		result.dampingFactor === null
			? 'DF not computed (enter Re and Zamp).'
			: `DF ${formatFixed(result.dampingFactor, 1)} (user-entered Re; not a baked 6.4).`;
	return `Loop R ${formatOhms(result.loopR)} Ω. Voltage ratio ${formatFixed(result.voltageRatio, 4)}. Lumen shortfall ${formatFixed(result.powerShortfallPct, 2)}% (1−ratio²). BoomSpeaker R/(R+Z) ${formatFixed(result.resistanceRatioPct, 2)}%. Atten ${formatDb(result.attenDb)} dB. ${df} DCR ${result.dcrOhmPerKft} Ω/kft (${result.dcrSource}).${item} Speaker-level copper only.`;
}
