import { bindCalcForm } from './bind-calc.ts';
import { computeCardioidSub, formatCardioidCopy } from '../calcs/cardioid-sub.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatDualLength, formatMs, formatSpeed } from '../calcs/format.ts';
import type { TemperatureUnit } from '../calcs/units.ts';

export function bindCardioidSubForm(form: HTMLFormElement): void {
	const freq = form.querySelector<HTMLInputElement>('#freq')!;
	const temperature = form.querySelector<HTMLInputElement>('#temperature')!;
	const tempUnit = form.querySelector<HTMLSelectElement>('#temperature-unit')!;

	form.addEventListener('change', (event) => {
		const target = event.target;
		if (target instanceof HTMLSelectElement && target.id === 'temperature-unit') {
			const parsed = parseFiniteNumber(temperature.value);
			if (parsed.ok) {
				if (target.value === 'F' && parsed.value === 20) temperature.value = '68';
				else if (target.value === 'C' && parsed.value === 68) temperature.value = '20';
			}
		}
	});

	bindCalcForm(form, {
		emptyMessage: 'Enter a frequency',
		isEmpty: () => freq.value.trim() === '',
		evaluate: () => {
			const freqRaw = parseFiniteNumber(freq.value);
			const tempRaw = parseFiniteNumber(temperature.value);
			const errors: string[] = [];
			if (!freqRaw.ok) errors.push('Enter a frequency greater than zero.');
			if (!tempRaw.ok) errors.push('Enter an air temperature.');
			if (errors.length) return { ok: false, errors };
			if (!freqRaw.ok || !tempRaw.ok) return { ok: false, errors: ['Fix the inputs'] };

			const result = computeCardioidSub({
				frequencyHz: freqRaw.value,
				temperature: tempRaw.value,
				temperatureUnit: tempUnit.value === 'F' ? 'F' : ('C' as TemperatureUnit),
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			return {
				ok: true,
				rendered: {
					value: formatMs(result.rearDelayMs),
					unit: 'ms',
					decision: 'Rear sub delay, polarity inverted (not a branded preset)',
					extras: [
						`λ/4 spacing ${formatDualLength(result.spacing_m)} — not λ/2`,
						`Wavelength ${formatDualLength(result.lambda_m)}`,
						`c = ${formatSpeed(result.c_m_s)} m/s (Sengpiel 331.3 + 0.6 × T_C)`,
						'Rear polarity: inverted. Verify with a measurement. Not a manufacturer cardioid mode.',
					],
					copy: formatCardioidCopy(result),
				},
			};
		},
	});
}
