import { bindCalcForm } from './bind-calc.ts';
import {
	computePickupPoles,
	formatPickupCopy,
	DUNCAN_HUMBUCKER_IN,
	DUNCAN_TREMBUCKER_IN,
	type PickupUnit,
} from '../calcs/pickup-poles.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

export function bindPickupPolesForm(form: HTMLFormElement): void {
	const eToE = form.querySelector<HTMLInputElement>('#e-to-e')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter E-to-E at the pickup',
		isEmpty: () => eToE.value.trim() === '',
		evaluate: () => {
			const eRaw = parseFiniteNumber(eToE.value);
			if (!eRaw.ok) return { ok: false, errors: ['Enter E-to-E at the pickup.'] };
			const position =
				(form.querySelector<HTMLInputElement>('input[name="position"]:checked')?.value ?? 'bridge') === 'neck'
					? 'neck'
					: 'bridge';
			const result = computePickupPoles({
				eToE: eRaw.value,
				unit: unit.value as PickupUnit,
				position,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			const decision =
				result.suggestion === 'trembucker'
					? 'Bridge E-to-E > 2 in → Trembucker (Duncan).'
					: result.suggestion === 'humbucker'
						? 'Bridge E-to-E ≤ 2 in → standard humbucker (Duncan).'
						: 'Neck position: Duncan treats spacing as a bridge-pickup question.';
			return {
				ok: true,
				rendered: {
					value: formatInches(result.eToE_in),
					unit: 'in',
					decision,
					extras: [
						`${formatMm(result.eToE_in * 25.4)} mm`,
						`Δ vs Duncan ${formatInches(DUNCAN_HUMBUCKER_IN)} in: ${formatInches(result.deltaHumbuckerIn)} in`,
						`Δ vs Duncan ${formatInches(DUNCAN_TREMBUCKER_IN)} in: ${formatInches(result.deltaTrembuckerIn)} in`,
						result.dimarzioNote,
					],
					copy: formatPickupCopy(result),
				},
			};
		},
	});

	form.querySelectorAll<HTMLButtonElement>('[data-duncan-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			eToE.value = chip.dataset.value ?? '';
			unit.value = chip.dataset.unit ?? 'in';
			eToE.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});
}
