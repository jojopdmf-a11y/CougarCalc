import { bindCalcForm, bindRepeatRows } from './bind-calc.ts';
import { computeSpeakerImpedance, formatImpedanceCopy, type ImpedanceMode } from '../calcs/speaker-impedance.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatFixed, formatOhms } from '../calcs/format.ts';

export function bindSpeakerImpedanceForm(form: HTMLFormElement): void {
	const list = form.querySelector<HTMLElement>('[data-row-list]')!;
	const addButton = form.querySelector<HTMLButtonElement>('[data-add-row]')!;
	const voltage = form.querySelector<HTMLInputElement>('#voltage')!;

	bindRepeatRows(form, { list, addButton, minRows: 2 });

	bindCalcForm(form, {
		emptyMessage: 'Enter cabinet impedances',
		isEmpty: () => [...list.querySelectorAll<HTMLInputElement>('.js-z')].every((el) => el.value.trim() === ''),
		evaluate: () => {
			const mode = (form.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value ??
				'parallel') as ImpedanceMode;
			const errors: string[] = [];
			const impedances: number[] = [];
			list.querySelectorAll<HTMLElement>('[data-row]').forEach((row, i) => {
				const zEl = row.querySelector<HTMLInputElement>('.js-z')!;
				if (zEl.value.trim() === '') return;
				const zRaw = parseFiniteNumber(zEl.value);
				if (!zRaw.ok) errors.push(`Cabinet ${i + 1}: Z must be greater than zero.`);
				else impedances.push(zRaw.value);
			});
			const vRaw = parseOptionalFiniteNumber(voltage.value);
			if (!vRaw.ok) errors.push('SpeakON voltage must be ≥ 0, or left empty.');
			if (impedances.length === 0) errors.push('Enter at least one cabinet impedance.');
			if (errors.length) return { ok: false, errors };

			const result = computeSpeakerImpedance({
				mode,
				impedances,
				voltageV: vRaw.ok && vRaw.value !== null ? vRaw.value : undefined,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				result.zPerChannel === null
					? `${mode} combination of ${impedances.length} cabinet(s).`
					: `Bridged Z_ch = ${formatOhms(result.zPerChannel)} Ω (Z_load/2). Each amplifier half sees half the load.`,
				'No mains / breaker calculation. No 2× or 4× power invention.',
			];
			if (result.currentA !== null && result.powerW !== null) {
				extras.push(`I = ${formatFixed(result.currentA, 2)} A, P = ${formatFixed(result.powerW, 1)} W at the speakON.`);
			}

			return {
				ok: true,
				rendered: {
					value: formatOhms(result.zLoad),
					unit: 'Ω',
					decision: mode === 'bridged' ? 'Z_load at the bridged speakON' : `Z_load (${mode})`,
					extras,
					copy: formatImpedanceCopy(result),
				},
			};
		},
	});
}
