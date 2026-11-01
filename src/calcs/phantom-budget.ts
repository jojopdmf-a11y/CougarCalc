/**
 * Phantom power milliamps budget.
 * total_mA = Σ(mA × count)
 * Empty supply budget stays empty — never default 500 mA.
 */

import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed } from './format.ts';

export type PhantomRow = {
	label: string;
	mA: number;
	count: number;
};

export type PhantomInput = {
	rows: PhantomRow[];
	budgetMa: number | null;
};

export type PhantomSuccess = {
	ok: true;
	totalMa: number;
	budgetMa: number | null;
	remainingMa: number | null;
	overBudget: boolean;
};

export type PhantomResult = PhantomSuccess | CalcFailure;

export function computePhantomBudget(input: PhantomInput): PhantomResult {
	const errors: FieldError[] = [];
	if (input.rows.length === 0) {
		errors.push({ field: 'rows', message: 'Add at least one device row, or the card stays empty.' });
	}
	input.rows.forEach((row, i) => {
		if (!Number.isFinite(row.mA) || row.mA < 0) {
			errors.push({ field: `mA-${i}`, message: `Row ${i + 1}: milliamps must be ≥ 0.` });
		}
		if (!Number.isFinite(row.count) || row.count < 1 || !Number.isInteger(row.count)) {
			errors.push({ field: `count-${i}`, message: `Row ${i + 1}: count must be an integer ≥ 1.` });
		}
	});
	if (input.budgetMa !== null && (!Number.isFinite(input.budgetMa) || input.budgetMa < 0)) {
		errors.push({ field: 'budgetMa', message: 'Supply budget must be ≥ 0 mA, or left empty. This tool never assumes 500 mA.' });
	}
	if (errors.length) return fail(errors);

	const totalMa = input.rows.reduce((sum, row) => sum + row.mA * row.count, 0);
	const budgetMa = input.budgetMa;
	const remainingMa = budgetMa === null ? null : budgetMa - totalMa;
	return {
		ok: true,
		totalMa,
		budgetMa,
		remainingMa,
		overBudget: remainingMa !== null && remainingMa < 0,
	};
}

export function formatPhantomCopy(result: PhantomSuccess): string {
	const budget =
		result.budgetMa === null
			? 'Supply budget left empty (not assumed 500 mA).'
			: `Budget ${formatFixed(result.budgetMa, 1)} mA, remaining ${formatFixed(result.remainingMa ?? 0, 1)} mA.`;
	return `Total draw ${formatFixed(result.totalMa, 1)} mA. ${budget}`;
}
