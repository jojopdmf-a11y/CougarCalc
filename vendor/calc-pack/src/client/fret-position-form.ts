import {
	computeFretPositions,
	DEFAULT_FRET_COUNT,
	type ScaleUnit,
} from '../calc/fret-position.ts';
import { formatScale } from '../calc/format.ts';
import { parseFiniteNumber, parseInteger } from '../calc/parse.ts';

function scaleUnit(value: string): ScaleUnit {
	return value === 'mm' ? 'mm' : 'in';
}

function formatCopy(
	result: Extract<ReturnType<typeof computeFretPositions>, { ok: true }>,
): string {
	const unit = result.scaleUnit;
	const header = [
		'CougarCalc — Fret position calculator (12-TET)',
		`Scale: ${formatScale(result.scale, unit)} ${unit}`,
		`Frets: ${result.fretCount}`,
		`d(12) = ${formatScale(result.twelfthFret, unit)} ${unit} (S/2 = ${formatScale(result.halfScale, unit)} ${unit})`,
		result.showRuleOf18 ? 'Rule of 18 comparison: on (historical, not 12-TET)' : 'Rule of 18 comparison: off',
		'',
		result.showRuleOf18
			? 'fret\tnut 12-TET\tfret-to-fret\tnut Rule of 18'
			: 'fret\tnut 12-TET\tfret-to-fret',
	];
	const rows = result.rows.map((row) => {
		const tet = `${row.fret}\t${formatScale(row.distanceFromNut, unit)}\t${formatScale(row.fretToFret, unit)}`;
		if (!result.showRuleOf18 || row.ruleOf18FromNut === null) return tet;
		return `${tet}\t${formatScale(row.ruleOf18FromNut, unit)}`;
	});
	return [...header, ...rows].join('\n');
}

