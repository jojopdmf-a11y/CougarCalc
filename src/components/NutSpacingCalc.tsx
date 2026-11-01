import CalcShell from './CalcShell.tsx';
import { bindNutSpacingForm } from '../islands/nut-spacing-ui.ts';

export default function NutSpacingCalc() {
const warning =
	'Equal remaining gap between string edges. Slot clearance is not a universal spec and is not invented here. Filing a nut is irreversible; this page is not a procedure.';
	return (
<CalcShell
	bind={bindNutSpacingForm}
	formId="nut-spacing-form"
	emptyMessage="Enter E-to-E and at least two gauges"
	warning={warning}
	warningKind="irreversible"
>
	<fieldset>
		<legend>Outer spacing</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="e-to-e">E-to-E (outer centers)</label>
				<input id="e-to-e" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="unit">Unit</label>
				<select defaultValue="in" id="unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
		<p className="hint">E-to-E is center-to-center of the two outer strings, not the nut blank width.</p>
	</fieldset>
	<fieldset>
		<legend>Gauges</legend>
		<div className="field">
			<label htmlFor="gauges">String gauges (comma or rows, bass last or treble first — as you list them)</label>
			<textarea id="gauges" autoComplete="off"></textarea>
			<p className="hint">
				Example: 0.010, 0.013, 0.017, 0.026, 0.036, 0.046. Numbers are used as typed (0.010 not 10).
			</p>
		</div>
		<div className="field">
			<label htmlFor="gauge-unit">Gauge unit</label>
			<select defaultValue="in" id="gauge-unit">
				<option value="in">in</option>
				<option value="mm">mm</option>
			</select>
		</div>
	</fieldset>
	<div className="table-wrap" data-table-wrap hidden slot="below">
		<table>
			<caption className="visually-hidden">String centers from the first E</caption>
			<thead>
				<tr>
					<th scope="col">String</th>
					<th scope="col">Gauge</th>
					<th scope="col">Center from first E</th>
				</tr>
			</thead>
			<tbody data-table-body></tbody>
		</table>
	</div>
</CalcShell>
	)
}
