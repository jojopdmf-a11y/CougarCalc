import { describe, expect, it } from 'vitest';
import {
	DADDARIO_LIVE_PDF_REFUSAL,
	DADDARIO_WAYBACK_SOURCE,
	computeStringTension,
	isLiveDaddarioPdfUrl,
	lookupDaddarioItem,
	tensionLbfFromUw,
	tensionSi,
	muFromUw,
	UNIT_WEIGHT_TABLE,
} from './string-tension.ts';
import { computeNutSpacing } from './nut-spacing.ts';
import { computeActionWorksheet, FENDER_ELECTRIC_17TH } from './action-worksheet.ts';
import { computePickupPoles, DUNCAN_HUMBUCKER_IN, DUNCAN_TREMBUCKER_IN } from './pickup-poles.ts';
import { computeBridgePlacement } from './bridge-placement.ts';
import { computeScaleCompare } from './scale-compare.ts';
import { computeSaddleCompensation, mottolaN, mottolaDisplacement } from './saddle-compensation.ts';
import { computeStringSet } from './string-set.ts';
import { computeNutHeight, MUSICNOMAD_OPEN_1ST, STEWMAC_TS331_PRESS_3RD } from './nut-height.ts';
import { computeFretboardRadius, sagittaFromRadius, radiusFromSagitta, hartsteinRx } from './fretboard-radius.ts';
import { computeNeckTaper, interpolateWidth } from './neck-taper.ts';
import { MM_PER_INCH } from './units.ts';

const E4 = 329.627557;
const E4_CHART = 329.6;

