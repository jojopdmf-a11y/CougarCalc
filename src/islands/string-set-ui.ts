import { bindCalcForm } from './bind-calc.ts';
import { computeStringSet, formatStringSetCopy, type SetStringInput } from '../calcs/string-set.ts';
import { type ScaleUnit } from '../calcs/string-tension.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatFixed, formatLbf } from '../calcs/format.ts';

function syncRowUw(row: HTMLElement): void {
	const table = row.querySelector<HTMLSelectElement>('[data-uw-table]')!;
	const field = row.querySelector<HTMLElement>('[data-uw-field]')!;
	field.hidden = table.value !== 'user';
}

function collectStrings(form: HTMLFormElement, scale: number, scaleUnit: ScaleUnit): { ok: true; strings: SetStringInput[] } | { ok: false; errors: string[] } {
	const rows = [...form.querySelectorAll<HTMLElement>('[data-string-row]')];
	const errors: string[] = [];
	const strings: SetStringInput[] = [];
	rows.forEach((row, i) => {
		const name = row.querySelector<HTMLInputElement>('[data-name]')?.value.trim() || `String ${i + 1}`;
		const freqEl = row.querySelector<HTMLInputElement>('[data-freq]')!;
		const table = row.querySelector<HTMLSelectElement>('[data-uw-table]')!;
		const uwEl = row.querySelector<HTMLInputElement>('[data-uw]')!;
		const freqEmpty = freqEl.value.trim() === '';
		const tableEmpty = table.value === '';
		const uwEmpty = uwEl.value.trim() === '';
		if (freqEmpty && tableEmpty && uwEmpty) return;
		const freqRaw = parseFiniteNumber(freqEl.value);
		const uwRaw = parseOptionalFiniteNumber(uwEl.value);
		if (!freqRaw.ok) errors.push(`${name}: enter frequency in Hz.`);
		const tableId = table.value && table.value !== 'user' ? table.value : undefined;
		let uwLbPerIn: number | null = null;
		if (table.value === '') {
			errors.push(`${name}: unit weight is required. Pick a cited D’Addario Item# or enter a cited UW.`);
		} else if (table.value === 'user') {
			if (!uwRaw.ok || uwRaw.value === null) {
				errors.push(`${name}: enter a cited unit weight in lb/in.`);
			} else {
				uwLbPerIn = uwRaw.value;
			}
		}
		if (freqRaw.ok) {
			strings.push({
				name,
				scale,
				scaleUnit,
				frequencyHz: freqRaw.value,
				uwLbPerIn,
				tableId,
			});
		}
	});
	if (strings.length === 0 && errors.length === 0) {
		errors.push('Add at least one string with frequency and a cited unit weight.');
	}
	if (errors.length) return { ok: false, errors };
	return { ok: true, strings };
}

export function bindStringSetForm(form: HTMLFormElement): void {
	const scale = form.querySelector<HTMLInputElement>('#scale')!;
	const scaleUnit = form.querySelector<HTMLSelectElement>('#scale-unit')!;
	const rowsHost = form.querySelector<HTMLElement>('[data-string-rows]')!;
	const template = form.querySelector<HTMLTemplateElement>('[data-string-template]')!;
	const tableWrap = form.querySelector<HTMLElement>('[data-table-wrap]')!;
	const tableBody = form.querySelector<HTMLElement>('[data-table-body]')!;
	const addBtn = form.querySelector<HTMLButtonElement>('[data-add-row]')!;

	function clearTable(): void {
		tableBody.replaceChildren();
		tableWrap.hidden = true;
	}

	function bindRow(row: HTMLElement): void {
		row.querySelector<HTMLSelectElement>('[data-uw-table]')?.addEventListener('change', () => syncRowUw(row));
		row.querySelector<HTMLButtonElement>('[data-remove-row]')?.addEventListener('click', () => {
			const count = form.querySelectorAll('[data-string-row]').length;
			if (count <= 1) return;
			row.remove();
			scale.dispatchEvent(new Event('input', { bubbles: true }));
		});
		syncRowUw(row);
	}

	form.querySelectorAll<HTMLElement>('[data-string-row]').forEach(bindRow);

	addBtn.addEventListener('click', () => {
		const node = template.content.firstElementChild?.cloneNode(true);
		if (!(node instanceof HTMLElement)) return;
		const n = form.querySelectorAll('[data-string-row]').length + 1;
		const legend = node.querySelector('legend');
		if (legend) legend.textContent = `String ${n}`;
		rowsHost.append(node);
		bindRow(node);
		scale.dispatchEvent(new Event('input', { bubbles: true }));
	});

	const initialCount = form.querySelectorAll('[data-string-row]').length;
	form.addEventListener('reset', () => {
		queueMicrotask(() => {
			[...form.querySelectorAll<HTMLElement>('[data-string-row]')].slice(initialCount).forEach((row) => row.remove());
			form.querySelectorAll<HTMLElement>('[data-string-row]').forEach(syncRowUw);
		});
	});

	bindCalcForm(form, {
		emptyMessage: 'Enter scale and at least one string with frequency and cited UW',
		isEmpty: () => {
			const rows = [...form.querySelectorAll<HTMLElement>('[data-string-row]')];
			const rowsEmpty = rows.every((row) => {
				const freq = row.querySelector<HTMLInputElement>('[data-freq]')?.value.trim() === '';
				const table = row.querySelector<HTMLSelectElement>('[data-uw-table]')?.value === '';
				const uw = row.querySelector<HTMLInputElement>('[data-uw]')?.value.trim() === '';
				return freq && table && uw;
			});
			const empty = scale.value.trim() === '' && rowsEmpty;
			if (empty) clearTable();
			return empty;
		},
		evaluate: () => {
			const scaleRaw = parseFiniteNumber(scale.value);
			if (!scaleRaw.ok) {
				clearTable();
				return { ok: false, errors: ['Enter a scale length greater than zero.'] };
			}
			const collected = collectStrings(form, scaleRaw.value, scaleUnit.value as ScaleUnit);
			if (!collected.ok) {
				clearTable();
				return collected;
			}
			const result = computeStringSet(collected.strings);
			if (!result.ok) {
				clearTable();
				return { ok: false, errors: result.errors.map((e) => e.message) };
			}
			tableWrap.hidden = false;
			tableBody.replaceChildren(
				...result.strings.map((s) => {
					const tr = document.createElement('tr');
					const th = document.createElement('th');
					th.scope = 'row';
					th.textContent = s.name;
					const lbf = document.createElement('td');
					lbf.textContent = formatLbf(s.tensionLbf);
					const n = document.createElement('td');
					n.textContent = formatFixed(s.tensionN, 2);
					tr.append(th, lbf, n);
					return tr;
				}),
			);
			return {
				ok: true,
				rendered: {
					value: formatLbf(result.totalLbf),
					unit: 'lbf',
					decision: 'Total = Σ Ti. Not a neck-safe rating.',
					extras: [
						`${formatFixed(result.totalN, 2)} N across ${result.strings.length} strings`,
						...result.strings.map((s) => `${s.name}: ${formatLbf(s.tensionLbf)} lbf`),
						'This tool never claims a set is safe for this neck.',
					],
					copy: formatStringSetCopy(result),
				},
			};
		},
	});
}
