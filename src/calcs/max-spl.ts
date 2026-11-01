/**
 * Max SPL, distance, N-box summing, Crown watts-for-target, AES conventions,
 * and a limiter starting estimate.
 *
 * Formulas copied from the locked Phase 2 spec (tool A07 + A01 / B04 / B09 / C13).
 * Do not invent room gain, manufacturer limiter presets, or AES lab ratings.
 *
 * Core:
 *   SPL_1m = Sens_1W1m + 10 * log10(P / 1)
 *   2.83 V / 1 m: Sens_1W1m = Sens_2.83V − 10 * log10((2.83²) / Z)
 *     2.83²/8 = 1 W; 2.83²/4 = 2 W
 *   Point source: −20 * log10(d_m / 1)
 *   Ideal line:   −10 * log10(d_m / 1)
 *   N incoherent: +10 * log10(N)
 *   N coherent:   +20 * log10(N) — rare; equal level, in-phase, same distance
 *   Listener SPL = SPL_1m + distance_term + N_term
 *   Optional indoor +6 dB is a labeled Crown-article note, never a silent default.
 *
 * Watts for target (Crown calculators, opened):
 *   dBW = Lreq − Lsens + 20 * log10(D2 / Dref) + HR   with Dref = 1 m (point)
 *   Line uses 10 * log10(D2 / Dref) to match the A01 distance law.
 *   W = 10**(dBW / 10)
 *   Headroom is user-entered. No 3 dB default.
 *
 * AES / program / peak (conventions, not a lab):
 *   Vrms = sqrt(P * Z) with Z = Zmin (AES/B&C) or Znom (EAW) as a label
 *   6 dB crest: Vpeak = 2 * Vrms ⇒ Ppeak_convention = 4 * P
 *   Program = 2 × continuous is a labeled B&C/QSC/Crown rule of thumb
 *   AES2-2012 12 dB CF: do not auto-emit 4× as “AES peak”
 *
 * Limiter / crest (C13):
 *   Urms = sqrt(P * Z) (nominal Z, labeled)
 *   CF_dB = 20 * log10(Upeak / Urms)
 *   6 dB ⇒ Upeak = 2 Urms; 12 dB ⇒ Upeak = 4 Urms; custom CF allowed
 *   dBu = 20 * log10(U / 0.775)
 *   Threshold_dBu = U_dBu − G_amp
 *   Threshold_dBFS = Threshold_dBu − FS_dBu
 */

import { lengthToMeters, type LengthUnit } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatDb, formatDualLength, formatFixed } from './format.ts';
import { dBuFromVrms } from './gain-staging.ts';

export const VOLTS_283 = 2.83;
export const DREF_M = 1;
export const AES2_2012_CREST_DB = 12;
export const SIX_DB_CREST = 6;
export const PROGRAM_TIMES_CONTINUOUS = 2;
export const INDOOR_NOTE_DB = 6;
export const HEADROOM_CHIP_DB = [6, 10, 15, 20] as const;

export const COHERENT_WARNING =
	'Coherent summing requires equal level, in-phase, and the same distance at that seat. It is rare. This is not a default.';

export const LEA_LIMITER_DISCLAIMER =
	'Manufacturer limiter presets win. This is a starting estimate from the numbers you typed, not a LEA (or any other) factory preset. Trusting it over the manufacturer can damage speakers. Ratings are user-entered only.';

export type SensitivityRef = '1w1m' | '2.83v1m';
export type Radiation = 'point' | 'line';
export type Summing = 'incoherent' | 'coherent';
export type MaxSplMode = 'max-spl' | 'watts-for-target';
export type ZConvention = 'zmin' | 'znom';
export type AesPath = '6db-convention' | 'aes2-2012-12db';

export type MaxSplInput = {
	sensitivityDb: number;
	sensitivityRef: SensitivityRef;
	impedanceOhm: number;
	powerW: number;
	distance: number;
	distanceUnit: LengthUnit;
	radiation: Radiation;
	count: number;
	summing: Summing;
	mode: MaxSplMode;
	targetSpl?: number;
	headroomDb?: number;
	indoorNote: boolean;
};

export type MaxSplSuccess = {
	ok: true;
	sens1W1m: number;
	wattsAt283V: number;
	powerW: number;
	nTermDb: number;
	distanceTermDb: number;
	distance_m: number;
	splAt1m: number;
	listenerSpl: number;
	indoorNoteDb: number | null;
	indoorNoteSpl: number | null;
	wattsForTarget: number | null;
	dBW: number | null;
	headroomDb: number | null;
	coherentWarning: boolean;
	landmineNote: string;
	/** Aliases used by copy / older call sites. */
	arrayGainDb: number;
	distanceLossDb: number;
	splAtDistance: number;
};

