import { bindCalcForm, bindRepeatRows } from './bind-calc.ts';
import {
	compute70vTap,
	format70vCopy,
	FIRE_ALARM_REFUSAL,
	type DistributedVoltage,
} from '../calcs/seventy-volt.ts';
import { parseFiniteNumber, parseInteger } from '../calcs/parse.ts';
import { formatFixed, formatOhms } from '../calcs/format.ts';

export function bindSeventyVoltForm(form: HTMLFormElement): void {
	const list = form.querySelector<HTMLElement>('[data-row-list]')!;
	const addButton = form.querySelector<HTMLButtonElement>('[data-add-row]')!;
	const fireAlarm = form.querySelector<HTMLInputElement>('#fire-alarm')!;

	bindRepeatRows(form, { list, addButton, minRows: 1 });

	bindCalcForm(form, {
		emptyMessage: 'Enter tap watts',
		isEmpty: () =>
			!fireAlarm.checked &&
			[...list.querySelectorAll<HTMLInputElement>('.js-watts')].every((el) => el.value.trim() === ''),
		evaluate: () => {
			if (fireAlarm.checked) {
				const refused = compute70vTap({ fireAlarm: true, voltage: 70.7, taps: [{ watts: 10, count: 1 }] });
				const message = refused.ok && refused.refused ? refused.message : FIRE_ALARM_REFUSAL;
				return {
					ok: true,
					rendered: {
						value: 'Refused',
						decision: message,
						extras: ['No ohms, watts, or current are shown for fire-alarm / life-safety circuits.'],
						copy: message,
					},
				};
			}

			const voltageValue = form.querySelector<HTMLInputElement>('input[name="voltage"]:checked')?.value ?? '70.7';
			const voltage = Number(voltageValue) as DistributedVoltage;
			const errors: string[] = [];
			const taps: { watts: number; count: number }[] = [];
			list.querySelectorAll<HTMLElement>('[data-row]').forEach((row, i) => {
				const wattsEl = row.querySelector<HTMLInputElement>('.js-watts')!;
				const countEl = row.querySelector<HTMLInputElement>('.js-count')!;
				if (wattsEl.value.trim() === '' && countEl.value.trim() === '') return;
				const wattsRaw = parseFiniteNumber(wattsEl.value);
				const countRaw = parseInteger(countEl.value);
				if (!wattsRaw.ok) errors.push(`Tap ${i + 1}: watts must be greater than zero.`);
				if (!countRaw.ok) errors.push(`Tap ${i + 1}: count must be an integer ≥ 1.`);
				if (wattsRaw.ok && countRaw.ok) taps.push({ watts: wattsRaw.value, count: countRaw.value });
			});
			if (taps.length === 0) errors.push('Add at least one tap row.');
			if (errors.length) return { ok: false, errors };

			const result = compute70vTap({ fireAlarm: false, voltage, taps });
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			if (result.refused) {
				return {
					ok: true,
					rendered: {
						value: 'Refused',
						decision: result.message,
						extras: [],
						copy: format70vCopy(result),
					},
				};
			}

			const extras = [
				`Z_eq ${formatOhms(result.totalZ)} Ω = V² / P`,
				`I ${formatFixed(result.totalCurrent, 3)} A = P / V`,
				...result.rows.map(
					(row) =>
						`${formatFixed(row.watts, 1)} W × ${row.count}: Z_tap ${formatOhms(row.z)} Ω, I_tap ${formatFixed(row.current, 3)} A`,
				),
				'BGM / paging / under-balcony only.',
			];

			return {
				ok: true,
				rendered: {
					value: formatFixed(result.totalWatts, 1),
					unit: 'W',
					decision: `${formatFixed(result.voltage, 1)} V distributed load (not fire alarm)`,
					extras,
					copy: format70vCopy(result),
				},
			};
		},
	});
}
