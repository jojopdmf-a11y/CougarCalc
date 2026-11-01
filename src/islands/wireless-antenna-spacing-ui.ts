import { bindCalcForm } from './bind-calc.ts';
import { computeWirelessSpacing, formatWirelessCopy } from '../calcs/wireless-antenna.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatDb, formatDualLength, formatFixed } from '../calcs/format.ts';
import type { LengthUnit } from '../calcs/units.ts';

export function bindWirelessAntennaForm(form: HTMLFormElement): void {
	const freq = form.querySelector<HTMLInputElement>('#freq-mhz')!;
	const applyCoax = form.querySelector<HTMLInputElement>('#apply-coax')!;
	const coaxLength = form.querySelector<HTMLInputElement>('#coax-length')!;
	const coaxUnit = form.querySelector<HTMLSelectElement>('#coax-unit')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter a frequency',
		isEmpty: () => freq.value.trim() === '',
		evaluate: () => {
			const freqRaw = parseFiniteNumber(freq.value);
			const errors: string[] = [];
			if (!freqRaw.ok) errors.push('Enter a frequency in MHz greater than zero.');
			let coax: number | undefined;
			if (applyCoax.checked) {
				const lenRaw = parseFiniteNumber(coaxLength.value);
				if (!lenRaw.ok) errors.push('Enter a coax length ≥ 0, or leave coax off.');
				else coax = lenRaw.value;
			}
			if (errors.length) return { ok: false, errors };
			if (!freqRaw.ok) return { ok: false, errors: ['Fix the inputs'] };

			const result = computeWirelessSpacing({
				frequencyHz: freqRaw.value * 1e6,
				applyCoax: applyCoax.checked,
				coaxLength: coax,
				coaxLengthUnit: coaxUnit.value as LengthUnit,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				`Exact λ = c/f = ${formatDualLength(result.lambda_m)}`,
				`300/f_MHz ≈ ${formatDualLength(result.lambdaApprox_m)}`,
				`c = 2.99792458×10⁸ m/s (not 343 m/s, not 468/f)`,
				result.coaxNote,
			];
			if (result.coaxLossDb !== null) {
				extras.push(`Coax loss ${formatDb(result.coaxLossDb)} dB (9913 @ 700 MHz α only)`);
			}

			return {
				ok: true,
				rendered: {
					value: formatFixed(result.quarterWave_m, 3),
					unit: 'm',
					decision: `Diversity minimum ¼λ (${formatDualLength(result.quarterWave_m)})`,
					extras,
					copy: formatWirelessCopy(result),
				},
			};
		},
	});
}
