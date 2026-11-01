import { useCalcForm } from './useCalcForm.ts';
import { FRET_IRREVERSIBLE } from '../site.ts';
import { bindFretPositionForm } from '../islands/fret-position-ui.ts';

export default function FretPositionCalc() {
	const formRef = useCalcForm(bindFretPositionForm)
	return (
<form ref={formRef} id="fret-position-form" className="calc-stack" noValidate>
	<div className="calc-panel">
		<fieldset>
			<legend>Scale length</legend>
			<div className="field-row">
				<div className="field">
					<label htmlFor="scale-length">S</label>
					<input id="scale-length" name="scale" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<div className="field">
					<label htmlFor="scale-unit">Unit</label>
					<select defaultValue="in" id="scale-unit" name="scaleUnit">
						<option value="in">in</option>
						<option value="mm">mm</option>
					</select>
				</div>
			</div>
			<div className="chips" role="group" aria-label="Scale presets">
				<button type="button" className="chip" data-scale-chip data-scale="25.5" data-unit="in" data-source="25.5-in">
					25.500 in
				</button>
				<button type="button" className="chip" data-scale-chip data-scale="650" data-unit="mm" data-source="650-mm">
					650 mm
				</button>
				<button type="button" className="chip" data-scale-chip data-scale="660" data-unit="mm" data-source="660-mm">
					660 mm
				</button>
			</div>
			<p className="hint" data-scale-source>
				Chips cite published common scales. 650 mm is not 25.5 in (25.500 × 25.4 = 647.7 mm).
			</p>
		</fieldset>

		<fieldset>
			<legend>Fret count N</legend>
			<div className="field">
				<label htmlFor="fret-count">Frets</label>
				<input id="fret-count" name="fretCount" type="text" inputMode="numeric" defaultValue="22" autoComplete="off" />
				<p className="hint">Default 22.</p>
			</div>
			<div className="chips" role="group" aria-label="Fret count presets">
				<button type="button" className="chip" data-n-chip data-n="19">19</button>
				<button type="button" className="chip" data-n-chip data-n="21">21</button>
				<button type="button" className="chip" data-n-chip data-n="22">22</button>
				<button type="button" className="chip" data-n-chip data-n="24">24</button>
			</div>
		</fieldset>

		<fieldset>
			<legend>Datum</legend>
			<div className="radios">
				<label><input type="radio" name="datum" value="nut" defaultChecked /> Nut face</label>
				<label>
					<input type="radio" name="datum" value="zero-fret" disabled />
					Zero fret (not in this prototype)
				</label>
			</div>
			<p className="hint">Distances are from the nut face. Zero-fret datum shift is not implemented here.</p>
		</fieldset>

		<details className="drawer">
			<summary>Kerf (empty = none)</summary>
			<div className="field">
				<label htmlFor="kerf">Saw kerf</label>
				<input id="kerf" name="kerf" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<p className="hint">
				No spec default. Slot center = d(n). This tool does not invent a universal kerf clearance.
			</p>
		</details>

		<details className="drawer">
			<summary>Fan / multi-scale</summary>
			<p>Fan table not in this prototype. Parallel 12-TET only. SVG/DXF export is not in this prototype.</p>
		</details>

		<div className="errors" data-errors hidden role="alert">
			<p>Check these inputs</p>
			<ul data-error-list></ul>
		</div>
	</div>

	<section className="result-card" aria-live="polite">
		<p className="result-eyebrow">Result</p>
		<p className="result-value" data-twelfth>—</p>
		<p className="result-decision" data-decision>Enter a scale length</p>
		<ul className="result-extras" data-extras></ul>
		<div className="actions">
			<button className="btn-primary" type="button" data-copy disabled>Copy result</button>
			<button className="btn-secondary" type="button" data-copy-tsv disabled>Copy table TSV</button>
			<button className="btn-secondary" type="reset" data-reset>Reset</button>
		</div>
		<p className="copy-status" data-copy-status hidden></p>
		<p className="safety safety-irreversible">{FRET_IRREVERSIBLE}</p>
	</section>

	<div className="table-wrap">
		<table>
			<caption className="visually-hidden">Fret distances from the nut</caption>
			<thead>
				<tr>
					<th scope="col">Fret</th>
					<th scope="col">From nut</th>
					<th scope="col">Fret to fret</th>
				</tr>
			</thead>
			<tbody data-table-body></tbody>
		</table>
	</div>

	<div className="print-preview">
		<p className="print-warning">
			Confirm nut, 12th, and last against a steel rule. Do not saw from an unscaled print.
		</p>
		<p className="hint print-only">Print uses white paper tokens. Printers are not CAM (Mottola).</p>
		<p className="mono" data-print-scale></p>
		<div className="scale-bars">
			<div className="scale-bar scale-bar-100mm">100 mm</div>
			<div className="scale-bar scale-bar-in">1 in</div>
		</div>
		<div className="fretboard" data-fretboard aria-hidden="true"></div>
	</div>
</form>
	)
}