export function bindFretPositionForm(form: HTMLFormElement): void {
	const errorsEl = form.querySelector<HTMLElement>('[data-errors]')!;
	const errorList = form.querySelector<HTMLElement>('[data-error-list]')!;
	const idleEl = form.querySelector<HTMLElement>('[data-idle]')!;
	const resultEl = form.querySelector<HTMLElement>('[data-result]')!;
	const delayValue = form.querySelector<HTMLElement>('[data-twelfth]')!;
	const channelEl = form.querySelector<HTMLElement>('[data-twelfth-note]')!;
	const tableBody = form.querySelector<HTMLElement>('[data-table-body]')!;
	const extraHead = form.querySelector<HTMLElement>('[data-rule18-head]')!;
	const copyBtn = form.querySelector<HTMLButtonElement>('[data-copy]')!;
	const copyStatus = form.querySelector<HTMLElement>('[data-copy-status]')!;
	const resetBtn = form.querySelector<HTMLButtonElement>('[data-reset]')!;
	const scaleInput = form.querySelector<HTMLInputElement>('#scale-length')!;
	const unitSelect = form.querySelector<HTMLSelectElement>('#scale-unit')!;
	const fretInput = form.querySelector<HTMLInputElement>('#fret-count')!;
	const rule18 = form.querySelector<HTMLInputElement>('#rule-of-18')!;

	let lastCopy = '';

	function render(): void {
		copyStatus.hidden = true;
		scaleInput.removeAttribute('aria-invalid');
		fretInput.removeAttribute('aria-invalid');

		const scaleRaw = parseFiniteNumber(scaleInput.value);
		const fretRaw = fretInput.value.trim() === '' ? { ok: true as const, value: DEFAULT_FRET_COUNT } : parseInteger(fretInput.value);

		if (scaleInput.value.trim() === '' && fretInput.value.trim() === '') {
			errorsEl.hidden = true;
			resultEl.hidden = true;
			idleEl.hidden = false;
			copyBtn.disabled = true;
			lastCopy = '';
			return;
		}

		const formErrors: string[] = [];
		if (!scaleRaw.ok) {
			formErrors.push(
				scaleRaw.reason === 'empty' ? 'Enter a scale length.' : 'Scale length is not a number.',
			);
			scaleInput.setAttribute('aria-invalid', 'true');
		}
		if (!fretRaw.ok) {
			formErrors.push(
				fretRaw.reason === 'empty' ? 'Enter a fret count, or leave 24.' : 'Fret count must be a whole number.',
			);
			fretInput.setAttribute('aria-invalid', 'true');
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
			resultEl.hidden = true;
			idleEl.hidden = true;
			copyBtn.disabled = true;
			lastCopy = '';
			return;
		}

		if (!scaleRaw.ok || !fretRaw.ok) return;

		const unit = scaleUnit(unitSelect.value);
		const result = computeFretPositions({
			scale: scaleRaw.value,
			scaleUnit: unit,
			fretCount: fretRaw.value,
			showRuleOf18: rule18.checked,
			outputUnit: unit,
		});

		if (!result.ok) {
			for (const err of result.errors) {
				if (err.field === 'scale') scaleInput.setAttribute('aria-invalid', 'true');
				if (err.field === 'fretCount') fretInput.setAttribute('aria-invalid', 'true');
			}
			errorList.replaceChildren(
				...result.errors.map((err) => {
					const li = document.createElement('li');
					li.textContent = err.message;
					return li;
				}),
			);
			errorsEl.hidden = false;
			resultEl.hidden = true;
			idleEl.hidden = true;
			copyBtn.disabled = true;
			lastCopy = '';
			return;
		}

		errorsEl.hidden = true;
		idleEl.hidden = true;
		resultEl.hidden = false;
		copyBtn.disabled = false;

		delayValue.innerHTML = '';
		delayValue.append(document.createTextNode(formatScale(result.twelfthFret, result.scaleUnit)));
		const unitEl = document.createElement('span');
		unitEl.className = 'result-unit';
		unitEl.textContent = result.scaleUnit;
		delayValue.append(unitEl);

		channelEl.textContent = result.twelfthEqualsHalf
			? `d(12) equals S/2 exactly (${formatScale(result.halfScale, result.scaleUnit)} ${result.scaleUnit}). These distances are slot centers, not a kerf clearance.`
			: `d(12) = ${formatScale(result.twelfthFret, result.scaleUnit)} ${result.scaleUnit}; S/2 = ${formatScale(result.halfScale, result.scaleUnit)} ${result.scaleUnit}. Check the formula before you saw.`;

		extraHead.hidden = !result.showRuleOf18;

		tableBody.replaceChildren(
			...result.rows.map((row) => {
				const tr = document.createElement('tr');
				if (row.fret === 12) tr.className = 'fret-12';
				const cells = [
					String(row.fret),
					formatScale(row.distanceFromNut, result.scaleUnit),
					formatScale(row.fretToFret, result.scaleUnit),
				];
				if (result.showRuleOf18 && row.ruleOf18FromNut !== null) {
					cells.push(formatScale(row.ruleOf18FromNut, result.scaleUnit));
					cells.push(
						row.ruleOf18FretToFret === null ? '—' : formatScale(row.ruleOf18FretToFret, result.scaleUnit),
					);
				}
				for (const [i, text] of cells.entries()) {
					const td = document.createElement('td');
					td.textContent = text;
					if (i === 0) {
						const th = document.createElement('th');
						th.scope = 'row';
						th.textContent = text;
						tr.append(th);
					} else {
						tr.append(td);
					}
				}
				return tr;
			}),
		);

		lastCopy = formatCopy(result);
	}

	form.addEventListener('input', render);
	form.addEventListener('change', render);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		render();
	});
	resetBtn.addEventListener('click', () => {
		form.reset();
		copyStatus.hidden = true;
		queueMicrotask(render);
	});
	copyBtn.addEventListener('click', async () => {
		if (!lastCopy) return;
		try {
			await navigator.clipboard.writeText(lastCopy);
			copyStatus.hidden = false;
			copyStatus.textContent = 'Copied fret table to clipboard.';
		} catch {
			copyStatus.hidden = false;
			copyStatus.textContent = 'Copy failed. Select the table and copy it manually.';
		}
	});

	render();
}