export type MaxSplResult = MaxSplSuccess | CalcFailure;

export type AesRatingsInput = {
	continuousW: number;
	impedanceOhm: number;
	zConvention: ZConvention;
	aesPath: AesPath;
};

export type AesRatingsSuccess = {
	ok: true;
	vrms: number;
	zConvention: ZConvention;
	zConventionLabel: string;
	programW: number;
	programNote: string;
	aesPath: AesPath;
	emitPeakConvention4x: boolean;
	vPeak6dB: number | null;
	pPeakConvention: number | null;
	aes2012Warning: boolean;
	aes2012Note: string | null;
	vPeak12dBVoltage: number | null;
};

export type AesRatingsResult = AesRatingsSuccess | CalcFailure;

export type LimiterInput = {
	powerW: number;
	impedanceOhm: number;
	crestFactorDb: number;
	ampGainDb: number;
	fsDbu: number;
};

export type LimiterSuccess = {
	ok: true;
	urms: number;
	upeak: number;
	crestFactorDb: number;
	urmsDbu: number;
	upeakDbu: number;
	ampGainDb: number;
	thresholdDbu: number;
	fsDbu: number;
	thresholdDbfs: number;
	disclaimer: string;
};

export type LimiterResult = LimiterSuccess | CalcFailure;

export function wattsAt283V(impedanceOhm: number): number {
	return (VOLTS_283 * VOLTS_283) / impedanceOhm;
}

export function sensitivityTo1W1m(sensDb: number, ref: SensitivityRef, impedanceOhm: number): number {
	if (ref === '1w1m') return sensDb;
	return sensDb - 10 * Math.log10(wattsAt283V(impedanceOhm));
}

export function distanceTermDb(distance_m: number, radiation: Radiation): number {
	const ratio = distance_m / DREF_M;
	return radiation === 'line' ? -10 * Math.log10(ratio) : -20 * Math.log10(ratio);
}

export function nTermDb(count: number, summing: Summing): number {
	return summing === 'coherent' ? 20 * Math.log10(count) : 10 * Math.log10(count);
}

export function splAt1mFromSensAndPower(sens1W1m: number, powerW: number): number {
	return sens1W1m + 10 * Math.log10(powerW / 1);
}

/** Crown point-source dBW. Dref = 1 m. Does not invent a default HR. */
export function crownPointDbw(lreq: number, lsens: number, distance_m: number, headroomDb: number): number {
	return lreq - lsens + 20 * Math.log10(distance_m / DREF_M) + headroomDb;
}

export function wattsFromDbw(dBW: number): number {
	return 10 ** (dBW / 10);
}

function zConventionLabel(zConvention: ZConvention): string {
	return zConvention === 'zmin' ? 'Zmin (AES / B&C label)' : 'Znom (EAW label)';
}

function validateSharedGeometry(input: MaxSplInput, errors: FieldError[]): void {
	if (!Number.isFinite(input.sensitivityDb)) {
		errors.push({ field: 'sensitivityDb', message: 'Enter a sensitivity in dB SPL.' });
	}
	if (!Number.isFinite(input.impedanceOhm) || input.impedanceOhm <= 0) {
		errors.push({ field: 'impedanceOhm', message: 'Impedance Z must be greater than zero.' });
	}
	if (!Number.isFinite(input.distance) || input.distance <= 0) {
		errors.push({ field: 'distance', message: 'Distance must be greater than zero.' });
	}
	if (!Number.isFinite(input.count) || input.count < 1 || !Number.isInteger(input.count)) {
		errors.push({ field: 'count', message: 'Cabinet count N must be an integer ≥ 1.' });
	}
}

