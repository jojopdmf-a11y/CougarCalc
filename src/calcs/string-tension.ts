/**
 * String tension.
 * SI: T = 4 μ L² f²  (N, kg/m, m, Hz)
 * Inch-pound chart form: T = (UW × (2 L F)²) / 386.4 lbf
 * D’Addario UW is Item# only, from the archived Catalog Supplement.
 * GHS cells are not in this table. User-cited UW is a separate path.
 * Fail closed if Item# is missing, UW is empty, or the live storefront PDF is offered.
 * No max-safe tension. Never scrape String Tension Pro.
 */

import { MM_PER_INCH } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed, formatLbf } from './format.ts';

export const DADDARIO_G = 386.4;
export const LBF_TO_NEWTON = 4.4482216152605;

export const DADDARIO_WAYBACK_SOURCE =
	'D’Addario Catalog Supplement / String Tension Specifications — Wayback 20200126233815';

export const DADDARIO_WAYBACK_URL =
	'http://web.archive.org/web/20200126233815id_/https://www.daddario.com/globalassets/pdfs/accessories/tension_chart_13934.pdf';

export const DADDARIO_LIVE_PDF_REFUSAL =
	'The live daddario.com tension PDF is unavailable and is not used. This tool fails closed on the live storefront chart. Use the archived Catalog Supplement Item# table or a cited UW.';

export type ScaleUnit = 'in' | 'mm';
export type UwSourceKind = 'daddario-wayback' | 'user';

export type UnitWeightRow = {
	id: string;
	item: string;
	label: string;
	uwLbPerIn: number;
	source: string;
	kind: 'daddario-wayback';
};

/** Archived Catalog Supplement Item# → UW (lb/in). EXL110 Regular Light plus cited NW018. */
export const UNIT_WEIGHT_TABLE: UnitWeightRow[] = [
	{ id: 'PL010', item: 'PL010', label: 'EXL110 PL010', uwLbPerIn: 0.00002215, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
	{ id: 'PL013', item: 'PL013', label: 'EXL110 PL013', uwLbPerIn: 0.00003744, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
	{ id: 'PL017', item: 'PL017', label: 'EXL110 PL017', uwLbPerIn: 0.00006402, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
	{ id: 'NW018', item: 'NW018', label: 'D’Addario NW018', uwLbPerIn: 0.00006215, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
	{ id: 'NW026', item: 'NW026', label: 'EXL110 NW026', uwLbPerIn: 0.00012671, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
	{ id: 'NW036', item: 'NW036', label: 'EXL110 NW036', uwLbPerIn: 0.00023964, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
	{ id: 'NW046', item: 'NW046', label: 'EXL110 NW046', uwLbPerIn: 0.00038216, source: DADDARIO_WAYBACK_SOURCE, kind: 'daddario-wayback' },
];

export type TensionInput = {
	scale: number;
	scaleUnit: ScaleUnit;
	frequencyHz: number;
	uwLbPerIn: number | null;
	tableId?: string;
	sourceUrl?: string;
};

export type TensionSuccess = {
	ok: true;
	uwLbPerIn: number;
	uwSource: string;
	uwKind: UwSourceKind;
	item: string | null;
	scale_in: number;
	frequencyHz: number;
	tensionLbf: number;
	tensionN: number;
	tensionSiN: number;
};

export type TensionResult = TensionSuccess | CalcFailure;

export function scaleToInches(scale: number, unit: ScaleUnit): number {
	return unit === 'in' ? scale : scale / MM_PER_INCH;
}

export function tensionLbfFromUw(uwLbPerIn: number, scaleIn: number, freqHz: number): number {
	const twoLF = 2 * scaleIn * freqHz;
	return (uwLbPerIn * twoLF * twoLF) / DADDARIO_G;
}

/** μ in kg/m from UW lb/in. */
export function muFromUw(uwLbPerIn: number): number {
	return (uwLbPerIn * 0.45359237) / 0.0254;
}

export function tensionSi(muKgPerM: number, lengthM: number, freqHz: number): number {
	return 4 * muKgPerM * lengthM * lengthM * freqHz * freqHz;
}

export function isLiveDaddarioPdfUrl(url: string): boolean {
	const lower = url.toLowerCase();
	return lower.includes('daddario.com') && lower.includes('tension_chart') && !lower.includes('web.archive.org');
}

export function lookupDaddarioItem(item: string): UnitWeightRow | undefined {
	return UNIT_WEIGHT_TABLE.find((r) => r.item === item);
}

export function resolveUw(
	input: TensionInput,
): { uw: number; source: string; kind: UwSourceKind; item: string | null } | null {
	if (input.tableId) {
		const row = lookupDaddarioItem(input.tableId);
		if (!row) return null;
		return { uw: row.uwLbPerIn, source: row.source, kind: row.kind, item: row.item };
	}
	if (input.uwLbPerIn !== null && Number.isFinite(input.uwLbPerIn) && input.uwLbPerIn > 0) {
		return { uw: input.uwLbPerIn, source: 'User-cited unit weight', kind: 'user', item: null };
	}
	return null;
}

const UW_REQUIRED =
	'Unit weight is required. Pick a cited D’Addario Item# from the archived Catalog Supplement, or enter a cited UW. Unknown Item# fails closed — no guessed mass.';

export function computeStringTension(input: TensionInput): TensionResult {
	if (input.sourceUrl && isLiveDaddarioPdfUrl(input.sourceUrl)) {
		return fail([{ field: 'sourceUrl', message: DADDARIO_LIVE_PDF_REFUSAL }]);
	}
	if (input.tableId && isLiveDaddarioPdfUrl(input.tableId)) {
		return fail([{ field: 'tableId', message: DADDARIO_LIVE_PDF_REFUSAL }]);
	}

	const errors: FieldError[] = [];
	if (!Number.isFinite(input.scale) || input.scale <= 0) {
		errors.push({ field: 'scale', message: 'Scale length must be greater than zero.' });
	}
	if (!Number.isFinite(input.frequencyHz) || input.frequencyHz <= 0) {
		errors.push({ field: 'frequencyHz', message: 'Frequency must be greater than zero.' });
	}
	const resolved = resolveUw(input);
	if (!resolved) {
		errors.push({
			field: 'uwLbPerIn',
			message: input.tableId
				? `Item# ${input.tableId} is not in the archived D’Addario Catalog Supplement table. Fail closed — no guessed mass.`
				: UW_REQUIRED,
		});
	}
	if (errors.length) return fail(errors);
	if (!resolved) return fail(errors);

	const scale_in = scaleToInches(input.scale, input.scaleUnit);
	const tensionLbf = tensionLbfFromUw(resolved.uw, scale_in, input.frequencyHz);
	const tensionN = tensionLbf * LBF_TO_NEWTON;
	const lengthM = scale_in * 0.0254;
	const tensionSiN = tensionSi(muFromUw(resolved.uw), lengthM, input.frequencyHz);
	return {
		ok: true,
		uwLbPerIn: resolved.uw,
		uwSource: resolved.source,
		uwKind: resolved.kind,
		item: resolved.item,
		scale_in,
		frequencyHz: input.frequencyHz,
		tensionLbf,
		tensionN,
		tensionSiN,
	};
}

export function formatTensionCopy(result: TensionSuccess): string {
	const item = result.item ? ` Item# ${result.item}.` : '';
	return `${formatLbf(result.tensionLbf)} lbf (${formatFixed(result.tensionN, 2)} N). T = (UW × (2LF)²)/386.4. UW ${result.uwLbPerIn} lb/in (${result.uwSource}).${item} No max-safe tension is given.`;
}
