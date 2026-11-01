import { bindCalcForm } from './bind-calc.ts';
import {
	computeSaddleCompensation,
	formatSaddleCopy,
	type SaddleUnit,
} from '../calcs/saddle-compensation.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatFixed, formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: SaddleUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function bindSaddleCompensationForm(form: HTMLFormElement): void {
	const scale = form.querySelector<HTMLInputElement>('#scale')!;
	const cents = form.querySelector<HTMLInputElement>('#cents')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter scale and 12th-fret cents error',
		isEmpty: () => scale.value.trim() === '' && cents.value.trim() === '',
		evaluate: () => {
			const scaleRaw = parseFiniteNumber(scale.value);
			const centsRaw = parseFiniteNumber(cents.value);
			const errors: string[] = [];
			if (!scaleRaw.ok) errors.push('Enter a scale length greater than zero.');
			if (!centsRaw.ok) errors.push('Enter 12th-fret cents error (negative if flat).');
			if (errors.length) return { ok: false, errors };
			if (!scaleRaw.ok || !centsRaw.ok) return { ok: false, errors: ['Fix the inputs'] };
			const result = computeSaddleCompensation({
				scale: scaleRaw.value,
				centsError: centsRaw.value,
				unit: unit.value as SaddleUnit,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			const dir =
				result.direction === 'away-from-nut'
					? 'Move saddle away from the nut (fretted note was sharp).'
					: result.direction === 'toward-nut'
						? 'Move saddle toward the nut (fretted note was flat).'
						: 'No displacement.';
			return {
				ok: true,
				rendered: {
					value: formatLen(result.displacement, result.unit),
					unit: result.unit,
					decision: dir,
					extras: [
						`n = ${formatFixed(result.n, 4)} (Mottola n = 12 + e/100)`,
						'Mottola only. Elmendorp not used.',
					],
					copy: formatSaddleCopy(result),
				},
			};
		},
	});
}