export function computeMaxSpl(input: MaxSplInput): MaxSplResult {
	const errors: FieldError[] = [];
	validateSharedGeometry(input, errors);

	if (input.mode === 'max-spl') {
		if (!Number.isFinite(input.powerW) || input.powerW <= 0) {
			errors.push({ field: 'powerW', message: 'Amplifier power must be greater than zero.' });
		}
	} else {
		if (input.targetSpl === undefined || !Number.isFinite(input.targetSpl)) {
			errors.push({ field: 'targetSpl', message: 'Enter a target SPL for watts-for-target mode.' });
		}
		if (input.headroomDb === undefined || !Number.isFinite(input.headroomDb)) {
			errors.push({
				field: 'headroomDb',
				message:
					'Enter headroom in dB. Suggested live-sound chips are 6 / 10 / 15 / 20 dB (Crown article). This tool does not default the Crown widget’s 3 dB example.',
			});
		}
	}

	if (errors.length) return fail(errors);

	const Z = input.impedanceOhm;
	const watts283 = wattsAt283V(Z);
	const sens1W1m = sensitivityTo1W1m(input.sensitivityDb, input.sensitivityRef, Z);
	const landmineNote =
		input.sensitivityRef === '2.83v1m'
			? `2.83 V into ${Z} Ω is ${watts283} W (2.83²/${Z}). 2.83²/8 = 1 W; 2.83²/4 = 2 W.`
			: 'Sensitivity entered as 1 W / 1 m.';

	const distance_m = lengthToMeters(input.distance, input.distanceUnit);
	const distTerm = distanceTermDb(distance_m, input.radiation);
	const nTerm = nTermDb(input.count, input.summing);

	let powerW = input.mode === 'watts-for-target' ? 1 : input.powerW;
	let wattsForTarget: number | null = null;
	let dBW: number | null = null;
	let headroomDb: number | null = null;

	if (input.mode === 'watts-for-target' && input.targetSpl !== undefined && input.headroomDb !== undefined) {
		headroomDb = input.headroomDb;
		const distanceLaw = input.radiation === 'line' ? 10 * Math.log10(distance_m / DREF_M) : 20 * Math.log10(distance_m / DREF_M);
		dBW = input.targetSpl - sens1W1m + distanceLaw - nTerm + input.headroomDb;
		wattsForTarget = wattsFromDbw(dBW);
		powerW = wattsForTarget;
	}

	const splAt1m = splAt1mFromSensAndPower(sens1W1m, powerW);
	const listenerSpl = splAt1m + distTerm + nTerm;
	const indoorNoteDb = input.indoorNote ? INDOOR_NOTE_DB : null;
	const indoorNoteSpl = indoorNoteDb === null ? null : listenerSpl + indoorNoteDb;

	return {
		ok: true,
		sens1W1m,
		wattsAt283V: watts283,
		powerW,
		nTermDb: nTerm,
		distanceTermDb: distTerm,
		distance_m,
		splAt1m,
		listenerSpl,
		indoorNoteDb,
		indoorNoteSpl,
		wattsForTarget,
		dBW,
		headroomDb,
		coherentWarning: input.summing === 'coherent',
		landmineNote,
		arrayGainDb: nTerm,
		distanceLossDb: distTerm,
		splAtDistance: listenerSpl,
	};
}

export function computeAesRatings(input: AesRatingsInput): AesRatingsResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.continuousW) || input.continuousW <= 0) {
		errors.push({ field: 'continuousW', message: 'Continuous power must be greater than zero.' });
	}
	if (!Number.isFinite(input.impedanceOhm) || input.impedanceOhm <= 0) {
		errors.push({ field: 'impedanceOhm', message: 'Impedance Z must be greater than zero.' });
	}
	if (errors.length) return fail(errors);

	const vrms = Math.sqrt(input.continuousW * input.impedanceOhm);
	const programW = PROGRAM_TIMES_CONTINUOUS * input.continuousW;
	const is2012 = input.aesPath === 'aes2-2012-12db';

	return {
		ok: true,
		vrms,
		zConvention: input.zConvention,
		zConventionLabel: zConventionLabel(input.zConvention),
		programW,
		programNote:
			'Program = 2 × continuous is a labeled B&C / QSC / Crown rule of thumb, not physics and not a 2-hour lab.',
		aesPath: input.aesPath,
		emitPeakConvention4x: !is2012,
		vPeak6dB: is2012 ? null : 2 * vrms,
		pPeakConvention: is2012 ? null : 4 * input.continuousW,
		aes2012Warning: is2012,
		aes2012Note: is2012
			? 'AES2-2012 uses a 12 dB crest factor. This drawer does not auto-emit 4× power as “AES peak.” 4× power is a 6 dB convention, not the 2012 CF.'
			: null,
		vPeak12dBVoltage: is2012 ? 4 * vrms : null,
	};
}

