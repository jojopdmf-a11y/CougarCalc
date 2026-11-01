import CalcShell from './CalcShell.tsx';
import { PUBLISHED_SCALES } from '../calcs/scale-compare.ts';
import { bindScaleCompareForm } from '../islands/scale-compare-ui.ts';

export default function ScaleCompareCalc() {
const warning =
	'S_actual = 2 × nut-to-12th. 25.500 in × 25.4 = 647.7 mm, not 650 mm. Cited published lengths only.';
	return (
<CalcShell
	bind={bindScaleCompareForm}
	formId="scale-compare-form"
	emptyMessage="Enter nut-to-12th"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Measured half-scale</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="nut-to-12">Nut-to-12th</label>
				<input id="nut-to-12" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="unit">Unit</label>
				<select defaultValue="in" id="unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
		<p className="hint">S_actual = 2 × this distance. 25.500 × 25.4 = 647.7 mm ≠ 650 mm.</p>
	</fieldset>
	<fieldset>
		<legend>Compare to a cited published length</legend>
		<input type="hidden" id="compare-id" defaultValue="" />
		<div className="chips" role="group" aria-label="Published scales only">
			{
				PUBLISHED_SCALES.map((row) => (
					<button type="button" className="chip" data-scale-chip data-id={row.id}>
						{row.label}
					</button>
				))
			}
		</div>
		<p className="hint" data-compare-source>Chips are only the published rows in this prototype. No invented scales.</p>
	</fieldset>
</CalcShell>
	)
}
