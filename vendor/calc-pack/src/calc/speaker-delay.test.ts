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

describe('speed of sound', () => {
	it('uses Sengpiel simplified 331.3 + 0.6×T_C, not AudioCalcs 1086+1.08×T_F', () => {
		expect(speedOfSoundSengpiel(0)).toBe(331.3);
		expect(speedOfSoundSengpiel(20)).toBe(343.3);
		expect(C_20).toBe(343.3);
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
		expect(result.delay_ms).toBe(DELAY_MS_EXAMPLE1);
		expect(result.delay_ms).toBe(10000 / 343.3);
		expect(result.t_set).toBe(result.delay_ms);
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

	it('samples at 48 kHz come from full precision, not from rounded 29.1', () => {
		const result = computeSpeakerDelay(example1);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.samples).toBe((DELAY_MS_EXAMPLE1 * 48000) / 1000);
		expect(result.samples).not.toBe((29.1 * 48000) / 1000);
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
	it('adds 8 ms on path B and displays 37.1 ms', () => {
		const result = computeSpeakerDelay({ ...example1, haasMs: 8 });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.t_set).toBe(DELAY_MS_EXAMPLE1 + 8);
		expect(result.delayChannel).toBe('B');
		expect(formatDelayMsDisplay(result.t_set)).toBe('37.1');
		expect(formatDelayCopy(result)).toBe(
			'Delay path B 37.1 ms (geometric 29.1 ms + Haas 8 ms) at 20 °C. Farther path is path A. Verify with IR at the seat.',
		);
	});
});

describe('two paths and never-negative delay', () => {
	it('swapping A and B keeps t_set and flips the channel', () => {
		const ab = computeSpeakerDelay(example1);
		const ba = computeSpeakerDelay({ ...example1, pathA: 20, pathB: 30 });
		expect(ab.ok && ba.ok).toBe(true);
		if (!ab.ok || !ba.ok) return;
		expect(ba.t_set).toBe(ab.t_set);
		expect(ab.delayChannel).toBe('B');
		expect(ba.delayChannel).toBe('A');
		expect(ab.t_set).toBeGreaterThanOrEqual(0);
		expect(ba.t_set).toBeGreaterThanOrEqual(0);
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
		expect(fahrenheit.c_m_s).toBe(celsius.c_m_s);
		expect(fahrenheit.t_set).toBe(celsius.t_set);
	});
});

describe('latency and overshoot', () => {
	it('t_set = delay_ms + t_Haas − t_lat_early + t_lat_late', () => {
		const result = computeSpeakerDelay({
			...example1,
			haasMs: 8,
			latencyBMs: 2,
			latencyAMs: 1,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.delayChannel).toBe('B');
		expect(result.t_lat_early).toBe(2);
		expect(result.t_lat_late).toBe(1);
		expect(result.t_set).toBe(result.delay_ms + 8 - 2 + 1);
	});

	it('does not add geometric delay when existing latency overshoots', () => {
		const result = computeSpeakerDelay({
			...example1,
			latencyBMs: 80,
			haasMs: 0,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.latencyOvershoot).toBe(true);
		expect(result.t_geo_applied).toBe(0);
		expect(result.t_set).toBe(0);
		expect(result.t_set).toBeGreaterThanOrEqual(0);
		expect(formatDelayCopy(result)).toMatch(/overshoots geometry/i);
	});

	it('still adds Haas after an overshoot as a separate choice', () => {
		const result = computeSpeakerDelay({
			...example1,
			latencyBMs: 80,
			haasMs: 8,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.latencyOvershoot).toBe(true);
		expect(result.t_geo_applied).toBe(0);
		expect(result.t_set).toBe(8);
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
