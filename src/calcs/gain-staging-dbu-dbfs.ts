/**
 * Gain staging: dBu / dBFS (C02) with C01 / C05 / C06 / C14 helpers.
 *
 * Locked formulas — do not invent DiGiCo/Avid FS numbers or a global AES-17 volt.
 *
 * Vrms = 0.775 × 10^(dBu/20)
 * dBu  = 20 log10(Vrms / 0.775)
 * dBV  = 20 log10(Vrms / 1)
 * dBu  = dBV + 20 log10(1/0.775)   (≈ dBV + 2.218)
 * dBFS_of_analog = analog_dBu − FS_dBu
 * headroom_to_FS = FS_dBu − analog_dBu
 * +4 dBu vs −10 dBV = 11.78 dB (Biamp / Sengpiel). Not 14 dB.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatDb, formatFixed } from './format.ts';

export const VRMS_REF_DBU = 0.775;
export const PLUS4_DBU = 4;
export const MINUS10_DBV = -10;
export const SPL_AT_1_PA = 94;
export const RANE_BAL_TO_UNBAL_DB = -6;
export const TRANSFORMER_BAL_UNBAL_DB = 0;
export const SINE_CREST_NOTE_DB = 3;
export const DBU_MINUS_DBV = 20 * Math.log10(1 / VRMS_REF_DBU);

export const PLUS4_VS_MINUS10_DB = PLUS4_DBU - (MINUS10_DBV + DBU_MINUS_DBV);

export type GainMode = 'dbu-to-v' | 'v-to-dbu' | 'analog-to-dbfs' | 'mic-pre' | 'interconnect' | 'ha-trim';

export type BalUnbalKind = 'differential' | 'transformer';

export type FsPresetId =
	| 'custom'
	| 'yamaha-biamp-24'
	| 'rme-lo-gain-19'
	| 'rme-plus4-13'
	| 'rme-minus10-2dbv'
	| 'ebu-18'
	| 'us-post-24';

export type FsPreset = {
	id: FsPresetId;
	label: string;
	fsDbu: number | null;
	note: string;
};

export const FS_PRESETS: FsPreset[] = [
	{
		id: 'yamaha-biamp-24',
		label: 'Yamaha / Biamp class +24 dBu',
		fsDbu: 24,
		note: '0 dBFS = +24 dBu (Biamp Tesira / Yamaha note). Confirm in the manual.',
	},
	{
		id: 'rme-lo-gain-19',
		label: 'RME Lo Gain +19 dBu',
		fsDbu: 19,
		note: 'RME Lo Gain: 0 dBFS = +19 dBu. Confirm in the manual.',
	},
	{
		id: 'rme-plus4-13',
		label: 'RME +4 dBu switch +13 dBu',
		fsDbu: 13,
		note: 'RME +4 dBu switch: 0 dBFS = +13 dBu. Confirm in the manual.',
	},
	{
		id: 'rme-minus10-2dbv',
		label: 'RME −10 dBV path +2 dBV',
		fsDbu: 2 + DBU_MINUS_DBV,
		note: 'RME −10 dBV path: 0 dBFS = +2 dBV, converted to dBu. Confirm in the manual.',
	},
	{
		id: 'ebu-18',
		label: 'EBU-style 0 dBu ↔ −18 dBFS',
		fsDbu: 18,
		note: 'European broadcast preset (implies FS = +18 dBu). Not a law. Do not conflate with Pell −18 dBFS meter practice.',
	},
	{
		id: 'us-post-24',
		label: 'US post +4 dBu ↔ −20 dBFS',
		fsDbu: 24,
		note: 'US post-style mapping (implies FS = +24 dBu). Confirm in the manual.',
	},
	{
		id: 'custom',
		label: 'Custom FS_dBu',
		fsDbu: null,
		note: 'You type FS_dBu. This tool does not invent a global AES-17 volt.',
	},
];

export type GainStagingInput = {
	mode: GainMode;
	dBu?: number;
	vrms?: number;
	fsDbu?: number;
	splDba?: number;
	micSensitivityDbvPerPa?: number;
	micSensitivityMvPerPa?: number;
	targetDbfs?: number;
	padDb?: number;
	applyRanePad: boolean;
	balUnbal?: BalUnbalKind;
	deltaHaDb?: number;
	deltaTrimDb?: number;
	yamahaCompensation?: boolean;
	pellMeterTargetDbfs?: number;
};

export type GainStagingSuccess = {
	ok: true;
	vrms: number | null;
	dBu: number | null;
	dBv: number | null;
	dBfs: number | null;
	fsDbu: number | null;
	headroomDb: number | null;
	plus4VsMinus10Db: number;
	micLdBv: number | null;
	micOutputDbu: number | null;
	preampGainDb: number | null;
	raneApplied: boolean;
	balUnbalDb: number | null;
	deltaHaDb: number | null;
	deltaTrimDb: number | null;
	digitalLevelChangeDb: number | null;
	networkLevelChangeDb: number | null;
	yamahaCompensation: boolean;
	pellMeterTargetDbfs: number | null;
	unclipNote: string | null;
};

export type GainStagingResult = GainStagingSuccess | CalcFailure;

export function vrmsFromDbu(dBu: number): number {
	return VRMS_REF_DBU * 10 ** (dBu / 20);
}

export function dBuFromVrms(vrms: number): number {
	return 20 * Math.log10(vrms / VRMS_REF_DBU);
}

export function dBvFromVrms(vrms: number): number {
	return 20 * Math.log10(vrms);
}

export function dBuFromDBv(dBv: number): number {
	return dBv + DBU_MINUS_DBV;
}

export function dBvFromDBu(dBu: number): number {
	return dBu - DBU_MINUS_DBV;
}

export function vrmsFromDBv(dBv: number): number {
	return 10 ** (dBv / 20);
}

export function analogToDbfs(analogDbu: number, fsDbu: number): number {
	return analogDbu - fsDbu;
}

export function headroomToFs(analogDbu: number, fsDbu: number): number {
	return fsDbu - analogDbu;
}

export function dbvPerPaFromMv(mvPerPa: number): number {
	return 20 * Math.log10(mvPerPa / 1000);
}

export function micLevelDbv(sensDbvPerPa: number, splDb: number): number {
	return sensDbvPerPa + (splDb - SPL_AT_1_PA);
}

export function preampGainDb(targetDbfs: number, fsDbu: number, micDbu: number, padDb: number): number {
	return targetDbfs + fsDbu - micDbu + padDb;
}

export function interconnectLevelChange(kind: BalUnbalKind): number {
	return kind === 'transformer' ? TRANSFORMER_BAL_UNBAL_DB : RANE_BAL_TO_UNBAL_DB;
}

export function haTrimResult(deltaHaDb: number, compensation: boolean, userTrim?: number): {
	deltaTrimDb: number;
	digitalLevelChangeDb: number;
	networkLevelChangeDb: number;
} {
	if (compensation) {
		return { deltaTrimDb: 0, digitalLevelChangeDb: 0, networkLevelChangeDb: 0 };
	}
	const deltaTrimDb = userTrim === undefined ? -deltaHaDb : userTrim;
	return {
		deltaTrimDb,
		digitalLevelChangeDb: deltaHaDb + deltaTrimDb,
		networkLevelChangeDb: deltaHaDb + deltaTrimDb,
	};
}

function emptySuccess(partial: Partial<GainStagingSuccess>): GainStagingSuccess {
	return {
		ok: true,
		vrms: null,
		dBu: null,
		dBv: null,
		dBfs: null,
		fsDbu: null,
		headroomDb: null,
		plus4VsMinus10Db: PLUS4_VS_MINUS10_DB,
		micLdBv: null,
		micOutputDbu: null,
		preampGainDb: null,
		raneApplied: false,
		balUnbalDb: null,
		deltaHaDb: null,
		deltaTrimDb: null,
		digitalLevelChangeDb: null,
		networkLevelChangeDb: null,
		yamahaCompensation: false,
		pellMeterTargetDbfs: null,
		unclipNote: null,
		...partial,
	};
}

export function computeGainStaging(input: GainStagingInput): GainStagingResult {
	const errors: FieldError[] = [];

	if (input.mode === 'dbu-to-v') {
		if (input.dBu === undefined || !Number.isFinite(input.dBu)) {
			errors.push({ field: 'dBu', message: 'Enter a dBu value.' });
		}
	} else if (input.mode === 'v-to-dbu') {
		if (input.vrms === undefined || !Number.isFinite(input.vrms) || input.vrms <= 0) {
			errors.push({ field: 'vrms', message: 'Enter a voltage greater than zero.' });
		}
	} else if (input.mode === 'analog-to-dbfs') {
		if (input.dBu === undefined || !Number.isFinite(input.dBu)) {
			errors.push({ field: 'dBu', message: 'Enter the analog level in dBu.' });
		}
		if (input.fsDbu === undefined || !Number.isFinite(input.fsDbu)) {
			errors.push({
				field: 'fsDbu',
				message: 'Enter FS_dBu (or pick a labeled preset and confirm it in the manual). This tool does not invent a universal FS volt.',
			});
		}
	} else if (input.mode === 'mic-pre') {
		const hasDbv = input.micSensitivityDbvPerPa !== undefined && Number.isFinite(input.micSensitivityDbvPerPa);
		const hasMv = input.micSensitivityMvPerPa !== undefined && Number.isFinite(input.micSensitivityMvPerPa);
		if (input.splDba === undefined || !Number.isFinite(input.splDba)) {
			errors.push({ field: 'splDba', message: 'Enter SPL in dB (1 Pa = 94 dB SPL).' });
		}
		if (!hasDbv && !hasMv) {
			errors.push({
				field: 'micSensitivityDbvPerPa',
				message: 'Enter mic sensitivity in dBV/Pa or mV/Pa. No scraped manufacturer database.',
			});
		}
		if (hasMv && input.micSensitivityMvPerPa !== undefined && input.micSensitivityMvPerPa <= 0) {
			errors.push({ field: 'micSensitivityMvPerPa', message: 'mV/Pa must be greater than zero.' });
		}
	} else if (input.mode === 'ha-trim') {
		if (input.deltaHaDb === undefined || !Number.isFinite(input.deltaHaDb)) {
			errors.push({ field: 'deltaHaDb', message: 'Enter the analog HA change in dB.' });
		}
	}

	if (errors.length) return fail(errors);

	if (input.mode === 'interconnect') {
		const kind = input.balUnbal ?? 'differential';
		const change = interconnectLevelChange(kind);
		return emptySuccess({
			balUnbalDb: change,
			raneApplied: kind === 'differential',
		});
	}

	if (input.mode === 'ha-trim' && input.deltaHaDb !== undefined) {
		const comp = Boolean(input.yamahaCompensation);
		const ha = haTrimResult(input.deltaHaDb, comp, input.deltaTrimDb);
		return emptySuccess({
			deltaHaDb: input.deltaHaDb,
			deltaTrimDb: ha.deltaTrimDb,
			digitalLevelChangeDb: ha.digitalLevelChangeDb,
			networkLevelChangeDb: ha.networkLevelChangeDb,
			yamahaCompensation: comp,
			pellMeterTargetDbfs: input.pellMeterTargetDbfs ?? null,
			unclipNote: 'Digital trim cannot unclip an analog HA clip.',
		});
	}

	let dBu: number | undefined = input.dBu;
	let vrms: number | undefined = input.vrms;
	let micLdBv: number | null = null;
	let micOutputDbu: number | null = null;
	let preGain: number | null = null;

	if (input.mode === 'mic-pre' && input.splDba !== undefined) {
		const sensDbv =
			input.micSensitivityDbvPerPa !== undefined && Number.isFinite(input.micSensitivityDbvPerPa)
				? input.micSensitivityDbvPerPa
				: dbvPerPaFromMv(input.micSensitivityMvPerPa!);
		micLdBv = micLevelDbv(sensDbv, input.splDba);
		micOutputDbu = dBuFromDBv(micLdBv);
		dBu = micOutputDbu;
		vrms = vrmsFromDbu(micOutputDbu);
		if (input.fsDbu !== undefined && input.targetDbfs !== undefined) {
			const pad = input.padDb ?? 0;
			preGain = preampGainDb(input.targetDbfs, input.fsDbu, micOutputDbu, pad);
		}
	}

	if (input.mode === 'dbu-to-v' && dBu !== undefined) vrms = vrmsFromDbu(dBu);
	if (input.mode === 'v-to-dbu' && vrms !== undefined) dBu = dBuFromVrms(vrms);
	if (input.mode === 'analog-to-dbfs' && dBu !== undefined) vrms = vrmsFromDbu(dBu);

	if (dBu === undefined && vrms !== undefined) dBu = dBuFromVrms(vrms);
	if (vrms === undefined && dBu !== undefined) vrms = vrmsFromDbu(dBu);
	if (dBu === undefined || vrms === undefined) {
		return fail([{ field: 'form', message: 'Could not resolve volts and dBu.' }]);
	}

	let workDbu = dBu;
	if (input.applyRanePad) workDbu = dBu + RANE_BAL_TO_UNBAL_DB;
	const workV = vrmsFromDbu(workDbu);

	let dBfs: number | null = null;
	let fsDbu: number | null = null;
	let headroomDb: number | null = null;
	if (input.fsDbu !== undefined && Number.isFinite(input.fsDbu)) {
		fsDbu = input.fsDbu;
		dBfs = analogToDbfs(workDbu, input.fsDbu);
		headroomDb = headroomToFs(workDbu, input.fsDbu);
	}

	return emptySuccess({
		vrms: workV,
		dBu: workDbu,
		dBv: dBvFromVrms(workV),
		dBfs,
		fsDbu,
		headroomDb,
		micLdBv,
		micOutputDbu,
		preampGainDb: preGain,
		raneApplied: input.applyRanePad,
		pellMeterTargetDbfs: input.pellMeterTargetDbfs ?? null,
	});
}

export function formatGainCopy(result: GainStagingSuccess): string {
	if (result.balUnbalDb !== null && result.vrms === null) {
		return `Interconnect ${formatDb(result.balUnbalDb)} dB (${result.raneApplied ? 'ordinary differential bal→unbal, Rane Note 124' : 'transformer / cross-coupled, 0 dB gain, headroom caveat still applies'}). +4 vs −10 dBV is ${formatFixed(result.plus4VsMinus10Db, 2)} dB, not 14 dB.`;
	}
	if (result.deltaHaDb !== null) {
		const comp = result.yamahaCompensation
			? 'Yamaha-style rack compensation: network_level_change = 0.'
			: `Without compensation: delta_trim = ${formatDb(result.deltaTrimDb ?? 0)} dB; digital_level_change = ${formatDb(result.digitalLevelChangeDb ?? 0)} dB.`;
		return `HA change ${formatDb(result.deltaHaDb)} dB. ${comp} Digital trim cannot unclip an analog HA clip.`;
	}
	const fs =
		result.dBfs === null || result.fsDbu === null
			? 'FS_dBu not set.'
			: `${formatDb(result.dBfs)} dBFS at FS ${formatDb(result.fsDbu)} dBu; headroom ${formatDb(result.headroomDb ?? 0)} dB.`;
	const v = result.vrms === null || result.dBu === null ? '' : `${formatFixed(result.vrms, 4)} Vrms = ${formatDb(result.dBu)} dBu. `;
	const mic =
		result.preampGainDb === null
			? ''
			: ` Suggested preamp gain ${formatDb(result.preampGainDb)} dB.`;
	return `${v}+4 vs −10 dBV is ${formatFixed(result.plus4VsMinus10Db, 2)} dB. ${fs}${mic} Sine crest ≈ 3 dB is a note, not a law. Confirm FS in the manual.`;
}
