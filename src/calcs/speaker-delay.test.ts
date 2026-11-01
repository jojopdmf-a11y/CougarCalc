import { describe, expect, it } from 'vitest';
import { parseFiniteNumber, parseInteger, parseOptionalFiniteNumber } from './parse.ts';
import {
	computeSpeakerDelay,
	formatDelayCopy,
	formatDelayMsDisplay,
	speedOfSoundSengpiel,
	type SpeakerDelayInput,
} from './speaker-delay.ts';
import { lengthToMeters, temperatureToCelsius } from './units.ts';

/** Example 1 from the locked UX spec. Recalculated independently here. */
const example1: SpeakerDelayInput = {
	pathA: 30,
	pathB: 20,
	lengthUnit: 'm',
	temperature: 20,
	temperatureUnit: 'C',
	haasMs: 0,
	sampleRate: 48000,
};

const C_20 = 331.3 + 0.6 * 20;
const DELAY_MS_EXAMPLE1 = (1000 * 10) / C_20;
const EPS = 1e-12;

describe('speed of sound', () => {
	it('uses Sengpiel simplified 331.3 + 0.6×T_C, not AudioCalcs 1086+1.08×T_F or 344 m/s', () => {
		expect(speedOfSoundSengpiel(0)).toBe(331.3);
		expect(speedOfSoundSengpiel(20)).toBe(343.3);
		expect(C_20).toBe(343.3);
		expect(speedOfSoundSengpiel(20)).not.toBe(344);
		const audioCalcsFtS = 1086 + 1.08 * 68;
		const audioCalcsMs = audioCalcsFtS * 0.3048;
		expect(speedOfSoundSengpiel(20)).not.toBe(audioCalcsMs);
	});
});

describe('Example 1: Path A 30 m, Path B 20 m, 20 °C, Haas off', () => {
	it('matches c=343.3, delay=1000×10/343.3, DELAY PATH B', () => {
		const result = computeSpeakerDelay(example1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.c_m_s).toBe(343.3);
		expect(result.delay_ms).toBeCloseTo(DELAY_MS_EXAMPLE1, 12);
		expect(result.delay_ms).toBeCloseTo(10000 / 343.3, 12);
		expect(result.t_set).toBeCloseTo(result.delay_ms, 12);
		expect(result.delayChannel).toBe('B');
		expect(result.delayChannelLabel).toBe('Delay path B');
		expect(result.fartherPath).toBe('A');
		expect(result.t_set).toBeGreaterThanOrEqual(0);
		expect(formatDelayMsDisplay(result.t_set)).toBe('29.1');
	});

	it('copy payload matches the locked sentence', () => {
		const result = computeSpeakerDelay(example1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(formatDelayCopy(result)).toBe(
			'Delay path B 29.1 ms (geometric) at 20 °C. Farther path is path A. Verify with IR at the seat.',
		);
	});

	it('samples at 48 kHz come from the unrounded product, not from rounded 29.1', () => {
		const result = computeSpeakerDelay(example1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.samples).toBeCloseTo((DELAY_MS_EXAMPLE1 * 48000) / 1000, 12);
		expect(result.samples).not.toBe((29.1 * 48000) / 1000);
		expect(result.nearestSample).toBe(Math.round(result.samples));
	});

	it('delays the closer (earlier) path, not the later one', () => {
		const result = computeSpeakerDelay(example1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.pathB_m).toBeLessThan(result.pathA_m);
		expect(result.delayChannel).toBe('B');
		expect(result.delayChannel).not.toBe('A');
	});
});

describe('Example 1 + front-fill Haas 8 ms', () => {
	it('adds Haas to the already-chosen channel and displays 37.1 ms', () => {
		const geometric = computeSpeakerDelay(example1);
		const result = computeSpeakerDelay({ ...example1, haasMs: 8 });
		expect(geometric.ok && result.ok).toBe(true);
		if (!geometric.ok || !result.ok) return;
		expect(result.delayChannel).toBe(geometric.delayChannel);
		expect(result.delayChannel).toBe('B');
		expect(result.t_set).toBeCloseTo(geometric.t_set + 8, 12);
		expect(formatDelayMsDisplay(result.t_set)).toBe('37.1');
		expect(formatDelayCopy(result)).toBe(
			'Delay path B 37.1 ms (geometric 29.1 ms + Haas 8 ms) at 20 °C. Farther path is path A. Verify with IR at the seat.',
		);
	});
});

describe('which-channel: path swap and latency flip', () => {
	it('swapping A and B keeps magnitude and flips the channel', () => {
		const ab = computeSpeakerDelay(example1);
		const ba = computeSpeakerDelay({ ...example1, pathA: 20, pathB: 30 });
		expect(ab.ok && ba.ok).toBe(true);
		if (!ab.ok || !ba.ok) return;
		expect(Math.abs(ba.t_set - ab.t_set)).toBeLessThan(EPS);
		expect(ab.delayChannel).toBe('B');
		expect(ba.delayChannel).toBe('A');
		expect(ab.t_set).toBeGreaterThanOrEqual(0);
		expect(ba.t_set).toBeGreaterThanOrEqual(0);
	});

	it('latency can flip which channel is earlier', () => {
		const base = computeSpeakerDelay(example1);
		const flipped = computeSpeakerDelay({ ...example1, latencyBMs: 80 });
		expect(base.ok && flipped.ok).toBe(true);
		if (!base.ok || !flipped.ok) return;
		expect(base.delayChannel).toBe('B');
		expect(flipped.delayChannel).toBe('A');
		const c = 343.3;
		const tA = 30 / c;
		const tB = 20 / c + 80 / 1000;
		expect(flipped.t_set).toBeCloseTo(1000 * Math.abs(tA - tB), 12);
		expect(flipped.t_set).toBeGreaterThanOrEqual(0);
	});

	it('equal paths yield zero delay', () => {
		const result = computeSpeakerDelay({ ...example1, pathA: 20, pathB: 20 });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.t_set).toBe(0);
		expect(result.delayChannel).toBe('none');
	});

	it('never returns a negative t_set', () => {
		const cases: SpeakerDelayInput[] = [
			example1,
			{ ...example1, pathA: 20, pathB: 30 },
			{ ...example1, pathA: 0.5, pathB: 100 },
			{ ...example1, haasMs: 8 },
			{ ...example1, latencyBMs: 80 },
		];
		for (const input of cases) {
			const result = computeSpeakerDelay(input);
			expect(result.ok).toBe(true);
			if (!result.ok) continue;
			expect(result.t_set).toBeGreaterThanOrEqual(0);
			expect(result.arrivalDelay_ms).toBeGreaterThanOrEqual(0);
		}
	});
});

