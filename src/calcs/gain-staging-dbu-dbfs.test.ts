import { describe, expect, it } from 'vitest';
import {
	DBU_MINUS_DBV,
	PLUS4_VS_MINUS10_DB,
	RANE_BAL_TO_UNBAL_DB,
	analogToDbfs,
	computeGainStaging,
	dBuFromDBv,
	dBuFromVrms,
	haTrimResult,
	headroomToFs,
	interconnectLevelChange,
	micLevelDbv,
	preampGainDb,
	vrmsFromDBv,
	vrmsFromDbu,
} from './gain-staging-dbu-dbfs.ts';

describe('C01 / C02 voltages and +4 vs −10', () => {
	it('+4 dBu → Vrms ≈ 1.228', () => {
		expect(vrmsFromDbu(4)).toBeCloseTo(0.775 * 10 ** (4 / 20), 12);
		expect(vrmsFromDbu(4)).toBeCloseTo(1.228, 3);
	});

	it('0 dBu → 0.775 Vrms', () => {
		expect(vrmsFromDbu(0)).toBe(0.775);
		expect(dBuFromVrms(0.775)).toBeCloseTo(0, 12);
	});

	it('−10 dBV → 0.3162 Vrms; ≡ −7.78 dBu; +4 vs −10 = 11.78 dB', () => {
		const v = vrmsFromDBv(-10);
		expect(v).toBeCloseTo(10 ** (-10 / 20), 12);
		expect(v).toBeCloseTo(0.3162, 4);
		const minus10Dbu = dBuFromDBv(-10);
		expect(minus10Dbu).toBeCloseTo(-7.78, 1);
		expect(PLUS4_VS_MINUS10_DB).toBeCloseTo(4 - minus10Dbu, 12);
		expect(PLUS4_VS_MINUS10_DB).toBeCloseTo(11.78, 1);
		expect(PLUS4_VS_MINUS10_DB).not.toBe(14);
	});
});

describe('C02 analog to dBFS and headroom', () => {
	it('FS=+24, analog=+4 → −20 dBFS; headroom 20 dB', () => {
		expect(analogToDbfs(4, 24)).toBe(-20);
		expect(headroomToFs(4, 24)).toBe(20);
		const result = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, fsDbu: 24, applyRanePad: false });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dBfs).toBe(-20);
		expect(result.headroomDb).toBe(20);
	});

	it('FS=+19 (RME Lo Gain), +4 → −15 dBFS', () => {
		const result = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, fsDbu: 19, applyRanePad: false });
		expect(result.ok && result.dBfs).toBe(-15);
	});

	it('FS=+13 (RME +4 switch), +4 → −9 dBFS', () => {
		const result = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, fsDbu: 13, applyRanePad: false });
		expect(result.ok && result.dBfs).toBe(-9);
	});
});

describe('C05 mic preamp helper', () => {
	it('sens −59 dBV/Pa at 94 dB SPL; gain from closed form', () => {
		expect(micLevelDbv(-59, 94)).toBe(-59);
		const micDbu = dBuFromDBv(-59);
		expect(micDbu).toBeCloseTo(-59 + DBU_MINUS_DBV, 12);
		const gain = preampGainDb(-18, 24, micDbu, 0);
		expect(gain).toBeCloseTo(-18 + 24 - micDbu, 12);
		const result = computeGainStaging({
			mode: 'mic-pre',
			splDba: 94,
			micSensitivityDbvPerPa: -59,
			fsDbu: 24,
			targetDbfs: -18,
			padDb: 0,
			applyRanePad: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.micLdBv).toBe(-59);
		expect(result.micOutputDbu).toBeCloseTo(micDbu, 12);
		expect(result.preampGainDb).toBeCloseTo(gain, 12);
	});

	it('without FS or target still returns L_dBV; gain stays empty', () => {
		const result = computeGainStaging({
			mode: 'mic-pre',
			splDba: 94,
			micSensitivityDbvPerPa: -40,
			applyRanePad: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dBv).toBeCloseTo(-40, 12);
		expect(result.preampGainDb).toBeNull();
	});
});

describe('C14 analog HA vs digital trim', () => {
	it('delta_HA=+6, compensation off → delta_trim=−6; on → network 0', () => {
		const off = haTrimResult(6, false);
		expect(off.deltaTrimDb).toBe(-6);
		expect(off.digitalLevelChangeDb).toBe(0);
		const on = haTrimResult(6, true);
		expect(on.networkLevelChangeDb).toBe(0);
		const resultOff = computeGainStaging({
			mode: 'ha-trim',
			deltaHaDb: 6,
			yamahaCompensation: false,
			applyRanePad: false,
		});
		expect(resultOff.ok && resultOff.deltaTrimDb).toBe(-6);
		const resultOn = computeGainStaging({
			mode: 'ha-trim',
			deltaHaDb: 6,
			yamahaCompensation: true,
			applyRanePad: false,
		});
		expect(resultOn.ok && resultOn.networkLevelChangeDb).toBe(0);
		expect(resultOn.ok && resultOn.unclipNote).toMatch(/cannot unclip/i);
	});
});

describe('C06 interconnect', () => {
	it('ordinary differential bal→unbal is −6 dB', () => {
		expect(interconnectLevelChange('differential')).toBe(RANE_BAL_TO_UNBAL_DB);
		expect(interconnectLevelChange('differential')).toBe(-6);
		expect(interconnectLevelChange('transformer')).toBe(0);
		const result = computeGainStaging({
			mode: 'interconnect',
			balUnbal: 'differential',
			applyRanePad: false,
		});
		expect(result.ok && result.balUnbalDb).toBe(-6);
	});
});

describe('Invalid / empty FS', () => {
	it('refuses empty FS in analog-to-dBFS and does not emit NaN', () => {
		const result = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, applyRanePad: false });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors.some((e) => e.field === 'fsDbu')).toBe(true);
		expect(result.errors.some((e) => Number.isNaN(e as unknown as number))).toBe(false);
	});
});
