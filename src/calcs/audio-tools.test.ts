import { describe, expect, it } from 'vitest';
import { computeGainStaging, PLUS4_VS_MINUS10_DB, vrmsFromDbu, dBuFromVrms } from './gain-staging.ts';
import { computeWirelessSpacing, RF_C_MPS, BELDEN_9913_ALPHA_DB_PER_100M_700MHZ } from './wireless-antenna.ts';
import {
	AWG_UNCITED_REFUSAL,
	COPPER_DCR_OHM_PER_KFT,
	computeSpeakerCableLoss,
} from './speaker-cable-loss.ts';
import { computePhantomBudget } from './phantom-budget.ts';
import { computeShowLatency, samplesToMs, DANTE_HOP_TABLE, AIR_C_20C } from './show-latency.ts';
import { computeSpeakerImpedance, parallelZ, seriesZ } from './speaker-impedance.ts';
import { computeCardioidSub } from './cardioid-sub.ts';
import { compute70vTap, FIRE_ALARM_REFUSAL, VOLTAGE_70V } from './seventy-volt.ts';
import { computeNoiseDose, allowedHours, NIOSH_LC, NIOSH_Q, OSHA_LC, OSHA_Q } from './noise-dose.ts';
import { computeSubMainDelay, speedOfSoundSubMain, wrapPhaseDeg } from './sub-main-delay.ts';

describe('gain-staging Example 1: +4 dBu and −10 dBV', () => {
	it('Vrms = 0.775 × 10^(dBu/20) and +4 vs −10 = 11.78 dB', () => {
		expect(vrmsFromDbu(4)).toBeCloseTo(0.775 * 10 ** (4 / 20), 12);
		expect(dBuFromVrms(vrmsFromDbu(4))).toBeCloseTo(4, 12);
		expect(PLUS4_VS_MINUS10_DB).toBeCloseTo(11.78, 1);
		const minus10V = 10 ** (-10 / 20);
		const minus10Dbu = 20 * Math.log10(minus10V / 0.775);
		expect(4 - minus10Dbu).toBeCloseTo(PLUS4_VS_MINUS10_DB, 12);
		const result = computeGainStaging({ mode: 'dbu-to-v', dBu: 4, applyRanePad: false, fsDbu: 19 });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dBfs).toBeCloseTo(4 - 19, 12);
		expect(result.dBfs).toBeCloseTo(-15, 12);
	});

	it('refuses a missing FS_dBu instead of inventing a universal FS volt', () => {
		const result = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, applyRanePad: false });
		expect(result.ok).toBe(false);
	});

	it('mic helper uses 1 Pa = 94 dB SPL', () => {
		const result = computeGainStaging({
			mode: 'mic-pre',
			splDba: 94,
			micSensitivityDbvPerPa: -40,
			applyRanePad: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dBv).toBeCloseTo(-40, 12);
	});
});

describe('wireless-antenna Example 1: 500 MHz', () => {
	it('uses c = 2.99792458e8, not 343, and ¼λ diversity', () => {
		const f = 500e6;
		const result = computeWirelessSpacing({ frequencyHz: f, applyCoax: false });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.lambda_m).toBeCloseTo(RF_C_MPS / f, 12);
		expect(result.lambda_m).not.toBeCloseTo(343 / f, 6);
		expect(result.lambdaApprox_m).toBeCloseTo(300 / 500, 12);
		expect(result.quarterWave_m).toBeCloseTo(result.lambda_m / 4, 12);
	});

	it('coax loss is (L/100)×11.8 only at the cited 9913 @ 700 MHz α', () => {
		const result = computeWirelessSpacing({
			frequencyHz: 700e6,
			applyCoax: true,
			coaxLength: 50,
			coaxLengthUnit: 'm',
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.coaxLossDb).toBeCloseTo((50 / 100) * BELDEN_9913_ALPHA_DB_PER_100M_700MHZ, 12);
		expect(result.coaxLossDb).toBeCloseTo(5.9, 12);
	});
});

