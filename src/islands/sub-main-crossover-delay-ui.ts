import { bindCalcForm } from './bind-calc.ts';
import { computeSubMainDelay, formatSubMainCopy } from '../calcs/sub-main-delay.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatDualLength, formatFixed, formatMs, formatSpeed } from '../calcs/format.ts';
import type { LengthUnit, TemperatureUnit } from '../calcs/units.ts';

export function bindSubMainDelayForm(form: HTMLFormElement): void {
	const pathSub = form.querySelector<HTMLInputElement>('#path-sub')!;
	const pathMain = form.querySelector<HTMLInputElement>('#path-main')!;
	const pathUnit = form.querySelector<HTMLSelectElement>('#path-unit')!;
	const temperature = form.querySelector<HTMLInputElement>('#temperature')!;
	const tempUnit = form.querySelector<HTMLSelectElement>('#temperature-unit')!;
	const filterDelay = form.querySelector<HTMLInputElement>('#filter-delay')!;
	const crossoverHz = form.querySelector<HTMLInputElement>('#crossover-hz')!;

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
		emptyMessage: 'Enter both path lengths',
		isEmpty: () => pathSub.value.trim() === '' && pathMain.value.trim() === '',
		evaluate: () => {
			const subRaw = parseFiniteNumber(pathSub.value);
			const mainRaw = parseFiniteNumber(pathMain.value);
			const tempRaw = parseFiniteNumber(temperature.value);
			const filterRaw = parseOptionalFiniteNumber(filterDelay.value);
			const fcRaw = parseOptionalFiniteNumber(crossoverHz.value);
			const errors: string[] = [];
			if (!subRaw.ok) errors.push('Enter a sub path greater than zero.');
			if (!mainRaw.ok) errors.push('Enter a main path greater than zero.');
			if (!tempRaw.ok) errors.push('Enter an air temperature.');
			if (!filterRaw.ok) errors.push('Filter delay must be ≥ 0 ms, or left empty for none.');
			if (!fcRaw.ok) errors.push('Crossover frequency must be greater than zero, or left empty.');
			if (errors.length) return { ok: false, errors };
			if (!subRaw.ok || !mainRaw.ok || !tempRaw.ok || !filterRaw.ok || !fcRaw.ok) {
				return { ok: false, errors: ['Fix the inputs'] };
			}

			const result = computeSubMainDelay({
				pathSub: subRaw.value,
				pathMain: mainRaw.value,
				lengthUnit: pathUnit.value as LengthUnit,
				temperature: tempRaw.value,
				temperatureUnit: tempUnit.value === 'F' ? 'F' : ('C' as TemperatureUnit),
				filterDelayMs: filterRaw.value,
				crossoverHz: fcRaw.value,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const channel =
				result.delayChannel === 'none'
					? 'Paths equal — no geometric delay.'
					: `Delay the ${result.delayChannel} (earlier) path.`;

			const extras = [
				`Geometric ${formatMs(result.geometricMs)} ms`,
				`Filter note ${formatMs(result.filterDelayMs)} ms (empty = 0; not modeled phase)`,
				`Sub ${formatDualLength(result.pathSub_m)}, main ${formatDualLength(result.pathMain_m)}`,
				`c = ${formatSpeed(result.c_m_s)} m/s (331.3 + 0.606×T_C; 343.42 at 20 °C, not speaker-delay 343.3)`,
				'Physics only — not a SubAligner trace.',
			];
			if (result.phaseDeg !== null) {
				extras.push(`Geometric φ ${formatFixed(result.phaseDeg, 1)}° = 360·fc·Δt, wrap ±180°`);
			}

			return {
				ok: true,
				rendered: {
					value: formatMs(result.t_set),
					unit: 'ms',
					decision: channel,
					extras,
					copy: formatSubMainCopy(result),
				},
			};
		},
	});
}
