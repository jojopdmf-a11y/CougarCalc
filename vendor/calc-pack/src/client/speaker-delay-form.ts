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
			`Samples ${formatSamples(result.samples ?? 0)} at ${sampleRate.value} Hz (full precision)`,
		];
		if (result.latencyOvershoot) {
			extras.unshift(
				`Existing latency overshoots geometry by ${formatDelayMsDisplay(result.overshootMs)} ms; no geometric delay added.`,
			);
		}
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