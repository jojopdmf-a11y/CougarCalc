import { bindCalcForm, bindRepeatRows } from './bind-calc.ts';
import {
	computeShowLatency,
	formatShowLatencyCopy,
	type LatencyStage,
	PSW_ROUNDTRIP_GUIDELINE_MS,
} from '../calcs/show-latency.ts';
import { parseFiniteNumber } from '../calcs/parse.ts';
import { formatDualLength, formatMs } from '../calcs/format.ts';

export function bindShowLatencyForm(form: HTMLFormElement): void {
	const list = form.querySelector<HTMLElement>('[data-row-list]')!;
	const addButton = form.querySelector<HTMLButtonElement>('[data-add-row]')!;
	const dante = form.querySelector<HTMLSelectElement>('#dante-hop')!;
	const airPath = form.querySelector<HTMLInputElement>('#air-path')!;

	bindRepeatRows(form, { list, addButton, minRows: 1 });

	bindCalcForm(form, {
		emptyMessage: 'Enter at least one stage',
		isEmpty: () =>
			dante.value === '' &&
			[...list.querySelectorAll<HTMLInputElement>('.js-ms, .js-samples')].every((el) => el.value.trim() === ''),
		evaluate: () => {
			const errors: string[] = [];
			const stages: LatencyStage[] = [];
			list.querySelectorAll<HTMLElement>('[data-row]').forEach((row, i) => {
				const kind = row.querySelector<HTMLSelectElement>('.js-kind')!.value;
				const label = row.querySelector<HTMLInputElement>('.js-label')!.value.trim() || `Stage ${i + 1}`;
				const msEl = row.querySelector<HTMLInputElement>('.js-ms')!;
				const samplesEl = row.querySelector<HTMLInputElement>('.js-samples')!;
				const fsEl = row.querySelector<HTMLInputElement>('.js-fs')!;
				if (kind === 'samples') {
					if (samplesEl.value.trim() === '' && msEl.value.trim() === '') return;
					const samplesRaw = parseFiniteNumber(samplesEl.value);
					const fsRaw = parseFiniteNumber(fsEl.value);
					if (!samplesRaw.ok) errors.push(`Stage ${i + 1}: sample count must be ≥ 0.`);
					if (!fsRaw.ok) errors.push(`Stage ${i + 1}: sample rate must be greater than zero.`);
					if (samplesRaw.ok && fsRaw.ok) {
						stages.push({ label, samples: samplesRaw.value, sampleRate: fsRaw.value });
					}
				} else {
					if (msEl.value.trim() === '') return;
					const msRaw = parseFiniteNumber(msEl.value);
					if (!msRaw.ok) errors.push(`Stage ${i + 1}: time must be ≥ 0 ms.`);
					else stages.push({ label, ms: msRaw.value });
				}
			});
			if (dante.value !== '') {
				const hopMs = Number(dante.value);
				const label = dante.selectedOptions[0]?.text ?? `Dante ${hopMs} ms`;
				stages.push({ label, ms: hopMs });
			}
			if (stages.length === 0) errors.push('Add at least one stage, or pick a Dante hop row.');
			if (errors.length) return { ok: false, errors };

			const result = computeShowLatency({ stages, includeAirPath: airPath.checked });
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				...result.stageMs.map((ms, i) => `${stages[i]?.label ?? `Stage ${i + 1}`}: ${formatMs(ms)} ms`),
				'Controller latency is not analog I/O latency.',
				`PSW ~${PSW_ROUNDTRIP_GUIDELINE_MS} ms in-ear round trip is a guideline, not a law.`,
				result.airPath_m === null
					? 'Air path not requested.'
					: `Equivalent air path ${formatDualLength(result.airPath_m)} at 343.3 m/s (20 °C).`,
			];

			return {
				ok: true,
				rendered: {
					value: formatMs(result.totalMs),
					unit: 'ms',
					decision: 'Series total (not analog I/O by itself)',
					extras,
					copy: formatShowLatencyCopy(result),
				},
			};
		},
	});
}
