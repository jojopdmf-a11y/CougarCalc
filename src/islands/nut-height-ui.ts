import { bindCalcForm } from './bind-calc.ts';
import {
	computeNutHeight,
	formatNutHeightCopy,
	type NutHeightUnit,
	type NutMethod,
} from '../calcs/nut-height.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: NutHeightUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

function radioValue(form: HTMLFormElement, name: string): string | null {
	return form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? null;
}

export function bindNutHeightForm(form: HTMLFormElement): void {
	const action = form.querySelector<HTMLInputElement>('#action')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;
	const crown = form.querySelector<HTMLInputElement>('#crown')!;

	bindCalcForm(form, {
		emptyMessage: 'Choose a method and enter the measured height',
		isEmpty: () => action.value.trim() === '' && radioValue(form, 'method') === null,
		evaluate: () => {
			const method = radioValue(form, 'method') as NutMethod | null;
			const actionRaw = parseFiniteNumber(action.value);
			const crownRaw = parseOptionalFiniteNumber(crown.value);
			const errors: string[] = [];
			if (method !== 'open-1st' && method !== 'press-3rd') {
				errors.push('Choose a measurement method: MusicNomad open@1st or StewMac TS331 press@3rd.');
			}
			if (!actionRaw.ok) errors.push('Enter a measured height greater than zero.');
			if (!crownRaw.ok) errors.push('Fret crown must be a number in inches, or left empty.');
			if (errors.length) return { ok: false, errors };
			if (!actionRaw.ok || !crownRaw.ok || !method) return { ok: false, errors: ['Fix the inputs'] };
			const result = computeNutHeight({
				method,
				firstFretAction: actionRaw.value,
				unit: unit.value as NutHeightUnit,
				fretCrownIn: crownRaw.value,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			const extras = [
				`${formatInches(result.firstFretIn)} in`,
				result.methodLabel,
				result.sourceLabel,
				result.comparisonNote,
				'Measurement aid only — not a filing procedure. One swipe can ruin a slot.',
			];
			if (result.nutSlotVsFret !== null) {
				extras.push(`Measured height + crown = ${formatInches(result.nutSlotVsFret)} in (comparison only).`);
			}
			return {
				ok: true,
				rendered: {
					value: formatLen(result.firstFretAction, result.unit),
					unit: result.unit,
					decision: `${result.methodLabel}. Not a filing procedure.`,
					extras,
					copy: formatNutHeightCopy(result),
				},
			};
		},
	});
}