describe('speaker-cable-loss Example 1: 50 ft 12 AWG into 8 Ω', () => {
	it('ships cited 12 AWG 1.588 Ω/kft and shows both % definitions', () => {
		expect(COPPER_DCR_OHM_PER_KFT['12']?.dcr).toBe(1.588);
		expect(COPPER_DCR_OHM_PER_KFT['14']).toBeUndefined();
		const result = computeSpeakerCableLoss({
			length: 50,
			lengthUnit: 'ft',
			dcr: null,
			dcrUnit: 'ohm-per-kft',
			awgPreset: '12',
			loadZ: 8,
			reOhm: null,
			zAmpOhm: null,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const loopR = 2 * 50 * (1.588 / 1000);
		expect(result.loopR).toBeCloseTo(loopR, 12);
		expect(result.voltageRatio).toBeCloseTo(8 / (8 + loopR), 12);
		expect(result.powerShortfallPct).toBeCloseTo(100 * (1 - result.voltageRatio ** 2), 12);
		expect(result.resistanceRatioPct).toBeCloseTo(100 * (loopR / (loopR + 8)), 12);
		expect(result.powerShortfallPct).not.toBeCloseTo(result.resistanceRatioPct, 5);
		expect(result.attenDb).toBeCloseTo(-20 * Math.log10(result.voltageRatio), 12);
		expect(result.dampingFactor).toBeNull();
	});

	it('fails closed on an uncited AWG preset and still accepts custom DCR', () => {
		const refused = computeSpeakerCableLoss({
			length: 50,
			lengthUnit: 'ft',
			dcr: 2,
			dcrUnit: 'ohm-per-kft',
			awgPreset: '14',
			loadZ: 8,
			reOhm: null,
			zAmpOhm: null,
		});
		expect(refused.ok).toBe(false);
		if (refused.ok) return;
		expect(refused.errors[0].message).toBe(AWG_UNCITED_REFUSAL);
		const custom = computeSpeakerCableLoss({
			length: 50,
			lengthUnit: 'ft',
			dcr: 2,
			dcrUnit: 'ohm-per-kft',
			loadZ: 8,
			reOhm: 6,
			zAmpOhm: 0,
		});
		expect(custom.ok).toBe(true);
		if (!custom.ok) return;
		expect(custom.loopR).toBeCloseTo(0.2, 12);
		expect(custom.dampingFactor).toBeCloseTo(6 / 0.2, 12);
	});

	it('rejects non-positive length', () => {
		const result = computeSpeakerCableLoss({
			length: 0,
			lengthUnit: 'ft',
			dcr: 1.588,
			dcrUnit: 'ohm-per-kft',
			loadZ: 8,
			reOhm: null,
			zAmpOhm: null,
		});
		expect(result.ok).toBe(false);
	});
});

describe('phantom-power-budget Example 1: 3×4 mA + 2×7 mA', () => {
	it('totals 26 mA and keeps an empty budget empty', () => {
		const result = computePhantomBudget({
			rows: [
				{ label: 'condenser', mA: 4, count: 3 },
				{ label: 'DI', mA: 7, count: 2 },
			],
			budgetMa: null,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.totalMa).toBe(26);
		expect(result.budgetMa).toBeNull();
		expect(result.remainingMa).toBeNull();
	});
});

describe('show-latency Example 1: 32 samples at 48 kHz', () => {
	it('t_ms = 1000×N/fs and Dante hops stay discrete', () => {
		expect(samplesToMs(32, 48000)).toBeCloseTo(1000 * 32 / 48000, 12);
		const result = computeShowLatency({
			stages: [{ label: 'buffer', samples: 32, sampleRate: 48000 }],
			includeAirPath: true,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.totalMs).toBeCloseTo(2 / 3, 12);
		expect(result.airPath_m).toBeCloseTo(AIR_C_20C * (result.totalMs / 1000), 12);
		expect(AIR_C_20C).toBe(343.3);
		expect(DANTE_HOP_TABLE.map((r) => r.ms)).toEqual([0.25, 0.5, 1, 2, 5]);
	});
});

describe('speaker-impedance Example 1: two 8 Ω parallel; bridged Z_ch = Z/2', () => {
	it('parallel 8∥8 = 4 Ω and bridged 8 Ω sees 4 Ω per channel', () => {
		expect(parallelZ([8, 8])).toBeCloseTo(4, 12);
		expect(seriesZ([8, 8])).toBe(16);
		const par = computeSpeakerImpedance({ mode: 'parallel', impedances: [8, 8] });
		expect(par.ok && par.zLoad).toBeCloseTo(4, 12);
		const br = computeSpeakerImpedance({ mode: 'bridged', impedances: [8] });
		expect(br.ok && br.zLoad).toBe(8);
		expect(br.ok && br.zPerChannel).toBeCloseTo(4, 12);
	});
});

describe('cardioid-sub-array Example 1: 80 Hz at 20 °C, λ/4 not λ/2', () => {
	it('spacing is λ/4 and rear delay is 1000/(4f)', () => {
		const result = computeCardioidSub({ frequencyHz: 80, temperature: 20, temperatureUnit: 'C' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.c_m_s).toBe(343.3);
		expect(result.lambda_m).toBeCloseTo(343.3 / 80, 12);
		expect(result.spacing_m).toBeCloseTo(result.lambda_m / 4, 12);
		expect(result.spacing_m).not.toBeCloseTo(result.lambda_m / 2, 6);
		expect(result.rearDelayMs).toBeCloseTo(1000 / (4 * 80), 12);
		expect(result.rearPolarity).toBe('inverted');
	});
});

describe('70v-tap Example 1: 10 W at 70.7 V; fire-alarm refused', () => {
	it('Z = V²/P and refuses NFPA/EN 54', () => {
		const ok = compute70vTap({
			fireAlarm: false,
			voltage: VOLTAGE_70V,
			taps: [{ watts: 10, count: 1 }],
		});
		expect(ok.ok).toBe(true);
		if (!ok.ok || ok.refused) return;
		expect(ok.totalZ).toBeCloseTo((70.7 * 70.7) / 10, 12);
		expect(ok.totalCurrent).toBeCloseTo(10 / 70.7, 12);
		const refused = compute70vTap({ fireAlarm: true, voltage: VOLTAGE_70V, taps: [{ watts: 10, count: 1 }] });
		expect(refused.ok && 'refused' in refused && refused.refused).toBe(true);
		if (refused.ok && refused.refused) expect(refused.message).toBe(FIRE_ALARM_REFUSAL);
	});
});

describe('noise-dose Example 1: 85 dBA × 8 h NIOSH = 100%', () => {
	it('uses NIOSH 85/3 and OSHA 90/5', () => {
		expect(allowedHours(85, NIOSH_LC, NIOSH_Q)).toBe(8);
		expect(allowedHours(90, OSHA_LC, OSHA_Q)).toBe(8);
		const niosh = computeNoiseDose({ bands: [{ levelDba: 85, hours: 8 }] });
		expect(niosh.ok && niosh.niosh.dosePct).toBeCloseTo(100, 12);
		const niosh88 = computeNoiseDose({ bands: [{ levelDba: 88, hours: 8 }] });
		expect(niosh88.ok && niosh88.niosh.dosePct).toBeCloseTo(200, 12);
		const osha = computeNoiseDose({ bands: [{ levelDba: 90, hours: 8 }] });
		expect(osha.ok && osha.osha.dosePct).toBeCloseTo(100, 12);
	});
});

describe('sub-main-crossover-delay Example 1: 12 m sub vs 10 m main at 20 °C', () => {
	it('uses 331.3 + 0.606×T_C (343.42 at 20 °C), not Sengpiel 343.3 or hardcoded 343', () => {
		const c = speedOfSoundSubMain(20);
		expect(c).toBe(331.3 + 0.606 * 20);
		expect(c).toBeCloseTo(343.42, 12);
		expect(c).not.toBe(343);
		expect(c).not.toBe(343.3);
		const result = computeSubMainDelay({
			pathSub: 12,
			pathMain: 10,
			lengthUnit: 'm',
			temperature: 20,
			temperatureUnit: 'C',
			filterDelayMs: null,
			crossoverHz: 80,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.c_m_s).toBe(c);
		expect(result.geometricMs).toBeCloseTo(2000 / c, 12);
		expect(result.delayChannel).toBe('main');
		expect(result.t_set).toBeCloseTo(result.geometricMs, 12);
		expect(result.phaseDeg).toBeCloseTo(wrapPhaseDeg(360 * 80 * (2 / c)), 12);
	});
});
