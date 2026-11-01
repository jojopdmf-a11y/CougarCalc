import {
	computeSpeakerDelay,
	equivalentDistanceIn,
	formatDelayCopy,
	formatDelayMsDisplay,
	HAAS_SUGGESTION_MS,
	type FillType,
} from '../calcs/speaker-delay.ts';
import { formatSamples, formatSpeed, unitLabel } from '../calcs/format.ts';
import { parseFiniteNumber, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import type { LengthUnit, TemperatureUnit } from '../calcs/units.ts';

function lengthUnit(value: string): LengthUnit {
	if (value === 'ft' || value === 'in' || value === 'm') return value;
	return 'm';
}

function fillType(value: string): FillType {
	if (value === 'front-fill' || value === 'underbalcony' || value === 'delay-tower') return value;
	return 'none';
}

export function bindSpeakerDelayForm(form: HTMLFormElement): void {
	const errorsEl = form.querySelector<HTMLElement>('[data-errors]')!;
	const errorList = form.querySelector<HTMLElement>('[data-error-list]')!;
	const resultValue = form.querySelector<HTMLElement>('[data-delay-ms]')!;
	const decisionEl = form.querySelector<HTMLElement>('[data-decision]')!;
	const extrasEl = form.querySelector<HTMLElement>('[data-extras]')!;
	const copyBtn = form.querySelector<HTMLButtonElement>('[data-copy]')!;
	const copyStatus = form.querySelector<HTMLElement>('[data-copy-status]')!;
	const cDrawer = form.querySelector<HTMLElement>('[data-c-value]')!;
	const pathA = form.querySelector<HTMLInputElement>('#path-a')!;
	const pathB = form.querySelector<HTMLInputElement>('#path-b')!;
	const unit = form.querySelector<HTMLSelectElement>('#path-unit')!;
	const temperature = form.querySelector<HTMLInputElement>('#temperature')!;
	const tempUnit = form.querySelector<HTMLSelectElement>('#temperature-unit')!;
	const haas = form.querySelector<HTMLInputElement>('#haas-ms')!;
	const latA = form.querySelector<HTMLInputElement>('#latency-a')!;
	const latB = form.querySelector<HTMLInputElement>('#latency-b')!;
	const sampleRate = form.querySelector<HTMLSelectElement>('#sample-rate')!;

	let lastCopy = '';
	let lastFill: FillType = 'none';

	function setEmptyCard(): void {
		resultValue.replaceChildren(document.createTextNode('—'));
		decisionEl.textContent = 'Enter both paths';
		extrasEl.replaceChildren();
		copyBtn.disabled = true;
		lastCopy = '';
		cDrawer.textContent = 'Enter paths and temperature to see c.';
	}

	function render(): void {
		copyStatus.hidden = true;
		for (const el of [pathA, pathB, temperature, haas, latA, latB]) {
			el.removeAttribute('aria-invalid');
		}

		if (pathA.value.trim() === '' && pathB.value.trim() === '') {
			errorsEl.hidden = true;
			setEmptyCard();
			return;
		}

		const pathARaw = parseFiniteNumber(pathA.value);
		const pathBRaw = parseFiniteNumber(pathB.value);
		const tempRaw = parseFiniteNumber(temperature.value);
		const haasRaw = parseOptionalFiniteNumber(haas.value);
		const latARaw = parseOptionalFiniteNumber(latA.value);
		const latBRaw = parseOptionalFiniteNumber(latB.value);
		const formErrors: string[] = [];

		if (!pathARaw.ok) {
			formErrors.push(pathARaw.reason === 'empty' ? 'Enter a path length for A.' : 'Path A is not a number.');
			pathA.setAttribute('aria-invalid', 'true');
		}
		if (!pathBRaw.ok) {
			formErrors.push(pathBRaw.reason === 'empty' ? 'Enter a path length for B.' : 'Path B is not a number.');
			pathB.setAttribute('aria-invalid', 'true');
		}
		if (!tempRaw.ok) {
			formErrors.push(tempRaw.reason === 'empty' ? 'Enter an air temperature.' : 'Temperature is not a number.');
			temperature.setAttribute('aria-invalid', 'true');
		}
		if (!haasRaw.ok) {
			formErrors.push('Haas extra must be a number, or left blank for 0 ms.');
			haas.setAttribute('aria-invalid', 'true');
		}
		if (!latARaw.ok) {
			formErrors.push('Path A latency must be a number, or left blank for 0 ms.');
			latA.setAttribute('aria-invalid', 'true');
		}
		if (!latBRaw.ok) {
			formErrors.push('Path B latency must be a number, or left blank for 0 ms.');
			latB.setAttribute('aria-invalid', 'true');
		}

		if (formErrors.length > 0) {
			errorList.replaceChildren(
				...formErrors.map((message) => {
					const li = document.createElement('li');
					li.textContent = message;
					return li;
				}),
			);
			errorsEl.hidden = false;
			setEmptyCard();
			decisionEl.textContent = 'Fix the inputs';
			return;
		}

		if (!pathARaw.ok || !pathBRaw.ok || !tempRaw.ok || !haasRaw.ok || !latARaw.ok || !latBRaw.ok) {
			return;
		}

		const result = computeSpeakerDelay({
			pathA: pathARaw.value,
			pathB: pathBRaw.value,
			lengthUnit: lengthUnit(unit.value),
			temperature: tempRaw.value,
			temperatureUnit: tempUnit.value === 'F' ? 'F' : ('C' as TemperatureUnit),
			haasMs: haasRaw.value ?? 0,
			latencyAMs: latARaw.value ?? 0,
			latencyBMs: latBRaw.value ?? 0,
			sampleRate: Number(sampleRate.value),
		});

		if (!result.ok) {
			for (const err of result.errors) {
				const map: Record<string, HTMLElement | undefined> = {
					pathA,
					pathB,
					temperature,
					haasMs: haas,
					latencyA: latA,
					latencyB: latB,
				};
				map[err.field]?.setAttribute('aria-invalid', 'true');
			}
			errorList.replaceChildren(
				...result.errors.map((err) => {
					const li = document.createElement('li');
					li.textContent = err.message;
					return li;
				}),
			);
			errorsEl.hidden = false;
			setEmptyCard();
			decisionEl.textContent = 'Fix the inputs';
			return;
		}

		errorsEl.hidden = true;
		copyBtn.disabled = false;

		resultValue.innerHTML = '';
		resultValue.append(document.createTextNode(formatDelayMsDisplay(result.t_set)));
		const unitSpan = document.createElement('span');
		unitSpan.className = 'result-unit';
		unitSpan.textContent = 'ms';
		resultValue.append(unitSpan);

		decisionEl.textContent = result.delayChannelLabel;

		const lu = lengthUnit(unit.value);
		const eq = equivalentDistanceIn(result.pathDifference_m, lu);
		const extras = [
			`Geometric ${formatDelayMsDisplay(result.delay_ms)} ms`,
			result.haasMs === 0
				? 'Haas extra 0 ms'
				: `Haas extra ${Number.isInteger(result.haasMs) ? String(result.haasMs) : formatDelayMsDisplay(result.haasMs)} ms`,
			result.fartherPath === 'none'
				? 'Paths are the same length'
				: `Farther path is path ${result.fartherPath}`,
			`Path difference ${eq.toFixed(3)} ${unitLabel(lu)}`,
			`c = ${formatSpeed(result.c_m_s)} m/s`,
			`Samples ${formatSamples(result.samples)} (unrounded) at ${sampleRate.value} Hz`,
			`nearest sample ${result.nearestSample}`,
		];
		extrasEl.replaceChildren(
			...extras.map((text) => {
				const li = document.createElement('li');
				li.textContent = text;
				return li;
			}),
		);

		cDrawer.textContent = `${formatSpeed(result.c_m_s)} m/s  =  331.3 + 0.6 × ${result.temperatureC}  (Sengpiel simplified)`;
		lastCopy = formatDelayCopy(result);
	}

	form.addEventListener('input', render);
	form.addEventListener('change', (event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement && target.name === 'fill-type') {
			const next = fillType(target.value);
			if (next !== lastFill) {
				haas.value = String(HAAS_SUGGESTION_MS[next]);
				lastFill = next;
			}
		}
		if (target instanceof HTMLSelectElement && target.id === 'temperature-unit') {
			const parsed = parseFiniteNumber(temperature.value);
			if (parsed.ok) {
				if (target.value === 'F' && parsed.value === 20) temperature.value = '68';
				else if (target.value === 'C' && parsed.value === 68) temperature.value = '20';
			}
		}
		render();
	});
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		render();
	});

	form.addEventListener('reset', () => {
		lastFill = 'none';
		copyStatus.hidden = true;
		queueMicrotask(render);
	});

	copyBtn.addEventListener('click', async () => {
		if (!lastCopy) return;
		try {
			await navigator.clipboard.writeText(lastCopy);
			copyStatus.hidden = false;
			copyStatus.textContent = 'Copied result.';
		} catch {
			copyStatus.hidden = false;
			copyStatus.textContent = 'Copy failed. Select the result and copy it manually.';
		}
	});

	render();
}
