import { bindCalcForm } from './bind-calc.ts';
import {
	DADDARIO_WAYBACK_SOURCE,
	computeStringTension,
	formatTensionCopy,
	lookupDaddarioItem,
	type ScaleUnit,
} from '../calcs/string-tension.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatFixed, formatLbf } from '../calcs/format.ts';

export const E4_HZ = 329.627557;

export function bindStringTensionForm(form: HTMLFormElement): void {
	const scale = form.querySelector<HTMLInputElement>('#scale')!;
	const scaleUnit = form.querySelector<HTMLSelectElement>('#scale-unit')!;
	const freq = form.querySelector<HTMLInputElement>('#freq')!;
	const table = form.querySelector<HTMLSelectElement>('#uw-table')!;
	const uw = form.querySelector<HTMLInputElement>('#uw')!;
	const uwField = form.querySelector<HTMLElement>('[data-uw-field]')!;
	const sourceEl = form.querySelector<HTMLElement>('[data-uw-source]')!;

	function syncUwField(): void {
		uwField.hidden = table.value !== 'user';
		if (table.value === 'user') {
			sourceEl.textContent = 'User-cited unit weight. Fail closed if empty. Not mixed with GHS cells. No max-safe T.';
			return;
		}
		const row = lookupDaddarioItem(table.value);
		sourceEl.textContent = row
			? `${row.item}: ${row.uwLbPerIn} lb/in. ${DADDARIO_WAYBACK_SOURCE}`
			: DADDARIO_WAYBACK_SOURCE;
	}

	bindCalcForm(form, {
		emptyMessage: 'Enter scale, frequency, and a cited unit weight',
		isEmpty: () =>
			scale.value.trim() === '' &&
			freq.value.trim() === '' &&
			table.value === '' &&
			uw.value.trim() === '',
		evaluate: () => {
			const scaleRaw = parseFiniteNumber(scale.value);
			const freqRaw = parseFiniteNumber(freq.value);
			const uwRaw = parseOptionalFiniteNumber(uw.value);
			const errors: string[] = [];
			if (!scaleRaw.ok) errors.push('Enter a scale length greater than zero.');
			if (!freqRaw.ok) errors.push('Enter frequency in Hz.');
			const tableId = table.value && table.value !== 'user' ? table.value : undefined;
			let uwLbPerIn: number | null = null;
			if (table.value === '') {
				errors.push(
					'Unit weight is required. Pick a cited D’Addario Item# or enter a cited UW. Fail closed — no guessed mass.',
				);
			} else if (table.value === 'user') {
				if (!uwRaw.ok || uwRaw.value === null) {
					errors.push('Enter a cited unit weight in lb/in, or pick an archived Item#.');
				} else {
					uwLbPerIn = uwRaw.value;
				}
			}
			if (errors.length) return { ok: false, errors };
			if (!scaleRaw.ok || !freqRaw.ok) return { ok: false, errors: ['Fix the inputs'] };
			const result = computeStringTension({
				scale: scaleRaw.value,
				scaleUnit: scaleUnit.value as ScaleUnit,
				frequencyHz: freqRaw.value,
				uwLbPerIn,
				tableId,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			return {
				ok: true,
				rendered: {
					value: formatLbf(result.tensionLbf),
					unit: 'lbf',
					decision: `${formatFixed(result.tensionN, 2)} N. No max-safe tension.`,
					extras: [
						`T = (UW × (2 L F)²) / 386.4`,
						`SI check ${formatFixed(result.tensionSiN, 2)} N (4 μ L² f²)`,
						`UW ${result.uwLbPerIn} lb/in`,
						result.item ? `Item# ${result.item}` : 'User-cited UW',
						result.uwSource,
						`Scale ${formatFixed(result.scale_in, 3)} in, f = ${formatFixed(result.frequencyHz, 6)} Hz`,
					],
					copy: formatTensionCopy(result),
				},
			};
		},
	});

	table.addEventListener('change', syncUwField);
	form.querySelector<HTMLButtonElement>('[data-e4-chip]')?.addEventListener('click', () => {
		freq.value = String(E4_HZ);
		freq.dispatchEvent(new Event('input', { bubbles: true }));
	});
	form.addEventListener('reset', () => {
		queueMicrotask(() => {
			syncUwField();
		});
	});
	syncUwField();
}
