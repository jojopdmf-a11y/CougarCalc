/**
 * Scale-length compare. Cited published lengths only.
 * S_actual = 2 × nut-to-12th.
 * 25.500 in ≠ 650 mm (25.500 × 25.4 = 647.7 mm).
 */

import { convertScale, MM_PER_INCH } from './units.ts';
import { fail, type CalcFailure } from './types.ts';
import { formatInches, formatMm } from './format.ts';

export type ScaleUnit = 'in' | 'mm';

export type PublishedScale = {
	id: string;
	label: string;
	value: number;
	unit: ScaleUnit;
	source: string;
};

export const PUBLISHED_SCALES: PublishedScale[] = [
	{
		id: 'fender-255',
		label: '25.500 in (Fender-style, StewMac cite)',
		value: 25.5,
		unit: 'in',
		source: 'StewMac lists 25.5 in as a Fender-style scale. Not a maker spec from this site.',
	},
	{
		id: 'gibson-2475',
		label: '24.75 in (Gibson-style, commonly published)',
		value: 24.75,
		unit: 'in',
		source: 'Widely published Gibson-style scale. Confirm on the instrument.',
	},
	{
		id: 'prs-25',
		label: '25.00 in (PRS published)',
		value: 25,
		unit: 'in',
		source: 'PRS publishes 25 in as a scale length.',
	},
	{
		id: 'metric-650',
		label: '650 mm (common metric / classical)',
		value: 650,
		unit: 'mm',
		source: 'Common metric scale. Not 25.5 in.',
	},
	{
		id: 'metric-660',
		label: '660 mm (common metric)',
		value: 660,
		unit: 'mm',
		source: 'Common metric scale. Convert separately.',
	},
	{
		id: 'bass-34',
		label: '34.00 in (long-scale bass, commonly published)',
		value: 34,
		unit: 'in',
		source: 'Commonly published long-scale bass length. Confirm on the instrument.',
	},
];

export type ScaleCompareInput = {
	nutToTwelfth: number;
	unit: ScaleUnit;
	compareId?: string;
};

export type ScaleCompareSuccess = {
	ok: true;
	sActual: number;
	unit: ScaleUnit;
	sActualIn: number;
	sActualMm: number;
	inchTimes254: number;
	equals650: boolean;
	compare: { label: string; delta: number; source: string } | null;
};

export type ScaleCompareResult = ScaleCompareSuccess | CalcFailure;

export function computeScaleCompare(input: ScaleCompareInput): ScaleCompareResult {
	if (!Number.isFinite(input.nutToTwelfth) || input.nutToTwelfth <= 0) {
		return fail([{ field: 'nutToTwelfth', message: 'Nut-to-12th must be greater than zero.' }]);
	}
	const sActual = 2 * input.nutToTwelfth;
	const sActualIn = convertScale(sActual, input.unit, 'in');
	const sActualMm = convertScale(sActual, input.unit, 'mm');
	const inchTimes254 = 25.5 * MM_PER_INCH;
	let compare: ScaleCompareSuccess['compare'] = null;
	if (input.compareId) {
		const row = PUBLISHED_SCALES.find((s) => s.id === input.compareId);
		if (!row) return fail([{ field: 'compareId', message: 'Unknown published scale id.' }]);
		const publishedInUnit = convertScale(row.value, row.unit, input.unit);
		compare = { label: row.label, delta: sActual - publishedInUnit, source: row.source };
	}
	return {
		ok: true,
		sActual,
		unit: input.unit,
		sActualIn,
		sActualMm,
		inchTimes254,
		equals650: false,
		compare,
	};
}

export function formatScaleCompareCopy(result: ScaleCompareSuccess): string {
	const cmp = result.compare
		? ` vs ${result.compare.label}: Δ ${result.unit === 'in' ? formatInches(result.compare.delta) : formatMm(result.compare.delta)} ${result.unit}.`
		: '';
	return `S_actual = 2 × nut-to-12th = ${result.unit === 'in' ? formatInches(result.sActual) : formatMm(result.sActual)} ${result.unit} (${formatInches(result.sActualIn)} in / ${formatMm(result.sActualMm)} mm). 25.500 × 25.4 = ${formatMm(result.inchTimes254)} mm, not 650 mm.${cmp}`;
}
