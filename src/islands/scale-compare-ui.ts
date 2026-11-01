import { bindCalcForm } from './bind-calc.ts';
import {
	computeScaleCompare,
	formatScaleCompareCopy,
	PUBLISHED_SCALES,
	type ScaleUnit,
} from '../calcs/scale-compare.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: ScaleUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function bindScaleCompareForm(form: HTMLFormElement): void {
	const nutTo12 = form.querySelector<HTMLInputElement>('#nut-to-12')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;
	const compareId = form.querySelector<HTMLInputElement>('#compare-id')!;
	const sourceEl = form.querySelector<HTMLElement>('[data-compare-source]')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter nut-to-12th',
		isEmpty: () => nutTo12.value.trim() === '',
		evaluate: () => {
			const nutRaw = parseFiniteNumber(nutTo12.value);
			if (!nutRaw.ok) return { ok: false, errors: ['Enter nut-to-12th greater than zero.'] };
			const result = computeScaleCompare({
				nutToTwelfth: nutRaw.value,
				unit: unit.value as ScaleUnit,
				compareId: compareId.value || undefined,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			const extras = [
				`${formatInches(result.sActualIn)} in / ${formatMm(result.sActualMm)} mm`,
				`25.500 × 25.4 = ${formatMm(result.inchTimes254)} mm, not 650 mm.`,
			];
			if (result.compare) {
				extras.push(
					`vs ${result.compare.label}: Δ ${formatLen(result.compare.delta, result.unit)} ${result.unit}`,
					result.compare.source,
				);
			}
			return {
				ok: true,
				rendered: {
					value: formatLen(result.sActual, result.unit),
					unit: result.unit,
					decision: 'S_actual = 2 × nut-to-12th',
					extras,
					copy: formatScaleCompareCopy(result),
				},
			};
		},
	});

	form.querySelectorAll<HTMLButtonElement>('[data-scale-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			const id = chip.dataset.id ?? '';
			compareId.value = id;
			const row = PUBLISHED_SCALES.find((s) => s.id === id);
			sourceEl.textContent = row
				? row.source
				: 'Chips are only the published rows in this prototype. No invented scales.';
			form.querySelectorAll<HTMLButtonElement>('[data-scale-chip]').forEach((c) => {
				c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
			});
			nutTo12.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});

	form.addEventListener('reset', () => {
		compareId.value = '';
		sourceEl.textContent = 'Chips are only the published rows in this prototype. No invented scales.';
		form.querySelectorAll<HTMLButtonElement>('[data-scale-chip]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
	});
}
