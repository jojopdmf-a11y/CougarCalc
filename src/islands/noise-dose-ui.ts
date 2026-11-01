import { bindCalcForm, bindRepeatRows } from './bind-calc.ts';
import { computeNoiseDose, formatNoiseDoseCopy } from '../calcs/noise-dose.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatDb, formatFixed } from '../calcs/format.ts';

export function bindNoiseDoseForm(form: HTMLFormElement): void {
	const list = form.querySelector<HTMLElement>('[data-row-list]')!;
	const addButton = form.querySelector<HTMLButtonElement>('[data-add-row]')!;

	bindRepeatRows(form, { list, addButton, minRows: 1 });

	bindCalcForm(form, {
		emptyMessage: 'Enter a dBA band',
		isEmpty: () => [...list.querySelectorAll<HTMLInputElement>('.js-dba')].every((el) => el.value.trim() === ''),
		evaluate: () => {
			const errors: string[] = [];
			const bands: { levelDba: number; hours: number }[] = [];
			list.querySelectorAll<HTMLElement>('[data-row]').forEach((row, i) => {
				const dbaEl = row.querySelector<HTMLInputElement>('.js-dba')!;
				const hoursEl = row.querySelector<HTMLInputElement>('.js-hours')!;
				if (dbaEl.value.trim() === '' && hoursEl.value.trim() === '') return;
				const dbaRaw = parseFiniteNumber(dbaEl.value);
				const hoursRaw = parseFiniteNumber(hoursEl.value);
				if (!dbaRaw.ok) errors.push(`Band ${i + 1}: level must be a dBA number.`);
				if (!hoursRaw.ok) errors.push(`Band ${i + 1}: duration must be ≥ 0 hours.`);
				if (dbaRaw.ok && hoursRaw.ok) bands.push({ levelDba: dbaRaw.value, hours: hoursRaw.value });
			});
			if (bands.length === 0) errors.push('Enter at least one dBA / duration band.');
			if (errors.length) return { ok: false, errors };

			const result = computeNoiseDose({ bands });
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				`NIOSH allowed time at first band: ${formatFixed(result.niosh.allowedHoursAtFirst, 2)} h (Lc 85 / q 3).`,
				`OSHA dose ${formatFixed(result.osha.dosePct, 1)}% (90 dBA / 5 dB). Allowed at first band: ${formatFixed(result.osha.allowedHoursAtFirst, 2)} h.`,
				result.niosh.twa === null ? 'NIOSH TWA not defined for zero dose.' : `NIOSH TWA ${formatDb(result.niosh.twa)} dBA.`,
				result.osha.twa === null ? 'OSHA TWA not defined for zero dose.' : `OSHA TWA ${formatDb(result.osha.twa)} dBA.`,
				'dBA only. Not a dosimeter. Not compliance. NIOSH 98-126 PDF was unavailable to this prototype.',
			];

			return {
				ok: true,
				rendered: {
					value: formatFixed(result.niosh.dosePct, 1),
					unit: '% NIOSH',
					decision: 'Educational NIOSH dose (85 dBA / 3 dB) — not compliance',
					extras,
					copy: formatNoiseDoseCopy(result),
				},
			};
		},
	});
}
