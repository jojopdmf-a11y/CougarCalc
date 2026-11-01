import { bindCalcForm, bindRepeatRows } from './bind-calc.ts';
import { computePhantomBudget, formatPhantomCopy } from '../calcs/phantom-budget.ts';
import { parseFiniteNumber, parseInteger, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatFixed } from '../calcs/format.ts';

export function bindPhantomBudgetForm(form: HTMLFormElement): void {
	const list = form.querySelector<HTMLElement>('[data-row-list]')!;
	const addButton = form.querySelector<HTMLButtonElement>('[data-add-row]')!;
	const budget = form.querySelector<HTMLInputElement>('#budget')!;

	bindRepeatRows(form, { list, addButton, minRows: 1 });

	bindCalcForm(form, {
		emptyMessage: 'Enter milliamps and count',
		isEmpty: () =>
			[...list.querySelectorAll<HTMLInputElement>('.js-ma')].every((el) => el.value.trim() === '') &&
			budget.value.trim() === '',
		evaluate: () => {
			const errors: string[] = [];
			const rows: { label: string; mA: number; count: number }[] = [];
			list.querySelectorAll<HTMLElement>('[data-row]').forEach((row, i) => {
				const maEl = row.querySelector<HTMLInputElement>('.js-ma')!;
				const countEl = row.querySelector<HTMLInputElement>('.js-count')!;
				const label = row.querySelector<HTMLInputElement>('.js-label')!.value.trim();
				if (maEl.value.trim() === '' && countEl.value.trim() === '') return;
				const maRaw = parseFiniteNumber(maEl.value);
				const countRaw = parseInteger(countEl.value);
				if (!maRaw.ok) errors.push(`Row ${i + 1}: milliamps must be ≥ 0.`);
				if (!countRaw.ok) errors.push(`Row ${i + 1}: count must be an integer ≥ 1.`);
				if (maRaw.ok && countRaw.ok) {
					rows.push({ label: label || `Row ${i + 1}`, mA: maRaw.value, count: countRaw.value });
				}
			});
			const budgetRaw = parseOptionalFiniteNumber(budget.value);
			if (!budgetRaw.ok) {
				errors.push('Supply budget must be ≥ 0 mA, or left empty. This tool never assumes 500 mA.');
			}
			if (rows.length === 0) errors.push('Add at least one device row with milliamps and count.');
			if (errors.length) return { ok: false, errors };

			const result = computePhantomBudget({
				rows,
				budgetMa: budgetRaw.ok ? budgetRaw.value : null,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				result.budgetMa === null
					? 'Supply budget left empty (not assumed 500 mA).'
					: `Budget ${formatFixed(result.budgetMa, 1)} mA, remaining ${formatFixed(result.remainingMa ?? 0, 1)} mA.`,
				result.overBudget ? 'Draw exceeds the typed budget.' : 'Within the typed budget, or no budget typed.',
				'High draw plus long thin cable can sag 48 V (Bartlett). This tool does not model that drop.',
			];

			return {
				ok: true,
				rendered: {
					value: formatFixed(result.totalMa, 1),
					unit: 'mA',
					decision: 'Total phantom current (Σ mA × count)',
					extras,
					copy: formatPhantomCopy(result),
				},
			};
		},
	});
}
