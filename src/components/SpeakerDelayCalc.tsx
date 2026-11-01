import { useCalcForm } from './useCalcForm.ts';
import { DELAY_SAFETY } from '../site.ts';
import { bindSpeakerDelayForm } from '../islands/speaker-delay-ui.ts';

export default function SpeakerDelayCalc() {
	const formRef = useCalcForm(bindSpeakerDelayForm)
	return (
<form ref={formRef} id="speaker-delay-form" className="calc-stack" noValidate>
	<div className="calc-panel">
		<fieldset>
			<legend>Two paths to the seat</legend>
			<p className="hint">Acoustic path lengths to one seat. This is not cabinet spacing.</p>
			<div className="field">
				<label htmlFor="path-a">Path A</label>
				<input id="path-a" name="pathA" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="path-b">Path B</label>
				<input id="path-b" name="pathB" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="path-unit">Length unit</label>
				<select defaultValue="m" id="path-unit" name="lengthUnit">
					<option value="m">m</option>
					<option value="ft">ft</option>
					<option value="in">in</option>
				</select>
			</div>
		</fieldset>

		<fieldset>
			<legend>Air</legend>
			<div className="field-row">
				<div className="field">
					<label htmlFor="temperature">Temperature</label>
					<input
						id="temperature"
						name="temperature"
						type="text"
						inputMode="decimal"
						defaultValue="20"
						autoComplete="off"
					/>
					<p className="hint">Default 20 °C / 68 °F. Not a reading.</p>
				</div>
				<div className="field">
					<label htmlFor="temperature-unit">Unit</label>
					<select defaultValue="C" id="temperature-unit" name="temperatureUnit">
						<option value="C">°C</option>
						<option value="F">°F</option>
					</select>
				</div>
			</div>
		</fieldset>

		<fieldset>
			<legend>Fill type and Haas extra</legend>
			<div className="radios">
				<label><input type="radio" name="fill-type" value="none" defaultChecked /> None</label>
				<label><input type="radio" name="fill-type" value="front-fill" /> Front fill</label>
				<label><input type="radio" name="fill-type" value="underbalcony" /> Underbalcony</label>
				<label><input type="radio" name="fill-type" value="delay-tower" /> Delay tower</label>
			</div>
			<div className="field">
				<label htmlFor="haas-ms">Haas extra (ms)</label>
				<input id="haas-ms" name="haasMs" type="text" inputMode="decimal" defaultValue="0" autoComplete="off" />
				<p className="hint">
					Starting offset, not a law. Suggestions: none 0, front fill 8, underbalcony 10, delay tower 15.
					Cited practice ranges: QSC 10–20 ms; SonaVyx front 5–10 ms, towers 10–20 ms.
				</p>
			</div>
		</fieldset>

		<details className="drawer">
			<summary>Existing latency (empty = 0 ms)</summary>
			<div className="field">
				<label htmlFor="latency-a">Path A latency (ms)</label>
				<input id="latency-a" name="latencyA" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="latency-b">Path B latency (ms)</label>
				<input id="latency-b" name="latencyB" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<p className="hint">DSP, network, and speaker processing already on that channel.</p>
		</details>

		<div className="field">
			<label htmlFor="sample-rate">Sample rate</label>
			<select defaultValue="48000" id="sample-rate" name="sampleRate">
				<option value="44100">44.1 kHz</option>
				<option value="48000">48 kHz</option>
				<option value="96000">96 kHz</option>
			</select>
		</div>

		<details className="drawer">
			<summary>Speed of sound c (read-only)</summary>
			<p className="mono" data-c-value>Enter paths and temperature to see c.</p>
			<p className="hint">c = 331.3 + 0.6 × T_C m/s (Sengpiel simplified). Humidity is ignored. No slider.</p>
		</details>

		<div className="errors" data-errors hidden role="alert">
			<p>Check these inputs</p>
			<ul data-error-list></ul>
		</div>
	</div>

	<section className="result-card" aria-live="polite">
		<p className="result-eyebrow">Result</p>
		<p className="result-value" data-delay-ms>—</p>
		<p className="result-decision" data-decision>Enter both paths</p>
		<ul className="result-extras" data-extras></ul>
		<div className="actions">
			<button className="btn-primary" type="button" data-copy disabled>Copy result</button>
			<button className="btn-secondary" type="reset" data-reset>Reset</button>
		</div>
		<p className="copy-status" data-copy-status hidden></p>
		<p className="safety safety-warn">{DELAY_SAFETY}</p>
	</section>
</form>
	)
}
