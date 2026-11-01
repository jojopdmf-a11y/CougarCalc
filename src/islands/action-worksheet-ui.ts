import { bindCalcForm } from './bind-calc.ts';
import {
	computeActionWorksheet,
	formatActionCopy,
	type ActionUnit,
} from '../calcs/action-worksheet.ts';
import { parseFiniteNumber, parseInteger } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: ActionUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function bindActionWorksheetForm(form: HTMLFormElement): void {
	const fret = form.querySelector<HTMLInputElement>('#fret')!;
	const bass = form.querySelector<HTMLInputElement>('#bass')!;
	const treble = form.querySelector<HTMLInputElement>('#treble')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter bass and treble heights at a named fret',
		isEmpty: () => bass.value.trim() === '' && treble.value.trim() === '' && fret.value.trim() === '',
		evaluate: () => {
			const fretRaw = parseInteger(fret.value);
			const bassRaw = parseFiniteNumber(bass.value);
			const trebleRaw = parseFiniteNumber(treble.value);
			const errors: string[] = [];
			if (!fretRaw.ok) errors.push('A named fret is required. Enter a whole number ≥ 1.');
			if (!bassRaw.ok) errors.push('Enter bass-side action.');
			if (!trebleRaw.ok) errors.push('Enter treble-side action.');
			if (errors.length) return { ok: false, errors };
			if (!fretRaw.ok || !bassRaw.ok || !trebleRaw.ok) return { ok: false, errors: ['Fix the inputs'] };
			const result = computeActionWorksheet({
				fretNumber: fretRaw.value,
				bass: bassRaw.value,
				treble: trebleRaw.value,
				unit: unit.value as ActionUnit,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			const extras = [
				`Bass ${formatLen(result.bass, result.unit)} ${result.unit} (${formatInches(result.bassIn)} in)`,
				`Treble ${formatLen(result.treble, result.unit)} ${result.unit} (${formatInches(result.trebleIn)} in)`,
				'No saddle-height formula. Guide, not hard rules.',
			];
			if (result.matchedGuide) {
				extras.unshift(`${result.matchedGuide.label} — guide, not hard rules.`);
				if (result.matchedGuide.reliefIn !== null) {
					extras.push(`Companion relief on that chart row: ${formatInches(result.matchedGuide.reliefIn)} in.`);
				}
			}
			if (result.mislabelNote) extras.unshift(result.mislabelNote);
			return {
				ok: true,
				rendered: {
					value: `${formatLen(result.bass, result.unit)} / ${formatLen(result.treble, result.unit)}`,
					unit: result.unit,
					decision: `Action at fret ${result.fretNumber} (bass / treble). Not a spec.`,
					extras,
					copy: formatActionCopy(result),
				},
			};
		},
	});

	form.querySelectorAll<HTMLButtonElement>('[data-fender-start]').forEach((chip) => {
		chip.addEventListener('click', () => {
			unit.value = 'in';
			if (chip.dataset.fret) fret.value = chip.dataset.fret;
			bass.value = chip.dataset.bass ?? '';
			treble.value = chip.dataset.treble ?? '';
			bass.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});
}
