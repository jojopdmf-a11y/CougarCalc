import { bindCalcForm } from './bind-calc.ts';
import { computeBridgePlacement, formatBridgeCopy, type BridgeUnit } from '../calcs/bridge-placement.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: BridgeUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function bindBridgePlacementForm(form: HTMLFormElement): void {
	const scale = form.querySelector<HTMLInputElement>('#scale')!;
	const compensation = form.querySelector<HTMLInputElement>('#compensation')!;
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;

	bindCalcForm(form, {
		emptyMessage: 'Enter a scale length',
		isEmpty: () => scale.value.trim() === '',
		evaluate: () => {
			const scaleRaw = parseFiniteNumber(scale.value);
			const compRaw = parseOptionalFiniteNumber(compensation.value);
			const errors: string[] = [];
			if (!scaleRaw.ok) errors.push('Enter a scale length greater than zero.');
			if (!compRaw.ok) errors.push('Compensation must be a number (0 if none).');
			if (errors.length) return { ok: false, errors };
			if (!scaleRaw.ok || !compRaw.ok) return { ok: false, errors: ['Fix the inputs'] };
			const result = computeBridgePlacement({
				scale: scaleRaw.value,
				compensation: compRaw.value ?? 0,
				unit: unit.value as BridgeUnit,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			return {
				ok: true,
				rendered: {
					value: formatLen(result.speakingLength, result.unit),
					unit: result.unit,
					decision: 'Speaking length ≈ S + compensation along the string path (not centerline).',
					extras: [
						`Break ≈ ${formatLen(result.breakLength, result.unit)} ${result.unit} (≈ S)`,
						`Compensation ${formatLen(result.compensation, result.unit)} ${result.unit} (user-supplied; 0 is allowed)`,
						'Exact compensation millimetres are not a universal figure.',
					],
					copy: formatBridgeCopy(result),
				},
			};
		},
	});
}
