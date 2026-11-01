import CalcShell from './CalcShell.tsx';
import { DUNCAN_HUMBUCKER_IN, DUNCAN_TREMBUCKER_IN } from '../calcs/pickup-poles.ts';
import { bindPickupPolesForm } from '../islands/pickup-poles-ui.ts';

export default function PickupPolesCalc() {
const warning =
	'Duncan published 1.930 in / 2.070 in. DiMarzio official figures were unavailable and are not invented. Measure E-to-E at the pickup.';
	return (
<CalcShell
	bind={bindPickupPolesForm}
	formId="pickup-poles-form"
	emptyMessage="Enter E-to-E at the pickup"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Measured spacing</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="e-to-e">E-to-E at pickup</label>
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
		<div className="radios">
			<label><input type="radio" name="position" value="bridge" defaultChecked /> Bridge</label>
			<label><input type="radio" name="position" value="neck" /> Neck</label>
		</div>
		<p className="hint">
			Duncan: standard humbucker {DUNCAN_HUMBUCKER_IN.toFixed(3)} in; Trembucker {DUNCAN_TREMBUCKER_IN.toFixed(3)} in.
			Bridge E-to-E &gt; 2 in suggests Trembucker.
		</p>
		<div className="chips" role="group" aria-label="Duncan published spacings">
			<button type="button" className="chip" data-duncan-chip data-value={String(DUNCAN_HUMBUCKER_IN)} data-unit="in">
				Duncan 1.930 in
			</button>
			<button type="button" className="chip" data-duncan-chip data-value={String(DUNCAN_TREMBUCKER_IN)} data-unit="in">
				Duncan 2.070 in
			</button>
		</div>
	</fieldset>
</CalcShell>
	)
}
