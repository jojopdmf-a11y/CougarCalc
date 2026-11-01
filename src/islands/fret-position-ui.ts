import {
	computeFretPositions,
	DEFAULT_FRET_COUNT,
	formatFretCopy,
	formatFretTableTsv,
	formatScaleDisplay,
	type ScaleUnit,
} from '../calcs/fret-position.ts';
import { parseFiniteNumber, parseInteger, parseOptionalFiniteNumber } from '../calcs/parse.ts';

function scaleUnit(value: string): ScaleUnit {
	return value === 'mm' ? 'mm' : 'in';
}

const SCALE_SOURCES: Record<string, string> = {
	'25.5-in': 'StewMac lists 25.5 in as a Fender-style scale. Conversion: 25.500 × 25.4 = 647.7 mm. Not a maker spec from this site.',
	'650-mm': '650 mm is a common metric scale. It is not 25.5 in (25.500 × 25.4 = 647.7 mm).',
	'660-mm': '660 mm is a common metric scale. Convert separately; do not treat it as 25.5 in.',
};

export function bindFretPositionForm(form: HTMLFormElement): void {
	const errorsEl = form.querySelector<HTMLElement>('[data-errors]')!;
	const errorList = form.querySelector<HTMLElement>('[data-error-list]')!;
	const resultValue = form.querySelector<HTMLElement>('[data-twelfth]')!;
	const decisionEl = form.querySelector<HTMLElement>('[data-decision]')!;
	const extrasEl = form.querySelector<HTMLElement>('[data-extras]')!;
	const tableBody = form.querySelector<HTMLElement>('[data-table-body]')!;
	const copyBtn = form.querySelector<HTMLButtonElement>('[data-copy]')!;
	const copyTsvBtn = form.querySelector<HTMLButtonElement>('[data-copy-tsv]')!;
	const copyStatus = form.querySelector<HTMLElement>('[data-copy-status]')!;
	const scaleInput = form.querySelector<HTMLInputElement>('#scale-length')!;
	const unitSelect = form.querySelector<HTMLSelectElement>('#scale-unit')!;
	const fretInput = form.querySelector<HTMLInputElement>('#fret-count')!;
	const kerfInput = form.querySelector<HTMLInputElement>('#kerf')!;
	const sourceEl = form.querySelector<HTMLElement>('[data-scale-source]')!;
	const fretboard = form.querySelector<HTMLElement>('[data-fretboard]')!;
	const printScale = form.querySelector<HTMLElement>('[data-print-scale]')!;

	let lastCopy = '';
	let lastTsv = '';

	function setEmptyCard(): void {
		resultValue.replaceChildren(document.createTextNode('—'));
		decisionEl.textContent = 'Enter a scale length';
		extrasEl.replaceChildren();
		tableBody.replaceChildren();
		copyBtn.disabled = true;
		copyTsvBtn.disabled = true;
		lastCopy = '';
		lastTsv = '';
		fretboard.replaceChildren();
		printScale.textContent = '';
	}

	function render(): void {
		copyStatus.hidden = true;
		scaleInput.removeAttribute('aria-invalid');
		fretInput.removeAttribute('aria-invalid');
		kerfInput.removeAttribute('aria-invalid');

		if (scaleInput.value.trim() === '') {
			errorsEl.hidden = true;
			setEmptyCard();
			return;
		}

		const scaleRaw = parseFiniteNumber(scaleInput.value);
		const fretRaw =
			fretInput.value.trim() === '' ? { ok: true as const, value: DEFAULT_FRET_COUNT } : parseInteger(fretInput.value);
		const kerfRaw = parseOptionalFiniteNumber(kerfInput.value);
		const formErrors: string[] = [];

		if (!scaleRaw.ok) {
			formErrors.push(scaleRaw.reason === 'empty' ? 'Enter a scale length.' : 'Scale length is not a number.');
			scaleInput.setAttribute('aria-invalid', 'true');
		}
		if (!fretRaw.ok) {
			formErrors.push('Fret count must be a whole number.');
			fretInput.setAttribute('aria-invalid', 'true');
		}
		if (!kerfRaw.ok) {
			formErrors.push('Kerf must be a number, or left blank.');
			kerfInput.setAttribute('aria-invalid', 'true');
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

		if (!scaleRaw.ok || !fretRaw.ok || !kerfRaw.ok) return;

		const unit = scaleUnit(unitSelect.value);
		const result = computeFretPositions({
			scale: scaleRaw.value,
			scaleUnit: unit,
			fretCount: fretRaw.value,
			outputUnit: unit,
			kerf: kerfRaw.value ?? undefined,
		});

		if (!result.ok) {
			for (const err of result.errors) {
				if (err.field === 'scale') scaleInput.setAttribute('aria-invalid', 'true');
				if (err.field === 'fretCount') fretInput.setAttribute('aria-invalid', 'true');
				if (err.field === 'kerf') kerfInput.setAttribute('aria-invalid', 'true');
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
		copyTsvBtn.disabled = false;

		resultValue.innerHTML = '';
		resultValue.append(document.createTextNode(formatScaleDisplay(result.twelfthFret, result.scaleUnit)));
		const unitEl = document.createElement('span');
		unitEl.className = 'result-unit';
		unitEl.textContent = result.scaleUnit;
		resultValue.append(unitEl);

		decisionEl.textContent = `12th fret ${formatScaleDisplay(result.twelfthFret, result.scaleUnit)} ${result.scaleUnit} = S/2`;

		const check = document.createElement('li');
		check.className = result.twelfthEqualsHalf ? 'check-pass' : 'check-fail';
		check.textContent = result.twelfthCheck;
		const extras = [
			check,
			...[
				`${formatScaleDisplay(result.scale, result.scaleUnit)} ${result.scaleUnit} scale`,
				`${result.fretCount} frets, 12-TET from nut face`,
				result.kerf === null
					? 'Kerf not applied. Slot center = d(n).'
					: `Kerf ${formatScaleDisplay(result.kerf, result.scaleUnit)} ${result.scaleUnit} recorded; slot center still = d(n). No universal clearance.`,
			].map((text) => {
				const li = document.createElement('li');
				li.textContent = text;
				return li;
			}),
		];
		extrasEl.replaceChildren(...extras);

		tableBody.replaceChildren(
			...result.rows.map((row) => {
				const tr = document.createElement('tr');
				if (row.fret === 12) tr.className = 'fret-12';
				const th = document.createElement('th');
				th.scope = 'row';
				th.textContent = String(row.fret);
				const td1 = document.createElement('td');
				td1.textContent = formatScaleDisplay(row.distanceFromNut, result.scaleUnit);
				const td2 = document.createElement('td');
				td2.textContent = formatScaleDisplay(row.fretToFret, result.scaleUnit);
				tr.append(th, td1, td2);
				return tr;
			}),
		);

		fretboard.replaceChildren();
		const nut = document.createElement('span');
		nut.className = 'fret-mark nut';
		nut.style.left = '0';
		fretboard.append(nut);
		for (const row of result.rows) {
			const mark = document.createElement('span');
			mark.className = row.fret === 12 ? 'fret-mark twelfth' : 'fret-mark';
			mark.style.left = `${(row.distanceFromNut / result.scale) * 100}%`;
			mark.title = `${row.fret}`;
			fretboard.append(mark);
		}

		printScale.textContent = `Scale ${formatScaleDisplay(result.scale, result.scaleUnit)} ${result.scaleUnit}`;

		lastCopy = formatFretCopy(result);
		lastTsv = formatFretTableTsv(result);
	}

	form.addEventListener('input', render);
	form.addEventListener('change', render);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		render();
	});

	form.querySelectorAll<HTMLButtonElement>('[data-scale-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			scaleInput.value = chip.dataset.scale ?? '';
			unitSelect.value = chip.dataset.unit ?? 'in';
			sourceEl.textContent = SCALE_SOURCES[chip.dataset.source ?? ''] ?? '';
			render();
		});
	});

	form.querySelectorAll<HTMLButtonElement>('[data-n-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			fretInput.value = chip.dataset.n ?? '22';
			render();
		});
	});

	form.addEventListener('reset', () => {
		sourceEl.textContent =
			'Chips cite published common scales. 650 mm is not 25.5 in (25.500 × 25.4 = 647.7 mm).';
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
			copyStatus.textContent = 'Copy failed.';
		}
	});

	copyTsvBtn.addEventListener('click', async () => {
		if (!lastTsv) return;
		try {
			await navigator.clipboard.writeText(lastTsv);
			copyStatus.hidden = false;
			copyStatus.textContent = 'Copied table as TSV.';
		} catch {
			copyStatus.hidden = false;
			copyStatus.textContent = 'Copy failed.';
		}
	});

	render();
}