describe('unit conversion', () => {
	it('treats metres and feet of the same paths as the same delay', () => {
		const meters = computeSpeakerDelay(example1);
		const feet = computeSpeakerDelay({
			...example1,
			pathA: 30 / 0.3048,
			pathB: 20 / 0.3048,
			lengthUnit: 'ft',
		});
		expect(meters.ok && feet.ok).toBe(true);
		if (!meters.ok || !feet.ok) return;
		expect(feet.pathA_m).toBeCloseTo(meters.pathA_m, 12);
		expect(feet.t_set).toBeCloseTo(meters.t_set, 12);
	});

	it('treats inches via 1 in = 0.0254 m', () => {
		const result = computeSpeakerDelay({
			...example1,
			pathA: 30 / 0.0254,
			pathB: 20 / 0.0254,
			lengthUnit: 'in',
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.pathA_m).toBeCloseTo(30, 12);
		expect(result.delay_ms).toBeCloseTo(DELAY_MS_EXAMPLE1, 12);
	});
});

describe('temperature °C vs °F', () => {
	it('68 °F equals 20 °C', () => {
		expect(temperatureToCelsius(68, 'F')).toBe(20);
		const celsius = computeSpeakerDelay(example1);
		const fahrenheit = computeSpeakerDelay({
			...example1,
			temperature: 68,
			temperatureUnit: 'F',
		});
		expect(celsius.ok && fahrenheit.ok).toBe(true);
		if (!celsius.ok || !fahrenheit.ok) return;
		expect(fahrenheit.c_m_s).toBeCloseTo(celsius.c_m_s, 12);
		expect(fahrenheit.t_set).toBeCloseTo(celsius.t_set, 12);
	});
});

describe('invalid speaker-delay inputs', () => {
	it('rejects empty-equivalent non-finite values without NaN outputs', () => {
		const result = computeSpeakerDelay({ ...example1, pathA: Number.NaN });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors.length).toBeGreaterThan(0);
		expect(JSON.stringify(result)).not.toMatch(/NaN/);
	});

	it('rejects negative and zero path lengths', () => {
		expect(computeSpeakerDelay({ ...example1, pathA: 0 }).ok).toBe(false);
		expect(computeSpeakerDelay({ ...example1, pathA: -30 }).ok).toBe(false);
		expect(computeSpeakerDelay({ ...example1, pathB: -1 }).ok).toBe(false);
	});

	it('rejects extreme path lengths and temperatures', () => {
		expect(computeSpeakerDelay({ ...example1, pathA: 1e9 }).ok).toBe(false);
		expect(computeSpeakerDelay({ ...example1, temperature: 200 }).ok).toBe(false);
		expect(computeSpeakerDelay({ ...example1, temperature: -80 }).ok).toBe(false);
	});

	it('rejects sample rates other than 44.1 / 48 / 96 kHz', () => {
		expect(computeSpeakerDelay({ ...example1, sampleRate: 100 }).ok).toBe(false);
		expect(computeSpeakerDelay({ ...example1, sampleRate: 192000 }).ok).toBe(false);
	});

	it('rejects negative Haas extra', () => {
		const result = computeSpeakerDelay({ ...example1, haasMs: -5 });
		expect(result.ok).toBe(false);
	});
});

describe('parse helpers used by the forms', () => {
	it('flags empty and invalid strings', () => {
		expect(parseFiniteNumber('').reason).toBe('empty');
		expect(parseFiniteNumber('   ').reason).toBe('empty');
		expect(parseFiniteNumber('12m').ok).toBe(false);
		expect(parseFiniteNumber('abc').ok).toBe(false);
		expect(parseFiniteNumber('NaN').ok).toBe(false);
		expect(parseFiniteNumber('Infinity').ok).toBe(false);
	});

	it('parses decimals and optional blanks', () => {
		expect(parseFiniteNumber('12.5')).toEqual({ ok: true, value: 12.5 });
		expect(parseOptionalFiniteNumber('')).toEqual({ ok: true, value: null });
		expect(parseInteger('22')).toEqual({ ok: true, value: 22 });
		expect(parseInteger('22.1').ok).toBe(false);
	});
});

describe('length helpers', () => {
	it('converts feet and inches to meters without rounding', () => {
		expect(lengthToMeters(1, 'ft')).toBe(0.3048);
		expect(lengthToMeters(1, 'in')).toBe(0.0254);
	});
});
