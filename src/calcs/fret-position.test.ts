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
		expect(result.twelfthCheck).toBe('Pass');
		expect(formatFretCopy(result)).toBe(
			'25.500 in scale, 22 frets, 12-TET from nut. 12th fret 12.750 in = S/2. Theoretical locations; verify before sawing.',
		);
	});
});

describe('650 mm is not 25.5 in', () => {
	it('25.500 × 25.4 = 647.7 mm, so 650 mm is a different scale', () => {
		expect(MM_PER_INCH).toBe(25.4);
		expect((25.5 * 25.4).toFixed(1)).toBe('647.7');
		expect(METRIC_650_MM).not.toBe(25.5 * 25.4);

		const imperial = computeFretPositions({ scale: 25.5, scaleUnit: 'in', outputUnit: 'mm', fretCount: 12 });
		const metric = computeFretPositions({ scale: 650, scaleUnit: 'mm', fretCount: 12 });
		expect(imperial.ok && metric.ok).toBe(true);
		if (!imperial.ok || !metric.ok) return;
		expect(imperial.scale).toBe(25.5 * 25.4);
		expect(metric.scale).toBe(650);
		expect(metric.twelfthFret).toBe(325);
		expect(imperial.twelfthFret).toBe((25.5 * 25.4) / 2);
		expect(metric.twelfthFret).not.toBe(imperial.twelfthFret);
	});
});

describe('worked example frets besides the 12th', () => {
	it('matches formula values for several frets', () => {
		const result = computeFretPositions({
			scale: 25.5,
			scaleUnit: 'in',
			fretCount: 22,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		const at = (n: number) => result.rows.find((row) => row.fret === n)?.distanceFromNut;
		expect(at(1)).toBe(25.5 * (1 - 1 / 2 ** (1 / 12)));
		expect(at(5)).toBe(25.5 * (1 - 1 / 2 ** (5 / 12)));
		expect(at(7)).toBe(25.5 * (1 - 1 / 2 ** (7 / 12)));
		expect(at(19)).toBe(25.5 * (1 - 1 / 2 ** (19 / 12)));
	});

	it('fret-to-fret is the difference of consecutive nut distances', () => {
		const result = computeFretPositions({
			scale: 25.5,
			scaleUnit: 'in',
			fretCount: 3,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.rows[0].fretToFret).toBe(result.rows[0].distanceFromNut);
		expect(result.rows[1].fretToFret).toBe(result.rows[1].distanceFromNut - result.rows[0].distanceFromNut);
	});
});

describe('inch / mm conversion', () => {
	it('uses 1 in = 25.4 mm as a conversion', () => {
		const inches = computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: 12 });
		const mm = computeFretPositions({
			scale: 25.5 * MM_PER_INCH,
			scaleUnit: 'mm',
			fretCount: 12,
		});
		expect(inches.ok && mm.ok).toBe(true);
		if (!inches.ok || !mm.ok) return;
		expect(mm.scale).toBe(25.5 * 25.4);
		expect(mm.twelfthFret).toBe((25.5 * 25.4) / 2);
		expect((25.5 * 25.4).toFixed(1)).toBe('647.7');
	});
});

describe('fret count N', () => {
	it('defaults to 22', () => {
		const result = computeFretPositions({ scale: 25.5, scaleUnit: 'in' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.fretCount).toBe(DEFAULT_FRET_COUNT);
		expect(result.fretCount).toBe(22);
		expect(result.rows).toHaveLength(22);
	});

	it('supports several N including 1, 19, 21, 22, 24, 36', () => {
		for (const n of [1, 12, 19, 21, 22, 24, 36]) {
			const result = computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: n });
			expect(result.ok).toBe(true);
			if (!result.ok) continue;
			expect(result.rows).toHaveLength(n);
			expect(result.rows[n - 1].fret).toBe(n);
		}
	});

	it('still reports d(12)=S/2 when N < 12', () => {
		const result = computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: 5 });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.rows).toHaveLength(5);
		expect(result.twelfthFret).toBe(12.75);
		expect(result.twelfthCheck).toBe('Pass');
	});
});

describe('Rule of 18 helper (not in the UI)', () => {
	it('first fret is S/18', () => {
		expect(ruleOf18DistanceFromNut(25.5, 1)).toBe(25.5 / 18);
	});
});

describe('invalid fret inputs', () => {
	it('rejects empty-equivalent non-finite scale without NaN in the payload', () => {
		const result = computeFretPositions({ scale: Number.NaN, scaleUnit: 'in' });
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(JSON.stringify(result)).not.toMatch(/NaN/);
	});

	it('rejects zero and negative scale', () => {
		expect(computeFretPositions({ scale: 0, scaleUnit: 'in' }).ok).toBe(false);
		expect(computeFretPositions({ scale: -25.5, scaleUnit: 'in' }).ok).toBe(false);
	});

	it('rejects extreme scale lengths', () => {
		expect(computeFretPositions({ scale: 0.1, scaleUnit: 'in' }).ok).toBe(false);
		expect(computeFretPositions({ scale: 400, scaleUnit: 'in' }).ok).toBe(false);
		expect(computeFretPositions({ scale: 1, scaleUnit: 'mm' }).ok).toBe(false);
	});

	it('rejects out-of-range and non-integer N', () => {
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: 0 }).ok).toBe(false);
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: MIN_FRET_COUNT - 1 }).ok).toBe(
			false,
		);
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: MAX_FRET_COUNT + 1 }).ok).toBe(
			false,
		);
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: 12.5 }).ok).toBe(false);
		expect(computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: Number.NaN }).ok).toBe(false);
	});
});
