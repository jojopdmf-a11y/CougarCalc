/**
 * Shared empty / error / copy / reset wiring for CougarCalc tool islands.
 * Math stays in src/calcs. This module only paints the result card.
 */

export type RenderedResult = {
	value: string;
	unit?: string;
	decision: string;
	extras: string[];
	copy: string;
};

export type EvalResult =
	| { ok: true; rendered: RenderedResult }
	| { ok: false; errors: string[] };

export function bindCalcForm(
	form: HTMLFormElement,
	opts: {
		emptyMessage: string;
		isEmpty: () => boolean;
		evaluate: () => EvalResult;
	},
): void {
	const errorsEl = form.querySelector<HTMLElement>('[data-errors]')!;
	const errorList = form.querySelector<HTMLElement>('[data-error-list]')!;
	const resultValue = form.querySelector<HTMLElement>('[data-result-value]')!;
	const decisionEl = form.querySelector<HTMLElement>('[data-decision]')!;
	const extrasEl = form.querySelector<HTMLElement>('[data-extras]')!;
	const copyBtn = form.querySelector<HTMLButtonElement>('[data-copy]')!;
	const copyStatus = form.querySelector<HTMLElement>('[data-copy-status]')!;

	let lastCopy = '';

	function setEmptyCard(message: string): void {
		resultValue.replaceChildren(document.createTextNode('—'));
		decisionEl.textContent = message;
		extrasEl.replaceChildren();
		copyBtn.disabled = true;
		lastCopy = '';
	}

	function render(): void {
		copyStatus.hidden = true;
		form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));

		if (opts.isEmpty()) {
			errorsEl.hidden = true;
			setEmptyCard(opts.emptyMessage);
			return;
		}

		const evaluated = opts.evaluate();
		if (!evaluated.ok) {
			errorList.replaceChildren(
				...evaluated.errors.map((message) => {
					const li = document.createElement('li');
					li.textContent = message;
					return li;
				}),
			);
			errorsEl.hidden = false;
			setEmptyCard('Fix the inputs');
			return;
		}

		errorsEl.hidden = true;
		errorList.replaceChildren();
		copyBtn.disabled = false;
		resultValue.replaceChildren(document.createTextNode(evaluated.rendered.value));
		if (evaluated.rendered.unit) {
			const unit = document.createElement('span');
			unit.className = 'result-unit';
			unit.textContent = evaluated.rendered.unit;
			resultValue.append(unit);
		}
		decisionEl.textContent = evaluated.rendered.decision;
		extrasEl.replaceChildren(
			...evaluated.rendered.extras.map((text) => {
				const li = document.createElement('li');
				li.textContent = text;
				return li;
			}),
		);
		lastCopy = evaluated.rendered.copy;
	}

	form.addEventListener('input', render);
	form.addEventListener('change', render);
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		render();
	});
	form.addEventListener('reset', () => {
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

/**
 * Add / remove repeating input rows. Extra rows are stripped on reset.
 * Cloned inputs with data-default restore that value; others clear.
 */
export function bindRepeatRows(
	form: HTMLFormElement,
	opts: { list: HTMLElement; addButton: HTMLButtonElement; minRows?: number },
): void {
	const minRows = opts.minRows ?? 1;

	function clearRow(row: HTMLElement): void {
		row.querySelectorAll('input, select, textarea').forEach((el) => {
			if (el instanceof HTMLInputElement) {
				if (el.type === 'checkbox' || el.type === 'radio') {
					el.checked = false;
				} else if (el.dataset.default !== undefined) {
					el.value = el.dataset.default;
				} else {
					el.value = '';
				}
			} else if (el instanceof HTMLSelectElement) {
				if (el.dataset.default !== undefined) {
					el.value = el.dataset.default;
				} else {
					el.selectedIndex = 0;
				}
			} else if (el instanceof HTMLTextAreaElement) {
				el.value = '';
			}
		});
	}

	opts.addButton.addEventListener('click', () => {
		const proto = opts.list.querySelector<HTMLElement>('[data-row]');
		if (!proto) return;
		const clone = proto.cloneNode(true) as HTMLElement;
		clearRow(clone);
		opts.list.append(clone);
		form.dispatchEvent(new Event('input', { bubbles: true }));
	});

	opts.list.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('[data-remove-row]');
		if (!btn) return;
		const row = btn.closest('[data-row]');
		if (!(row instanceof HTMLElement)) return;
		const rows = opts.list.querySelectorAll('[data-row]');
		if (rows.length <= minRows) {
			clearRow(row);
		} else {
			row.remove();
		}
		form.dispatchEvent(new Event('input', { bubbles: true }));
	});

	form.addEventListener('reset', () => {
		queueMicrotask(() => {
			const rows = [...opts.list.querySelectorAll('[data-row]')];
			rows.slice(minRows).forEach((row) => row.remove());
		});
	});
}
