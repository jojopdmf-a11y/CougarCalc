import { bindCalcForm } from './bind-calc.ts';
import { computeNeckTaper, formatNeckTaperCopy, type TaperUnit } from '../calcs/neck-taper.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatFixed, formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: TaperUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function bindNeckTaperForm(form: HTMLFormElement): void {
	const x1 = form.querySelector<HTMLInputElement>('#x1')!;
	const w1 = form.querySelector<HTMLInputElement>('#w1')!;
	const x2 = form.querySelector<HTMLInputElement>('#x2')!;
	const w2 = form.querySelector<HTMLInputElement>('#w2')!;
	const x = form.querySelector<HTMLInputElement>('#x')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter two stations and a query location',
		isEmpty: () =>
			x1.value.trim() === '' &&
			w1.value.trim() === '' &&
			x2.value.trim() === '' &&
			w2.value.trim() === '' &&
			x.value.trim() === '',
		evaluate: () => {
			const pairs = [
				['x1', x1],
				['w1', w1],
				['x2', x2],
				['w2', w2],
				['x', x],
			] as const;
			const errors: string[] = [];
			const nums: Record<string, number> = {};
			for (const [name, el] of pairs) {
				const parsed = parseFiniteNumber(el.value);
				if (!parsed.ok) errors.push(`${name} must be a finite number.`);
				else nums[name] = parsed.value;
			}
			if (errors.length) return { ok: false, errors };
			const result = computeNeckTaper({
				x1: nums.x1,
				w1: nums.w1,
				x2: nums.x2,
				w2: nums.w2,
				x: nums.x,
				unit: unit.value as TaperUnit,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			return {
				ok: true,
				rendered: {
					value: formatLen(result.width, result.unit),
					unit: result.unit,
					decision: 'Linear interpolation between two measured stations.',
					extras: [
						`t = ${formatFixed(result.t, 3)}`,
						'Fender 1st/12th chart values are neck depth, not width.',
					],
					copy: formatNeckTaperCopy(result),
				},
			};
		},
	});
}
