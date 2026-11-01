/**
 * Nut height / first-fret action — measurement aid.
 * Method is required: MusicNomad open@1st or StewMac TS331 press@3rd.
 * No invented 0.012–0.024 window. Not a Fender factory spec. Not a filing recipe.
 */

import { convertScale } from './units.ts';
import { fail, type CalcFailure } from './types.ts';
import { formatFixed } from './format.ts';

export type NutHeightUnit = 'in' | 'mm';
export type NutMethod = 'open-1st' | 'press-3rd';

export const MUSICNOMAD_GUIDE_URL = 'https://musicnomadcare.com/guides/the-complete-guide-to-guitar-nut-height/';

export const MUSICNOMAD_OPEN_1ST = {
	method: 'open-1st' as const,
	label: 'MusicNomad open@1st (electric/acoustic)',
	source: 'MusicNomad — The Complete Guide to Guitar Nut Height (open string at the 1st fret). Not a Fender factory spec.',
	url: MUSICNOMAD_GUIDE_URL,
	standard: [
		{ names: 'E/A', heightIn: 0.02 },
		{ names: 'D/G', heightIn: 0.018 },
		{ names: 'B/e', heightIn: 0.016 },
	],
	heavy: [
		{ names: 'E/A', heightIn: 0.022 },
		{ names: 'D/G', heightIn: 0.02 },
		{ names: 'B/e', heightIn: 0.018 },
	],
};

export const STEWMAC_TS331_PRESS_3RD = {
	method: 'press-3rd' as const,
	label: 'StewMac TS331 press@3rd',
	source: 'StewMac TS331 press-at-3rd shop clearances, bass → treble. Not a Fender factory spec. One swipe can ruin a slot.',
	heightsIn: [0.025, 0.022, 0.02, 0.016, 0.014, 0.011] as const,
};

export type NutHeightInput = {
	method: NutMethod;
	firstFretAction: number;
	unit: NutHeightUnit;
	fretCrownIn?: number | null;
};

export type NutHeightSuccess = {
	ok: true;
	method: NutMethod;
	methodLabel: string;
	sourceLabel: string;
	firstFretAction: number;
	unit: NutHeightUnit;
	firstFretIn: number;
	nutSlotVsFret: number | null;
	comparisonNote: string;
};

export type NutHeightResult = NutHeightSuccess | CalcFailure;

export function methodMeta(method: NutMethod) {
	return method === 'open-1st' ? MUSICNOMAD_OPEN_1ST : STEWMAC_TS331_PRESS_3RD;
}

export function computeNutHeight(input: NutHeightInput): NutHeightResult {
	if (input.method !== 'open-1st' && input.method !== 'press-3rd') {
		return fail([
			{
				field: 'method',
				message: 'Choose a measurement method: MusicNomad open@1st or StewMac TS331 press@3rd.',
			},
		]);
	}
	if (!Number.isFinite(input.firstFretAction) || input.firstFretAction <= 0) {
		return fail([{ field: 'firstFretAction', message: 'Measured height must be greater than zero.' }]);
	}
	if (input.fretCrownIn !== undefined && input.fretCrownIn !== null && (!Number.isFinite(input.fretCrownIn) || input.fretCrownIn < 0)) {
		return fail([{ field: 'fretCrownIn', message: 'Fret crown must be ≥ 0, or left empty. This is not a filing procedure.' }]);
	}

	const firstFretIn = convertScale(input.firstFretAction, input.unit, 'in');
	const nutSlotVsFret =
		input.fretCrownIn === undefined || input.fretCrownIn === null ? null : firstFretIn + input.fretCrownIn;
	const meta = methodMeta(input.method);
	const comparisonNote =
		input.method === 'open-1st'
			? 'MusicNomad open@1st labeled heights: E/A 0.020″, D/G 0.018″, B/e 0.016″ (heavy attack 0.022 / 0.020 / 0.018). Shop source, not a Fender factory spec.'
			: 'StewMac TS331 press@3rd labeled clearances bass→treble: .025 / .022 / .020 / .016 / .014 / .011 in. Shop source, not a Fender factory spec.';

	return {
		ok: true,
		method: input.method,
		methodLabel: meta.label,
		sourceLabel: meta.source,
		firstFretAction: input.firstFretAction,
		unit: input.unit,
		firstFretIn,
		nutSlotVsFret,
		comparisonNote,
	};
}

export function formatNutHeightCopy(result: NutHeightSuccess): string {
	const digits = result.unit === 'in' ? 3 : 2;
	return `Measured ${formatFixed(result.firstFretAction, digits)} ${result.unit} (${result.methodLabel}). ${result.comparisonNote} Measurement aid only — not a filing procedure. One swipe can ruin a slot.`;
}
