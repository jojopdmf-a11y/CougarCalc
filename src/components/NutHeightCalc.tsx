import CalcShell from './CalcShell.tsx';
import { MUSICNOMAD_OPEN_1ST, STEWMAC_TS331_PRESS_3RD } from '../calcs/nut-height.ts';
import { bindNutHeightForm } from '../islands/nut-height-ui.ts';

export default function NutHeightCalc() {
const warning =
	'Measurement aid only — not a filing procedure. Choose a method. One swipe can ruin a slot. Filing a nut is irreversible. Fender nut-gap numbers are unavailable.';
	return (
<CalcShell
	bind={bindNutHeightForm}
	formId="nut-height-form"
	emptyMessage="Choose a method and enter the measured height"
	warning={warning}
	warningKind="irreversible"
>
	<fieldset>
		<legend>Measurement method (required)</legend>
		<div className="radios">
			<label>
				<input type="radio" name="method" value="open-1st" />
				{MUSICNOMAD_OPEN_1ST.label}
			</label>
			<label>
				<input type="radio" name="method" value="press-3rd" />
				{STEWMAC_TS331_PRESS_3RD.label}
			</label>
		</div>
		<p className="hint">The card will not run until you pick a method. Each method has its own labeled shop source. Not a Fender factory spec.</p>
	</fieldset>
	<fieldset>
		<legend>Measured height</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="action">Height</label>
				<input id="action" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="unit">Unit</label>
				<select defaultValue="in" id="unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
		<p className="hint">Open@1st: string to 1st fret, open. Press@3rd: StewMac TS331 clearance with the string pressed at the 3rd. Do not mix the two numbers.</p>
	</fieldset>
	<details className="drawer">
		<summary>Optional fret crown (inches)</summary>
		<div className="field">
			<label htmlFor="crown">Fret crown height (in)</label>
			<input id="crown" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">
				Optional. If entered, the card shows measured height plus crown as a slot-vs-fret comparison.
				That is still not a filing procedure.
			</p>
		</div>
	</details>
</CalcShell>
	)
}
