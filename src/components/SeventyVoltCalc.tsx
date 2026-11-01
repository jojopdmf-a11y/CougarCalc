import CalcShell from './CalcShell.tsx';
import { bindSeventyVoltForm } from '../islands/70v-tap-ui.ts';

export default function SeventyVoltCalc() {
const warning =
	'BGM, paging, and under-balcony distributed audio only. Checking fire-alarm / NFPA 72 / EN 54 refuses the calculation. This is not a life-safety design tool.';
	return (
<CalcShell
	bind={bindSeventyVoltForm} formId="seventy-volt-tap-form" emptyMessage="Enter tap watts" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Scope</legend>
		<div className="checks">
			<label>
				<input type="checkbox" id="fire-alarm" />
				This is a fire-alarm / NFPA 72 / EN 54 / life-safety circuit
			</label>
		</div>
		<p className="hint">If checked, the calculator refuses and shows no ohms, watts, or current.</p>
	</fieldset>
	<fieldset>
		<legend>Distributed voltage</legend>
		<div className="radios">
			<label><input type="radio" name="voltage" value="70.7" defaultChecked /> 70.7 V (US “70 V”)</label>
			<label><input type="radio" name="voltage" value="100" /> 100 V</label>
		</div>
	</fieldset>
	<fieldset>
		<legend>Taps</legend>
		<p className="hint">Z_tap = V² / P_tap. I_tap = P_tap / V. Total watts = Σ (watts × count).</p>
		<div className="repeat-list" data-row-list>
			<div className="repeat-row" data-row>
				<div className="field">
					<label>Tap (W)</label>
					<input className="js-watts" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<div className="field">
					<label>Count</label>
					<input className="js-count" type="text" inputMode="numeric" autoComplete="off" />
				</div>
				<button type="button" className="btn-secondary" data-remove-row>Remove</button>
			</div>
		</div>
		<div className="repeat-toolbar">
			<button type="button" className="btn-secondary" data-add-row>Add tap row</button>
		</div>
	</fieldset>
</CalcShell>
	)
}
