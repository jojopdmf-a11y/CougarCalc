import { describe, expect, it } from 'vitest';
import {
	computeFretPositions,
	DEFAULT_FRET_COUNT,
	FENDER_SCALE_IN,
	formatFretCopy,
	formatScaleDisplay,
	MAX_FRET_COUNT,
	METRIC_650_MM,
	MIN_FRET_COUNT,
	ruleOf18DistanceFromNut,
	tetDistanceFromNut,
} from './fret-position.ts';
import { MM_PER_INCH } from './units.ts';

describe('12-TET formula', () => {
	it('d(n) = S * (1 - 1 / 2^(n/12)) with no intermediate rounding', () => {
		for (const n of [1, 3, 5, 7, 12, 19, 22, 24]) {
			expect(tetDistanceFromNut(FENDER_SCALE_IN, n)).toBe(
				FENDER_SCALE_IN * (1 - 1 / 2 ** (n / 12)),
			);
		}
	});

	it('d(12) equals S/2 exactly: 25.500 in → 12.750 in Pass', () => {
		expect(tetDistanceFromNut(25.5, 12)).toBe(25.5 / 2);
		expect(tetDistanceFromNut(25.5, 12)).toBe(12.75);
		expect(formatScaleDisplay(25.5, 'in')).toBe('25.500');
		expect(formatScaleDisplay(12.75, 'in')).toBe('12.750');

		const result = computeFretPositions({
			scale: 25.5,
			scaleUnit: 'in',
			fretCount: 22,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.twelfthFret).toBe(12.75);
		expect(result.halfScale).toBe(12.75);
		expect(result.twelfthEqualsHalf).toBe(true);
		expect(result.fretCount).toBe(DEFAULT_FRET_COUNT);
		expect(formatFretCopy(result)).toContain('12.750');
		expect(formatFretCopy(result)).toContain('Pass');
	});

	it('650 mm is not 25.5 in; d(12) = 325 mm Pass', () => {
		expect(METRIC_650_MM).not.toBe(FENDER_SCALE_IN * MM_PER_INCH);
		expect(formatScaleDisplay(FENDER_SCALE_IN * MM_PER_INCH, 'mm')).toBe('647.70');
		const result = computeFretPositions({
			scale: METRIC_650_MM,
			scaleUnit: 'mm',
			fretCount: 22,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.twelfthFret).toBe(325);
		expect(result.halfScale).toBe(325);
		expect(result.twelfthEqualsHalf).toBe(true);
		expect(formatScaleDisplay(result.twelfthFret, 'mm')).toBe('325.00');
	});

	it('Rule of 18 is a different closed form, not 12-TET', () => {
		const tet12 = tetDistanceFromNut(FENDER_SCALE_IN, 12);
		const r18 = ruleOf18DistanceFromNut(FENDER_SCALE_IN, 12);
		expect(r18).not.toBe(tet12);
	});

	it('rejects out-of-range fret counts and scale lengths', () => {
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: MIN_FRET_COUNT - 1 }).ok).toBe(false);
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: MAX_FRET_COUNT + 1 }).ok).toBe(false);
		expect(computeFretPositions({ scale: 1, scaleUnit: 'in' }).ok).toBe(false);
	});
});
