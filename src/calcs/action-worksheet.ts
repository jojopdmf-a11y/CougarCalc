/**
 * Action worksheet. Named fret is required.
 * Fender support-guide 17th-fret electric ranges by radius — guide, not hard rules.
 * 6/64·4/64 is not an electric 17th pair. Acoustic 6/64·5/64 is the 14th-fret chart.
 * No closed-form saddle height.
 */

import { convertScale } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type ActionUnit = 'in' | 'mm';

export const FENDER_SUPPORT_GUIDE_URL =
	'https://support.fender.com/hc/en-us/articles/42507226762651-What-are-factory-setup-specs';

export const FENDER_SUPPORT_GUIDE_LABEL =
	'Fender support guide — factory setup specs (17th-fret electric by radius). Guide, not hard rules.';

export type FenderGuideRow = {
	id: string;
	instrument: 'electric' | 'acoustic';
	fret: number;
	radiusLabel: string;
	bassIn: number;
	trebleIn: number;
	reliefIn: number | null;
	label: string;
};

/** Electric 17th-fret starting heights by radius. Acoustic 14th is a different chart. */
export const FENDER_GUIDE_ROWS: readonly FenderGuideRow[] = [
	{
		id: 'electric-725',
		instrument: 'electric',
		fret: 17,
		radiusLabel: '7.25″',
		bassIn: 5 / 64,
		trebleIn: 4 / 64,
		reliefIn: 0.012,
		label: 'Electric 17th · 7.25″ · 5/64 · 4/64 (relief .012″ companion)',
	},
	{
		id: 'electric-95-12',
		instrument: 'electric',
		fret: 17,
		radiusLabel: '9.5–12″',
		bassIn: 4 / 64,
		trebleIn: 4 / 64,
		reliefIn: null,
		label: 'Electric 17th · 9.5–12″ · 4/64 · 4/64',
	},
	{
		id: 'electric-15-17',
		instrument: 'electric',
		fret: 17,
		radiusLabel: '15–17″',
		bassIn: 4 / 64,
		trebleIn: 3 / 64,
		reliefIn: null,
		label: 'Electric 17th · 15–17″ · 4/64 · 3/64',
	},
	{
		id: 'acoustic-14',
		instrument: 'acoustic',
		fret: 14,
		radiusLabel: 'acoustic chart',
		bassIn: 6 / 64,
		trebleIn: 5 / 64,
		reliefIn: null,
		label: 'Acoustic 14th · 6/64 · 5/64 (not the electric 17th)',
	},
];

export const FENDER_ELECTRIC_17TH = FENDER_GUIDE_ROWS.filter((r) => r.instrument === 'electric');
export const FENDER_ACOUSTIC_14TH = FENDER_GUIDE_ROWS.find((r) => r.id === 'acoustic-14')!;

export type ActionInput = {
	fretNumber: number;
	bass: number;
	treble: number;
	unit: ActionUnit;
};

export type ActionSuccess = {
	ok: true;
	fretNumber: number;
	bass: number;
	treble: number;
	unit: ActionUnit;
	bassIn: number;
	trebleIn: number;
	matchedGuide: FenderGuideRow | null;
	mislabelNote: string | null;
};

export type ActionResult = ActionSuccess | CalcFailure;

function sameHeight(a: number, b: number): boolean {
	return Math.abs(a - b) < 1e-12;
}

export function matchFenderGuide(fretNumber: number, bassIn: number, trebleIn: number): FenderGuideRow | null {
	return (
		FENDER_GUIDE_ROWS.find(
			(row) => row.fret === fretNumber && sameHeight(row.bassIn, bassIn) && sameHeight(row.trebleIn, trebleIn),
		) ?? null
	);
}

/** 6/64 · 4/64 is not a Fender electric 17th guide pair. */
export function isDroppedElectric64Pair(bassIn: number, trebleIn: number): boolean {
	return sameHeight(bassIn, 6 / 64) && sameHeight(trebleIn, 4 / 64);
}

export function computeActionWorksheet(input: ActionInput): ActionResult {
	const errors: FieldError[] = [];
	if (!Number.isInteger(input.fretNumber) || input.fretNumber < 1) {
		errors.push({
			field: 'fretNumber',
			message: 'A named fret is required. Enter a whole number ≥ 1.',
		});
	}
	if (!Number.isFinite(input.bass) || input.bass <= 0) {
		errors.push({ field: 'bass', message: 'Bass-side action must be greater than zero.' });
	}
	if (!Number.isFinite(input.treble) || input.treble <= 0) {
		errors.push({ field: 'treble', message: 'Treble-side action must be greater than zero.' });
	}
	if (errors.length) return fail(errors);

	const bassIn = convertScale(input.bass, input.unit, 'in');
	const trebleIn = convertScale(input.treble, input.unit, 'in');
	const matchedGuide = matchFenderGuide(input.fretNumber, bassIn, trebleIn);

	let mislabelNote: string | null = null;
	if (isDroppedElectric64Pair(bassIn, trebleIn) && input.fretNumber === 17) {
		mislabelNote =
			'6/64 · 4/64 is not a Fender electric 17th guide pair. Acoustic 6/64 · 5/64 is the 14th-fret chart.';
	} else if (sameHeight(bassIn, 6 / 64) && sameHeight(trebleIn, 5 / 64) && input.fretNumber === 17) {
		mislabelNote = 'Acoustic 6/64 · 5/64 belongs at the 14th fret. Do not label it as an electric 17th.';
	}

	return {
		ok: true,
		fretNumber: input.fretNumber,
		bass: input.bass,
		treble: input.treble,
		unit: input.unit,
		bassIn,
		trebleIn,
		matchedGuide,
		mislabelNote,
	};
}

export function formatActionCopy(result: ActionSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	const guide = result.matchedGuide
		? ` Matches ${result.matchedGuide.label} — guide, not hard rules.`
		: ' Starting ranges are a guide, not hard rules.';
	const warn = result.mislabelNote ? ` ${result.mislabelNote}` : '';
	return `Action at fret ${result.fretNumber}: bass ${formatFixed(result.bass, digits)} ${result.unit}, treble ${formatFixed(result.treble, digits)} ${result.unit}.${guide}${warn} No saddle-height formula.`;
}