export function computeLimiterThreshold(input: LimiterInput): LimiterResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.powerW) || input.powerW <= 0) {
		errors.push({ field: 'powerW', message: 'Power for the limiter estimate must be greater than zero.' });
	}
	if (!Number.isFinite(input.impedanceOhm) || input.impedanceOhm <= 0) {
		errors.push({ field: 'impedanceOhm', message: 'Nominal Z must be greater than zero.' });
	}
	if (!Number.isFinite(input.crestFactorDb) || input.crestFactorDb < 0) {
		errors.push({ field: 'crestFactorDb', message: 'Crest factor must be a number ≥ 0 dB.' });
	}
	if (!Number.isFinite(input.ampGainDb)) {
		errors.push({ field: 'ampGainDb', message: 'Enter amplifier voltage gain G_amp in dB.' });
	}
	if (!Number.isFinite(input.fsDbu)) {
		errors.push({ field: 'fsDbu', message: 'Enter the processor full-scale mapping FS_dBu. This tool does not invent one.' });
	}
	if (errors.length) return fail(errors);

	const urms = Math.sqrt(input.powerW * input.impedanceOhm);
	const upeak =
		input.crestFactorDb === SIX_DB_CREST
			? 2 * urms
			: input.crestFactorDb === AES2_2012_CREST_DB
				? 4 * urms
				: urms * 10 ** (input.crestFactorDb / 20);
	const urmsDbu = dBuFromVrms(urms);
	const upeakDbu = dBuFromVrms(upeak);
	const thresholdDbu = upeakDbu - input.ampGainDb;
	const thresholdDbfs = thresholdDbu - input.fsDbu;

	return {
		ok: true,
		urms,
		upeak,
		crestFactorDb: input.crestFactorDb,
		urmsDbu,
		upeakDbu,
		ampGainDb: input.ampGainDb,
		thresholdDbu,
		fsDbu: input.fsDbu,
		thresholdDbfs,
		disclaimer: LEA_LIMITER_DISCLAIMER,
	};
}

export function formatMaxSplCopy(result: MaxSplSuccess): string {
	const dist = formatDualLength(result.distance_m);
	const coherent = result.coherentWarning ? ` ${COHERENT_WARNING}` : '';
	const indoor =
		result.indoorNoteSpl !== null
			? ` Crown-article indoor note +${INDOOR_NOTE_DB} dB (labeled, not a default): ${formatDb(result.indoorNoteSpl)} dB.`
			: '';
	if (result.wattsForTarget !== null && result.dBW !== null && result.headroomDb !== null) {
		return `Watts for target ${formatFixed(result.wattsForTarget, 1)} W (dBW ${formatDb(result.dBW)}, headroom ${formatDb(result.headroomDb)} dB you entered). Continuous listener SPL at that power ${formatDb(result.listenerSpl)} dB at ${dist}. Peak is not this number.${coherent}${indoor} ${result.landmineNote} Free-field on-axis. Not a hearing-dose calculator. Not a MAPP or ArrayCalc prediction. Verify with measurement.`;
	}
	return `Continuous listener SPL ${formatDb(result.listenerSpl)} dB at ${dist} (free-field, on-axis). SPL at 1 m ${formatDb(result.splAt1m)} dB from sensitivity + 10 log10(P); N-term ${formatDb(result.nTermDb)} dB and distance ${formatDb(result.distanceTermDb)} dB are added after. Peak is not this number.${coherent}${indoor} ${result.landmineNote} Not a hearing-dose calculator. Not a MAPP or ArrayCalc prediction. Verify with measurement.`;
}

export function formatAesCopy(aes: AesRatingsSuccess): string {
	const z = `Vrms ${formatFixed(aes.vrms, 3)} V at ${aes.zConventionLabel}.`;
	const program = `Program rule of thumb ${formatFixed(aes.programW, 1)} W (2 × continuous; not physics).`;
	if (aes.emitPeakConvention4x && aes.vPeak6dB !== null && aes.pPeakConvention !== null) {
		return `${z} 6 dB crest convention: Vpeak = 2 × Vrms = ${formatFixed(aes.vPeak6dB, 3)} V; Ppeak_convention = 4 × P = ${formatFixed(aes.pPeakConvention, 1)} W. ${program} Not a certification. Not a 2-hour lab.`;
	}
	return `${z} AES2-2012 12 dB CF: 4× power is not emitted as AES peak. 12 dB voltage crest is Upeak = 4 × Urms${aes.vPeak12dBVoltage !== null ? ` = ${formatFixed(aes.vPeak12dBVoltage, 3)} V` : ''}. ${program} ${aes.aes2012Note ?? ''} Not a certification. Not a 2-hour lab.`;
}

export function formatLimiterCopy(lim: LimiterSuccess): string {
	return `Limiter starting estimate (nominal Z): Urms ${formatFixed(lim.urms, 3)} V (${formatDb(lim.urmsDbu)} dBu), Upeak ${formatFixed(lim.upeak, 3)} V (${formatDb(lim.upeakDbu)} dBu) at CF ${formatDb(lim.crestFactorDb)} dB. Threshold ${formatDb(lim.thresholdDbu)} dBu = Upeak_dBu − G_amp ${formatDb(lim.ampGainDb)} dB. Threshold ${formatDb(lim.thresholdDbfs)} dBFS = Threshold_dBu − FS_dBu ${formatDb(lim.fsDbu)}. ${lim.disclaimer}`;
}
