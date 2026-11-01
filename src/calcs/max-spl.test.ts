import { describe, expect, it } from 'vitest';
import {
	AES2_2012_CREST_DB,
	computeAesRatings,
	computeLimiterThreshold,
	computeMaxSpl,
	crownPointDbw,
	distanceTermDb,
	nTermDb,
	sensitivityTo1W1m,
	SIX_DB_CREST,
	splAt1mFromSensAndPower,
	wattsAt283V,
	wattsFromDbw,
} from './max-spl.ts';

describe('Crown page example: 100 m, 85 dB target, 95 dB 1 W/1 m, 3 dB HR', () => {
	it('is ~1995 W from dBW = Lreq − Lsens + 20 log10(D/1) + HR', () => {
		const dBW = crownPointDbw(85, 95, 100, 3);
		expect(dBW).toBeCloseTo(85 - 95 + 20 * Math.log10(100) + 3, 12);
		expect(dBW).toBeCloseTo(33, 12);
		const watts = wattsFromDbw(dBW);
		expect(watts).toBeCloseTo(10 ** 3.3, 12);
		expect(watts).toBeCloseTo(1995.262314968879, 10);

		const result = computeMaxSpl({
			sensitivityDb: 95,
			sensitivityRef: '1w1m',
			impedanceOhm: 8,
			powerW: 1,
			distance: 100,
			distanceUnit: 'm',
			radiation: 'point',
			count: 1,
			summing: 'incoherent',
			mode: 'watts-for-target',
			targetSpl: 85,
			headroomDb: 3,
			indoorNote: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dBW).toBeCloseTo(33, 12);
		expect(result.wattsForTarget).toBeCloseTo(1995.262314968879, 10);
		expect(result.nTermDb).toBeCloseTo(0, 12);
	});
});

describe('Sens 98 dB @ 1 W/1 m, P=800 W, N=1, d=1 m, point, incoherent', () => {
	it('SPL_1m = 98 + 10 log10(800) ≈ 127.03 dB and does not fold N into SPL_1m', () => {
		const spl1m = splAt1mFromSensAndPower(98, 800);
		expect(spl1m).toBeCloseTo(98 + 10 * Math.log10(800), 12);
		expect(spl1m).toBeCloseTo(127.03089986991944, 10);

		const result = computeMaxSpl({
			sensitivityDb: 98,
			sensitivityRef: '1w1m',
			impedanceOhm: 8,
			powerW: 800,
			distance: 1,
			distanceUnit: 'm',
			radiation: 'point',
			count: 1,
			summing: 'incoherent',
			mode: 'max-spl',
			indoorNote: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.splAt1m).toBeCloseTo(spl1m, 12);
		expect(result.nTermDb).toBeCloseTo(0, 12);
		expect(result.distanceTermDb).toBeCloseTo(0, 12);
		expect(result.listenerSpl).toBeCloseTo(spl1m, 12);
		expect(result.splAt1m).toBe(result.listenerSpl);
	});

	it('same at 10 m point subtracts 20 dB → ≈ 107.03 dB', () => {
		expect(distanceTermDb(10, 'point')).toBeCloseTo(-20, 12);
		const result = computeMaxSpl({
			sensitivityDb: 98,
			sensitivityRef: '1w1m',
			impedanceOhm: 8,
			powerW: 800,
			distance: 10,
			distanceUnit: 'm',
			radiation: 'point',
			count: 1,
			summing: 'incoherent',
			mode: 'max-spl',
			indoorNote: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.splAt1m).toBeCloseTo(98 + 10 * Math.log10(800), 12);
		expect(result.listenerSpl).toBeCloseTo(result.splAt1m - 20, 12);
		expect(result.listenerSpl).toBeCloseTo(107.03089986991944, 10);
	});
});

describe('N-box summing', () => {
	it('N=4 incoherent → +6.02 dB; N=4 coherent → +12.04 dB', () => {
		expect(nTermDb(4, 'incoherent')).toBeCloseTo(10 * Math.log10(4), 12);
		expect(nTermDb(4, 'incoherent')).toBeCloseTo(6.020599913279624, 10);
		expect(nTermDb(4, 'coherent')).toBeCloseTo(20 * Math.log10(4), 12);
		expect(nTermDb(4, 'coherent')).toBeCloseTo(12.041199826559248, 10);

		const base = {
			sensitivityDb: 98,
			sensitivityRef: '1w1m' as const,
			impedanceOhm: 8,
			powerW: 800,
			distance: 1,
			distanceUnit: 'm' as const,
			radiation: 'point' as const,
			mode: 'max-spl' as const,
			indoorNote: false,
		};
		const inc = computeMaxSpl({ ...base, count: 4, summing: 'incoherent' });
		const coh = computeMaxSpl({ ...base, count: 4, summing: 'coherent' });
		expect(inc.ok && inc.nTermDb).toBeCloseTo(6.020599913279624, 10);
		expect(coh.ok && coh.nTermDb).toBeCloseTo(12.041199826559248, 10);
		expect(coh.ok && coh.coherentWarning).toBe(true);
		expect(inc.ok && inc.coherentWarning).toBe(false);
		if (inc.ok && coh.ok) {
			expect(inc.splAt1m).toBeCloseTo(coh.splAt1m, 12);
			expect(inc.splAt1m).toBeCloseTo(98 + 10 * Math.log10(800), 12);
			expect(inc.listenerSpl).toBeCloseTo(inc.splAt1m + inc.nTermDb, 12);
			expect(coh.listenerSpl).toBeCloseTo(coh.splAt1m + coh.nTermDb, 12);
		}
	});
});

describe('2.83 V sensitivity into 4 Ω', () => {
	it('converts before SPL_1m; reference power = 2.83²/4 = 2 W', () => {
		expect(wattsAt283V(8)).toBeCloseTo((2.83 * 2.83) / 8, 12);
		expect(wattsAt283V(4)).toBeCloseTo((2.83 * 2.83) / 4, 12);
		// Labeled landmine from the spec: 2.83²/8 = 1 W; 2.83²/4 = 2 W (2.83 is not √8).

		const sens1W = sensitivityTo1W1m(98, '2.83v1m', 4);
		expect(sens1W).toBeCloseTo(98 - 10 * Math.log10((2.83 * 2.83) / 4), 12);

		const result = computeMaxSpl({
			sensitivityDb: 98,
			sensitivityRef: '2.83v1m',
			impedanceOhm: 4,
			powerW: 800,
			distance: 1,
			distanceUnit: 'm',
			radiation: 'point',
			count: 1,
			summing: 'incoherent',
			mode: 'max-spl',
			indoorNote: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.sens1W1m).toBeCloseTo(sens1W, 12);
		expect(result.splAt1m).toBeCloseTo(sens1W + 10 * Math.log10(800), 12);
		expect(result.splAt1m).not.toBeCloseTo(98 + 10 * Math.log10(800), 6);
	});
});

describe('AES / program / peak conventions', () => {
	it('6 dB CF: Vpeak = 2 Vrms and Ppeak_convention = 4P', () => {
		expect(SIX_DB_CREST).toBe(6);
		const aes = computeAesRatings({
			continuousW: 100,
			impedanceOhm: 8,
			zConvention: 'zmin',
			aesPath: '6db-convention',
		});
		expect(aes.ok).toBe(true);
		if (!aes.ok) return;
		expect(aes.vrms).toBeCloseTo(Math.sqrt(100 * 8), 12);
		expect(aes.vPeak6dB).toBeCloseTo(2 * aes.vrms, 12);
		expect(aes.pPeakConvention).toBe(400);
		expect(aes.emitPeakConvention4x).toBe(true);
		expect(aes.programW).toBe(200);
		expect(aes.aes2012Warning).toBe(false);
	});

	it('AES2-2012 12 dB path must not silently use 4× as AES peak', () => {
		expect(AES2_2012_CREST_DB).toBe(12);
		const aes = computeAesRatings({
			continuousW: 100,
			impedanceOhm: 8,
			zConvention: 'znom',
			aesPath: 'aes2-2012-12db',
		});
		expect(aes.ok).toBe(true);
		if (!aes.ok) return;
		expect(aes.emitPeakConvention4x).toBe(false);
		expect(aes.pPeakConvention).toBeNull();
		expect(aes.vPeak6dB).toBeNull();
		expect(aes.aes2012Warning).toBe(true);
		expect(aes.vPeak12dBVoltage).toBeCloseTo(4 * aes.vrms, 12);
		expect(aes.pPeakConvention).not.toBe(4 * 100);
	});
});

describe('Limiter / crest drawer', () => {
	it('6 dB ⇒ Upeak = 2 Urms; 12 dB ⇒ Upeak = 4 Urms; dBu uses 0.775 V', () => {
		const six = computeLimiterThreshold({
			powerW: 100,
			impedanceOhm: 8,
			crestFactorDb: 6,
			ampGainDb: 32,
			fsDbu: 20,
		});
		expect(six.ok).toBe(true);
		if (!six.ok) return;
		expect(six.urms).toBeCloseTo(Math.sqrt(800), 12);
		expect(six.upeak).toBeCloseTo(2 * six.urms, 12);
		expect(six.urmsDbu).toBeCloseTo(20 * Math.log10(six.urms / 0.775), 12);
		expect(six.upeakDbu).toBeCloseTo(20 * Math.log10(six.upeak / 0.775), 12);
		expect(six.thresholdDbu).toBeCloseTo(six.upeakDbu - 32, 12);
		expect(six.thresholdDbfs).toBeCloseTo(six.thresholdDbu - 20, 12);

		const twelve = computeLimiterThreshold({
			powerW: 100,
			impedanceOhm: 8,
			crestFactorDb: 12,
			ampGainDb: 32,
			fsDbu: 20,
		});
		expect(twelve.ok).toBe(true);
		if (!twelve.ok) return;
		expect(twelve.upeak).toBeCloseTo(4 * twelve.urms, 12);
		expect(twelve.upeak / twelve.urms).not.toBeCloseTo(2, 6);
	});
});

describe('Invalid inputs: structured errors, no NaN', () => {
	it('rejects P≤0, N<1, d≤0, Z≤0, and empty required watts fields', () => {
		const base = {
			sensitivityDb: 98,
			sensitivityRef: '1w1m' as const,
			impedanceOhm: 8,
			powerW: 800,
			distance: 10,
			distanceUnit: 'm' as const,
			radiation: 'point' as const,
			count: 1,
			summing: 'incoherent' as const,
			mode: 'max-spl' as const,
			indoorNote: false,
		};

		const power = computeMaxSpl({ ...base, powerW: 0 });
		expect(power.ok).toBe(false);
		if (!power.ok) expect(power.errors.some((e) => e.field === 'powerW')).toBe(true);

		const n = computeMaxSpl({ ...base, count: 0 });
		expect(n.ok).toBe(false);
		if (!n.ok) expect(n.errors.some((e) => e.field === 'count')).toBe(true);

		const nFrac = computeMaxSpl({ ...base, count: 1.5 });
		expect(nFrac.ok).toBe(false);

		const d = computeMaxSpl({ ...base, distance: 0 });
		expect(d.ok).toBe(false);
		if (!d.ok) expect(d.errors.some((e) => e.field === 'distance')).toBe(true);

		const z = computeMaxSpl({ ...base, impedanceOhm: 0 });
		expect(z.ok).toBe(false);
		if (!z.ok) expect(z.errors.some((e) => e.field === 'impedanceOhm')).toBe(true);

		const emptySens = computeMaxSpl({ ...base, sensitivityDb: Number.NaN });
		expect(emptySens.ok).toBe(false);
		if (!emptySens.ok) {
			expect(emptySens.errors.length).toBeGreaterThan(0);
			expect(emptySens.errors.some((e) => Number.isNaN(e as unknown as number))).toBe(false);
		}

		const wattsEmptyHr = computeMaxSpl({
			...base,
			mode: 'watts-for-target',
			targetSpl: 85,
		});
		expect(wattsEmptyHr.ok).toBe(false);
		if (!wattsEmptyHr.ok) expect(wattsEmptyHr.errors.some((e) => e.field === 'headroomDb')).toBe(true);

		const wattsEmptyTarget = computeMaxSpl({
			...base,
			mode: 'watts-for-target',
			headroomDb: 6,
		});
		expect(wattsEmptyTarget.ok).toBe(false);
		if (!wattsEmptyTarget.ok) expect(wattsEmptyTarget.errors.some((e) => e.field === 'targetSpl')).toBe(true);
	});

	it('indoor +6 dB is a labeled note and never a silent default', () => {
		const off = computeMaxSpl({
			sensitivityDb: 98,
			sensitivityRef: '1w1m',
			impedanceOhm: 8,
			powerW: 800,
			distance: 1,
			distanceUnit: 'm',
			radiation: 'point',
			count: 1,
			summing: 'incoherent',
			mode: 'max-spl',
			indoorNote: false,
		});
		const on = computeMaxSpl({
			sensitivityDb: 98,
			sensitivityRef: '1w1m',
			impedanceOhm: 8,
			powerW: 800,
			distance: 1,
			distanceUnit: 'm',
			radiation: 'point',
			count: 1,
			summing: 'incoherent',
			mode: 'max-spl',
			indoorNote: true,
		});
		expect(off.ok && off.indoorNoteSpl).toBeNull();
		expect(on.ok && on.listenerSpl).toBe(off.ok ? off.listenerSpl : NaN);
		expect(on.ok && on.indoorNoteSpl).toBeCloseTo((off.ok ? off.listenerSpl : 0) + 6, 12);
	});

	it('AES and limiter reject non-positive Z/P without emitting NaN fields', () => {
		const aes = computeAesRatings({
			continuousW: 0,
			impedanceOhm: 8,
			zConvention: 'zmin',
			aesPath: '6db-convention',
		});
		expect(aes.ok).toBe(false);
		const lim = computeLimiterThreshold({
			powerW: 100,
			impedanceOhm: -8,
			crestFactorDb: 6,
			ampGainDb: 32,
			fsDbu: 20,
		});
		expect(lim.ok).toBe(false);
	});
});

describe('Line-source distance and watts inverse stay on the −10 log10 law', () => {
	it('10 m line is −10 dB, and Crown-style watts uses 10 log10(D) for line', () => {
		expect(distanceTermDb(10, 'line')).toBeCloseTo(-10, 12);
		const result = computeMaxSpl({
			sensitivityDb: 95,
			sensitivityRef: '1w1m',
			impedanceOhm: 8,
			powerW: 1,
			distance: 100,
			distanceUnit: 'm',
			radiation: 'line',
			count: 1,
			summing: 'incoherent',
			mode: 'watts-for-target',
			targetSpl: 85,
			headroomDb: 3,
			indoorNote: false,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.dBW).toBeCloseTo(85 - 95 + 10 * Math.log10(100) + 3, 12);
		expect(result.dBW).not.toBeCloseTo(33, 6);
	});
});
