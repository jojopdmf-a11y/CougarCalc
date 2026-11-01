import { bindCalcForm } from './bind-calc.ts';
import {
	computeFretboardRadius,
	formatRadiusCopy,
	type RadiusMode,
	type RadiusUnit,
} from '../calcs/fretboard-radius.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatInches, formatMm } from '../calcs/format.ts';

function formatLen(value: number, unit: RadiusUnit): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

function currentMode(form: HTMLFormElement): RadiusMode {
	const v = form.querySelector<HTMLInputElement>('input[name="mode"]:checked')?.value;
	if (v === 'radius-from-sagitta' || v === 'conical') return v;
	return 'sagitta';
}

function syncPanels(form: HTMLFormElement): void {
	const mode = currentMode(form);
	form.querySelectorAll<HTMLElement>('[data-mode-panel]').forEach((panel) => {
		panel.hidden = panel.dataset.modePanel !== mode;
	});
}

export function bindFretboardRadiusForm(form: HTMLFormElement): void {
	const unit = form.querySelector<HTMLSelectElement>('#unit')!;
	const radius = form.querySelector<HTMLInputElement>('#radius')!;
	const widthS = form.querySelector<HTMLInputElement>('#width-s')!;
	const sagitta = form.querySelector<HTMLInputElement>('#sagitta')!;
	const widthR = form.querySelector<HTMLInputElement>('#width-r')!;
	const rn = form.querySelector<HTMLInputElement>('#rn')!;
	const sn = form.querySelector<HTMLInputElement>('#sn')!;
	const sf = form.querySelector<HTMLInputElement>('#sf')!;
	const df = form.querySelector<HTMLInputElement>('#df')!;
	const dx = form.querySelector<HTMLInputElement>('#dx')!;

	form.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((radio) => {
		radio.addEventListener('change', () => syncPanels(form));
	});
	form.addEventListener('reset', () => queueMicrotask(() => syncPanels(form)));
	syncPanels(form);

	bindCalcForm(form, {
		emptyMessage: 'Enter radius and width, or sagitta and width, or cone stations',
		isEmpty: () => {
			const mode = currentMode(form);
			if (mode === 'sagitta') return radius.value.trim() === '' && widthS.value.trim() === '';
			if (mode === 'radius-from-sagitta') return sagitta.value.trim() === '' && widthR.value.trim() === '';
			return [rn, sn, sf, df, dx].every((el) => el.value.trim() === '');
		},
		evaluate: () => {
			const mode = currentMode(form);
			const u = unit.value as RadiusUnit;
			if (mode === 'sagitta') {
				const rRaw = parseFiniteNumber(radius.value);
				const wRaw = parseFiniteNumber(widthS.value);
				const errors: string[] = [];
				if (!rRaw.ok) errors.push('Enter radius r greater than zero.');
				if (!wRaw.ok) errors.push('Enter chord width l greater than zero.');
				if (errors.length) return { ok: false, errors };
				if (!rRaw.ok || !wRaw.ok) return { ok: false, errors: ['Fix the inputs'] };
				const result = computeFretboardRadius({ mode, radius: rRaw.value, width: wRaw.value, unit: u });
				if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
				return {
					ok: true,
					rendered: {
						value: formatLen(result.sagitta ?? 0, result.unit),
						unit: result.unit,
						decision: 'Sagitta s for a circular arc. Warmoth pairs are not invented here.',
						extras: [`r = ${formatLen(result.radius ?? 0, result.unit)} ${result.unit}`],
						copy: formatRadiusCopy(result),
					},
				};
			}
			if (mode === 'radius-from-sagitta') {
				const sRaw = parseFiniteNumber(sagitta.value);
				const wRaw = parseFiniteNumber(widthR.value);
				const errors: string[] = [];
				if (!sRaw.ok) errors.push('Enter sagitta s greater than zero.');
				if (!wRaw.ok) errors.push('Enter chord width l greater than zero.');
				if (errors.length) return { ok: false, errors };
				if (!sRaw.ok || !wRaw.ok) return { ok: false, errors: ['Fix the inputs'] };
				const result = computeFretboardRadius({ mode, sagitta: sRaw.value, width: wRaw.value, unit: u });
				if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
				return {
					ok: true,
					rendered: {
						value: formatLen(result.radius ?? 0, result.unit),
						unit: result.unit,
						decision: 'Radius recovered from sagitta. Warmoth pairs are not invented here.',
						extras: [`s = ${formatLen(result.sagitta ?? 0, result.unit)} ${result.unit}`],
						copy: formatRadiusCopy(result),
					},
				};
			}
			const fields = [
				['Rn', rn],
				['Sn', sn],
				['Sf', sf],
				['Df', df],
				['Dx', dx],
			] as const;
			const errors: string[] = [];
			const nums: number[] = [];
			for (const [label, el] of fields) {
				const parsed = parseFiniteNumber(el.value);
				if (!parsed.ok) errors.push(`${label} must be greater than zero for the Hartstein/Mottola cone.`);
				else nums.push(parsed.value);
			}
			if (errors.length) return { ok: false, errors };
			const result = computeFretboardRadius({
				mode: 'conical',
				rn: nums[0],
				sn: nums[1],
				sf: nums[2],
				df: nums[3],
				dx: nums[4],
				unit: u,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };
			return {
				ok: true,
				rendered: {
					value: formatLen(result.rx ?? 0, result.unit),
					unit: result.unit,
					decision: 'Hartstein/Mottola Rx. Warmoth radius pairs were not re-fetched and are not invented.',
					extras: [],
					copy: formatRadiusCopy(result),
				},
			};
		},
	});
}
