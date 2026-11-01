import { bindCalcForm } from './bind-calc.ts';
import { computeNutSpacing, formatNutSpacingCopy, type NutUnit } from '../calcs/nut-spacing.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

function parseGaugeList(raw: string): { ok: true; values: number[] } | { ok: false; message: string } {
	const parts = raw
		.split(/[\s,;]+/)
		.map((p) => p.trim())
		.filter(Boolean);
	if (parts.length === 0) {
		return { ok: false, message: 'Enter at least two string gauges, comma-separated or one per row.' };
	}
	const values: number[] = [];
	for (const part of parts) {
		const parsed = parseFiniteNumber(part);
		if (!parsed.ok) {
			return { ok: false, message: `Gauge “${part}” is not a number. Use 0.010, not a label.` };
		}
		values.push(parsed.value);
	}
	if (values.length < 2) {
		return { ok: false, message: 'Enter at least two string gauges.' };
	}
	return { ok: true, values };
}

function formatLen(value: number, unit: NutUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function bindNutSpacingForm(form: HTMLFormElement): void {
	const eToE = form.querySelector<HTMLInputElement>('#e-to-e')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;
	const gauges = form.querySelector<HTMLTextAreaElement>('#gauges')!;
	const gaugeUnit = form.querySelector<HTMLSelectElement>('#gauge-unit')!;
	const tableWrap = form.querySelector<HTMLElement>('[data-table-wrap]')!;
	const tableBody = form.querySelector<HTMLElement>('[data-table-body]')!;

	function clearTable(): void {
		tableBody.replaceChildren();
		tableWrap.hidden = true;
	}

	bindCalcForm(form, {
		emptyMessage: 'Enter E-to-E and at least two gauges',
		isEmpty: () => {
			const empty = eToE.value.trim() === '' && gauges.value.trim() === '';
			if (empty) clearTable();
			return empty;
		},
		evaluate: () => {
			const eRaw = parseFiniteNumber(eToE.value);
			const list = parseGaugeList(gauges.value);
			const errors: string[] = [];
			if (!eRaw.ok) errors.push('Enter E-to-E (outer string centers).');
			if (!list.ok) errors.push(list.message);
			if (errors.length) {
				clearTable();
				return { ok: false, errors };
			}
			if (!eRaw.ok || !list.ok) {
				clearTable();
				return { ok: false, errors: ['Fix the inputs'] };
			}
			const result = computeNutSpacing({
				eToE: eRaw.value,
				unit: unit.value as NutUnit,
				gauges: list.values,
				gaugeUnit: gaugeUnit.value as NutUnit,
			});
			if (!result.ok) {
				clearTable();
				return { ok: false, errors: result.errors.map((e) => e.message) };
			}
			tableWrap.hidden = false;
			tableBody.replaceChildren(
				...result.centers.map((center, i) => {
					const tr = document.createElement('tr');
					const th = document.createElement('th');
					th.scope = 'row';
					th.textContent = String(i + 1);
					const g = document.createElement('td');
					g.textContent = `${formatLen(result.gaugesInUnit[i], result.unit)} ${result.unit}`;
					const c = document.createElement('td');
					c.textContent = `${formatLen(center, result.unit)} ${result.unit}`;
					tr.append(th, g, c);
					return tr;
				}),
			);
			return {
				ok: true,
				rendered: {
					value: formatLen(result.gap, result.unit),
					unit: result.unit,
					decision: 'Equal remaining gap between string edges. Slot clearance is not specified.',
					extras: [
						`E-to-E ${formatLen(result.eToE, result.unit)} ${result.unit}`,
						`${result.centers.length} strings`,
						`Centers from first E: ${result.centers.map((c) => formatLen(c, result.unit)).join(', ')} ${result.unit}`,
					],
					copy: formatNutSpacingCopy(result),
				},
			};
		},
	});
}
