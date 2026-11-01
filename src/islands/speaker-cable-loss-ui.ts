import { bindCalcForm } from './bind-calc.ts';
import {
	AWG_UNCITED_REFUSAL,
	computeSpeakerCableLoss,
	formatCableLossCopy,
	type DcrUnit,
} from '../calcs/speaker-cable-loss.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatDb, formatFixed, formatOhms } from '../calcs/format.ts';
import type { LengthUnit } from '../calcs/units.ts';

export function bindSpeakerCableLossForm(form: HTMLFormElement): void {
	const length = form.querySelector<HTMLInputElement>('#length')!;
	const lengthUnit = form.querySelector<HTMLSelectElement>('#length-unit')!;
	const dcr = form.querySelector<HTMLInputElement>('#dcr')!;
	const dcrUnit = form.querySelector<HTMLSelectElement>('#dcr-unit')!;
	const loadZ = form.querySelector<HTMLInputElement>('#load-z')!;
	const re = form.querySelector<HTMLInputElement>('#re')!;
	const zamp = form.querySelector<HTMLInputElement>('#zamp')!;

	function showRefuse(message: string): void {
		const resultHost = form.querySelector<HTMLElement>('[data-result-value]');
		const decision = form.querySelector<HTMLElement>('[data-decision]');
		const extras = form.querySelector<HTMLElement>('[data-extras]');
		const errors = form.querySelector<HTMLElement>('[data-errors]');
		const errorList = form.querySelector<HTMLElement>('[data-error-list]');
		if (resultHost) resultHost.textContent = '—';
		if (decision) decision.textContent = 'Fix the inputs';
		if (extras) extras.replaceChildren();
		if (errors) errors.hidden = false;
		if (errorList) {
			errorList.replaceChildren();
			const li = document.createElement('li');
			li.textContent = message;
			errorList.append(li);
		}
	}

	form.querySelectorAll<HTMLButtonElement>('[data-awg-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			dcr.value = chip.dataset.dcr ?? '';
			dcrUnit.value = 'ohm-per-kft';
			form.querySelectorAll<HTMLButtonElement>('[data-awg-chip], [data-awg-refuse]').forEach((other) => {
				other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
			});
			form.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});

	form.querySelectorAll<HTMLButtonElement>('[data-awg-refuse]').forEach((chip) => {
		chip.addEventListener('click', () => {
			form.querySelectorAll<HTMLButtonElement>('[data-awg-chip], [data-awg-refuse]').forEach((other) => {
				other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
			});
			showRefuse(AWG_UNCITED_REFUSAL);
		});
	});

	dcr.addEventListener('input', () => {
		form.querySelectorAll<HTMLButtonElement>('[data-awg-refuse]').forEach((chip) => {
			chip.setAttribute('aria-pressed', 'false');
		});
	});

	bindCalcForm(form, {
		emptyMessage: 'Enter cable length and a DCR',
		isEmpty: () => length.value.trim() === '' && dcr.value.trim() === '' && loadZ.value.trim() === '',
		evaluate: () => {
			const refused = [...form.querySelectorAll<HTMLButtonElement>('[data-awg-refuse]')].find(
				(chip) => chip.getAttribute('aria-pressed') === 'true',
			);
			if (refused) {
				return { ok: false, errors: [AWG_UNCITED_REFUSAL] };
			}
			const lengthRaw = parseFiniteNumber(length.value);
			const dcrRaw = parseFiniteNumber(dcr.value);
			const zRaw = parseFiniteNumber(loadZ.value);
			const reRaw = parseOptionalFiniteNumber(re.value);
			const zampRaw = parseOptionalFiniteNumber(zamp.value);
			const errors: string[] = [];
			if (!lengthRaw.ok) errors.push('Enter a cable length greater than zero.');
			if (!dcrRaw.ok) errors.push('Enter a custom DCR, or pick the cited 12 AWG cell.');
			if (!zRaw.ok) errors.push('Enter load Z greater than zero.');
			if (!reRaw.ok) errors.push('Re must be greater than zero, or left empty to skip DF.');
			if (!zampRaw.ok) errors.push('Amplifier source Z must be ≥ 0, or left empty to skip DF.');
			if (errors.length) return { ok: false, errors };
			if (!lengthRaw.ok || !dcrRaw.ok || !zRaw.ok || !reRaw.ok || !zampRaw.ok) {
				return { ok: false, errors: ['Fix the inputs'] };
			}

			const cited12 = form.querySelector<HTMLButtonElement>('[data-awg-chip][aria-pressed="true"]');
			const result = computeSpeakerCableLoss({
				length: lengthRaw.value,
				lengthUnit: lengthUnit.value as LengthUnit,
				dcr: dcrRaw.value,
				dcrUnit: dcrUnit.value as DcrUnit,
				awgPreset: cited12?.dataset.awg ?? undefined,
				loadZ: zRaw.value,
				reOhm: reRaw.value,
				zAmpOhm: zampRaw.value,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				`Loop R ${formatOhms(result.loopR)} Ω (${formatFixed(result.length_ft, 2)} ft one-way × 2 conductors)`,
				`Voltage ratio ${formatFixed(result.voltageRatio, 4)} = Z / (Z + R)`,
				`Lumen shortfall ${formatFixed(result.powerShortfallPct, 2)}% = 100 × (1 − ratio²)`,
				`BoomSpeaker R/(R+Z) ${formatFixed(result.resistanceRatioPct, 2)}% — a different percentage, shown on purpose`,
				`DCR ${result.dcrOhmPerKft} Ω/kft (${result.dcrSource})`,
			];
			if (result.dampingFactor === null) {
				extras.push('Damping factor not computed — enter Re and Zamp (no baked Re).');
			} else {
				extras.push(`Damping factor ${formatFixed(result.dampingFactor, 1)} = Re / (Zamp + Rcable)`);
			}

			return {
				ok: true,
				rendered: {
					value: formatDb(result.attenDb),
					unit: 'dB',
					decision: 'Voltage attenuation (speaker-level copper, not 70 V, not NEC)',
					extras,
					copy: formatCableLossCopy(result),
				},
			};
		},
	});
}
