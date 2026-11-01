import CalcShell from './CalcShell.tsx';
import { bindNeckTaperForm } from '../islands/neck-taper-ui.ts';

export default function NeckTaperCalc() {
const warning =
	'Linear interpolation between two measured stations. Fender 1st/12th published table values are neck depth (thickness), not width.';
	return (
<CalcShell
	bind={bindNeckTaperForm}
	formId="neck-taper-form"
	emptyMessage="Enter two stations and a query location"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Station 1</legend>
		<div className="field-grid">
			<div className="field">
				<label htmlFor="x1">x1 (location)</label>
				<input id="x1" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="w1">w1 (width)</label>
				<input id="w1" type="text" inputMode="decimal" autoComplete="off" />
			</div>
		</div>
	</fieldset>
	<fieldset>
		<legend>Station 2</legend>
		<div className="field-grid">
			<div className="field">
				<label htmlFor="x2">x2 (location)</label>
				<input id="x2" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="w2">w2 (width)</label>
				<input id="w2" type="text" inputMode="decimal" autoComplete="off" />
			</div>
		</div>
	</fieldset>
	<fieldset>
		<legend>Query</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="x">x (location)</label>
				<input id="x" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="unit">Unit</label>
				<select defaultValue="in" id="unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
		<p className="hint">
			w(x) = w1 + (w2 − w1) × (x − x1) / (x2 − x1). Fender 1st/12th spec tables list neck depth, not this width.
		</p>
	</fieldset>
</CalcShell>
	)
}