describe('string-tension Example 1: archived PL010, 25.500 in, e′ 329.6 Hz', () => {
	it('matches T = (UW×(2LF)²)/386.4 and the SI form; spot-check 16.2 lbf', () => {
		const uw = 0.00002215;
		expect(lookupDaddarioItem('PL010')?.uwLbPerIn).toBe(uw);
		const result = computeStringTension({
			scale: 25.5,
			scaleUnit: 'in',
			frequencyHz: E4_CHART,
			uwLbPerIn: null,
			tableId: 'PL010',
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.uwLbPerIn).toBe(uw);
		expect(result.uwKind).toBe('daddario-wayback');
		expect(result.uwSource).toBe(DADDARIO_WAYBACK_SOURCE);
		expect(result.item).toBe('PL010');
		expect(result.tensionLbf).toBeCloseTo(tensionLbfFromUw(uw, 25.5, E4_CHART), 12);
		expect(result.tensionLbf).toBeCloseTo(16.2, 1);
		const si = tensionSi(muFromUw(uw), 25.5 * 0.0254, E4_CHART);
		expect(result.tensionSiN).toBeCloseTo(si, 8);
		expect(UNIT_WEIGHT_TABLE.every((r) => r.source === DADDARIO_WAYBACK_SOURCE)).toBe(true);
		expect(UNIT_WEIGHT_TABLE.some((r) => /ghs/i.test(r.id))).toBe(false);
	});

	it('ships the cited EXL110 and NW018 cells only', () => {
		expect(lookupDaddarioItem('PL013')?.uwLbPerIn).toBe(0.00003744);
		expect(lookupDaddarioItem('PL017')?.uwLbPerIn).toBe(0.00006402);
		expect(lookupDaddarioItem('NW018')?.uwLbPerIn).toBe(0.00006215);
		expect(lookupDaddarioItem('NW026')?.uwLbPerIn).toBe(0.00012671);
		expect(lookupDaddarioItem('NW036')?.uwLbPerIn).toBe(0.00023964);
		expect(lookupDaddarioItem('NW046')?.uwLbPerIn).toBe(0.00038216);
	});

	it('still accepts a user-cited UW without an Item#', () => {
		const result = computeStringTension({
			scale: 25.5,
			scaleUnit: 'in',
			frequencyHz: E4_CHART,
			uwLbPerIn: 0.00002215,
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.uwKind).toBe('user');
		expect(result.item).toBeNull();
	});

	it('fails closed when UW is missing', () => {
		const result = computeStringTension({
			scale: 25.5,
			scaleUnit: 'in',
			frequencyHz: E4,
			uwLbPerIn: null,
		});
		expect(result.ok).toBe(false);
	});

	it('fails closed on an unknown Item# instead of inventing mass from gauge', () => {
		const result = computeStringTension({
			scale: 25.5,
			scaleUnit: 'in',
			frequencyHz: E4,
			uwLbPerIn: 0.00002215,
			tableId: 'invented-from-gauge-010',
		});
		expect(result.ok).toBe(false);
		expect(UNIT_WEIGHT_TABLE.some((r) => r.id.includes('gauge'))).toBe(false);
	});

	it('fails closed on the live daddario.com tension PDF', () => {
		const live = 'https://www.daddario.com/globalassets/inriver/resources/tension_chart.pdf';
		expect(isLiveDaddarioPdfUrl(live)).toBe(true);
		const result = computeStringTension({
			scale: 25.5,
			scaleUnit: 'in',
			frequencyHz: E4_CHART,
			uwLbPerIn: null,
			tableId: 'PL010',
			sourceUrl: live,
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.errors[0].message).toBe(DADDARIO_LIVE_PDF_REFUSAL);
	});
});

describe('nut-spacing Example 1: 6-string 1.406 in E-to-E, 10–46', () => {
	it('equal remaining gap between edges; centers from half-gauges + gaps', () => {
		const gauges = [0.01, 0.013, 0.017, 0.026, 0.036, 0.046];
		const eToE = 1.406;
		const result = computeNutSpacing({ eToE, unit: 'in', gauges, gaugeUnit: 'in' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.centers[0]).toBe(0);
		expect(result.centers[5]).toBeCloseTo(eToE, 12);
		expect(result.gap).toBeGreaterThan(0);
		const step = result.centers[1] - result.centers[0];
		expect(step).toBeCloseTo(gauges[0] / 2 + result.gap + gauges[1] / 2, 12);
	});
});

describe('action-worksheet Example 1: 17th fret 7.25″ 5/64 · 4/64', () => {
	it('requires a named fret and matches the 7.25″ electric guide, not 6/64 · 4/64', () => {
		const guide = FENDER_ELECTRIC_17TH[0];
		const result = computeActionWorksheet({
			fretNumber: 17,
			bass: 5 / 64,
			treble: 4 / 64,
			unit: 'in',
		});
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.matchedGuide?.id).toBe(guide.id);
		expect(result.bassIn).toBeCloseTo(5 / 64, 12);
		expect(result.trebleIn).toBeCloseTo(4 / 64, 12);
		expect(result.matchedGuide?.reliefIn).toBe(0.012);
		const dropped = computeActionWorksheet({ fretNumber: 17, bass: 6 / 64, treble: 4 / 64, unit: 'in' });
		expect(dropped.ok && dropped.matchedGuide).toBeNull();
		expect(dropped.ok && dropped.mislabelNote).toMatch(/not a Fender electric 17th/i);
		const acoustic = computeActionWorksheet({ fretNumber: 14, bass: 6 / 64, treble: 5 / 64, unit: 'in' });
		expect(acoustic.ok && acoustic.matchedGuide?.instrument).toBe('acoustic');
		const acousticOn17 = computeActionWorksheet({ fretNumber: 17, bass: 6 / 64, treble: 5 / 64, unit: 'in' });
		expect(acousticOn17.ok && acousticOn17.matchedGuide).toBeNull();
		expect(acousticOn17.ok && acousticOn17.mislabelNote).toMatch(/14th/i);
		const missing = computeActionWorksheet({ fretNumber: 0, bass: 0.1, treble: 0.1, unit: 'in' });
		expect(missing.ok).toBe(false);
		expect('saddleHeight' in (result as object)).toBe(false);
	});
});

describe('pickup-pole-spacing Example 1: Duncan 1.930 / 2.070; E-to-E > 2 in', () => {
	it('suggests Trembucker above 2 in at the bridge', () => {
		expect(DUNCAN_HUMBUCKER_IN).toBe(1.93);
		expect(DUNCAN_TREMBUCKER_IN).toBe(2.07);
		const wide = computePickupPoles({ eToE: 2.07, unit: 'in', position: 'bridge' });
		expect(wide.ok && wide.suggestion).toBe('trembucker');
		const narrow = computePickupPoles({ eToE: 1.93, unit: 'in', position: 'bridge' });
		expect(narrow.ok && narrow.suggestion).toBe('humbucker');
		expect(wide.ok && wide.dimarzioNote).toMatch(/not invented/i);
	});
});

describe('bridge-placement Example 1: S = 25.500 in, compensation 0.125 in', () => {
	it('break ≈ S and speaking ≈ S+comp along the string path', () => {
		const result = computeBridgePlacement({ scale: 25.5, compensation: 0.125, unit: 'in' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.breakLength).toBe(25.5);
		expect(result.speakingLength).toBeCloseTo(25.625, 12);
	});
});

describe('scale-length-compare Example 1: 12.750 in nut-to-12th; 25.500 ≠ 650 mm', () => {
	it('S_actual = 2×nut-to-12th and 25.500×25.4 = 647.7 mm', () => {
		const result = computeScaleCompare({ nutToTwelfth: 12.75, unit: 'in', compareId: 'metric-650' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.sActual).toBe(25.5);
		expect(result.inchTimes254).toBeCloseTo(25.5 * MM_PER_INCH, 12);
		expect(result.inchTimes254.toFixed(1)).toBe('647.7');
		expect(result.equals650).toBe(false);
		expect(result.compare?.delta).not.toBe(0);
		const unknown = computeScaleCompare({ nutToTwelfth: 12.75, unit: 'in', compareId: 'warmoth-baritone' });
		expect(unknown.ok).toBe(false);
	});
});

describe('saddle-compensation Example 1: 25.500 in, +5 cents', () => {
	it('uses Mottola n = 12+(e/100) and d = ((s−s/2^(n/12))−s/2)×2', () => {
		const s = 25.5;
		const e = 5;
		const result = computeSaddleCompensation({ scale: s, centsError: e, unit: 'in' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.n).toBeCloseTo(mottolaN(e), 12);
		expect(result.displacement).toBeCloseTo(mottolaDisplacement(s, e), 12);
		expect(result.direction).toBe('away-from-nut');
		const flat = computeSaddleCompensation({ scale: s, centsError: -5, unit: 'in' });
		expect(flat.ok && flat.direction).toBe('toward-nut');
	});
});

describe('string-set-tension Example 1: two strings, total is the sum', () => {
	it('sums Ti and never claims the neck is safe', () => {
		const result = computeStringSet([
			{ name: 'E4', scale: 25.5, scaleUnit: 'in', frequencyHz: E4_CHART, uwLbPerIn: null, tableId: 'PL010' },
			{ name: 'G3', scale: 25.5, scaleUnit: 'in', frequencyHz: 196, uwLbPerIn: null, tableId: 'NW018' },
		]);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.totalLbf).toBeCloseTo(result.strings[0].tensionLbf + result.strings[1].tensionLbf, 12);
		expect(result.strings.every((s) => s.uwKind === 'daddario-wayback')).toBe(true);
		const missing = computeStringSet([
			{ name: 'E4', scale: 25.5, scaleUnit: 'in', frequencyHz: E4, uwLbPerIn: null },
		]);
		expect(missing.ok).toBe(false);
		const unknownItem = computeStringSet([
			{ name: 'E4', scale: 25.5, scaleUnit: 'in', frequencyHz: E4_CHART, uwLbPerIn: null, tableId: 'invented-from-gauge-010' },
		]);
		expect(unknownItem.ok).toBe(false);
		const mixed = computeStringSet([
			{ name: 'E4', scale: 25.5, scaleUnit: 'in', frequencyHz: E4_CHART, uwLbPerIn: null, tableId: 'PL010' },
			{ name: 'GHS', scale: 25.5, scaleUnit: 'in', frequencyHz: 196, uwLbPerIn: null, tableId: 'ghs-boomers-010' },
		]);
		expect(mixed.ok).toBe(false);
	});
});

describe('nut-height-first-fret Example 1: MusicNomad open@1st 0.018 in', () => {
	it('requires a method and does not apply a 0.012–0.024 window', () => {
		const result = computeNutHeight({ method: 'open-1st', firstFretAction: 0.018, unit: 'in' });
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.method).toBe('open-1st');
		expect(result.firstFretIn).toBe(0.018);
		expect(result.comparisonNote).toMatch(/MusicNomad/);
		expect('inShopWindow' in result).toBe(false);
		expect(MUSICNOMAD_OPEN_1ST.standard.map((r) => r.heightIn)).toEqual([0.02, 0.018, 0.016]);
		expect(MUSICNOMAD_OPEN_1ST.heavy.map((r) => r.heightIn)).toEqual([0.022, 0.02, 0.018]);
		expect([...STEWMAC_TS331_PRESS_3RD.heightsIn]).toEqual([0.025, 0.022, 0.02, 0.016, 0.014, 0.011]);
		const press = computeNutHeight({ method: 'press-3rd', firstFretAction: 0.022, unit: 'in' });
		expect(press.ok && press.methodLabel).toMatch(/TS331/);
		const noMethod = computeNutHeight({ method: 'invented' as 'open-1st', firstFretAction: 0.018, unit: 'in' });
		expect(noMethod.ok).toBe(false);
	});
});

describe('fretboard-radius-sagitta Example 1: r = 7.25 in, l = 2.20 in', () => {
	it('s = r−√(r²−(l/2)²) and the inverse recovers r', () => {
		const r = 7.25;
		const l = 2.2;
		const s = sagittaFromRadius(r, l);
		expect(s).toBeCloseTo(r - Math.sqrt(r * r - (l / 2) ** 2), 12);
		expect(radiusFromSagitta(s, l)).toBeCloseTo(r, 10);
		const result = computeFretboardRadius({ mode: 'sagitta', radius: r, width: l, unit: 'in' });
		expect(result.ok && result.sagitta).toBeCloseTo(s, 12);
		const cone = hartsteinRx(10, 1.4, 2.1, 25.5, 12.75);
		expect(cone).toBeCloseTo(10 * (1 + (12.75 * (2.1 - 1.4)) / (25.5 * 1.4)), 12);
	});
});

describe('neck-taper-width Example 1: 1.650 in at nut, 2.062 in at 12.750 in', () => {
	it('linear interpolation between two measured stations', () => {
		const w = interpolateWidth(0, 1.65, 12.75, 2.062, 6.375);
		expect(w).toBeCloseTo((1.65 + 2.062) / 2, 12);
		const result = computeNeckTaper({ x1: 0, w1: 1.65, x2: 12.75, w2: 2.062, x: 6.375, unit: 'in' });
		expect(result.ok && result.width).toBeCloseTo(w, 12);
	});
});
