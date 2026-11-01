import CalcShell from './CalcShell.tsx';
import { bindPhantomBudgetForm } from '../islands/phantom-power-budget-ui.ts';

export default function PhantomBudgetCalc() {
const warning =
	'Empty supply budget stays empty — this tool never assumes 500 mA. High microphone current on long, thin cable can sag 48 V (Bartlett); that drop is not modeled here.';
	return (
<CalcShell
	bind={bindPhantomBudgetForm} formId="phantom-power-budget-form" emptyMessage="Enter milliamps and count" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Devices</legend>
		<p className="hint">total mA = Σ (mA × count). Read milliamps from the microphone or DI datasheet, not a forum default.</p>
		<div className="repeat-list" data-row-list>
			<div className="repeat-row repeat-row-3" data-row>
				<div className="field">
					<label>Label (optional)</label>
					<input className="js-label" type="text" autoComplete="off" />
				</div>
				<div className="field">
					<label>mA each</label>
					<input className="js-ma" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<div className="field">
					<label>Count</label>
					<input className="js-count" type="text" inputMode="numeric" autoComplete="off" />
				</div>
				<button type="button" className="btn-secondary" data-remove-row>Remove</button>
			</div>
		</div>
		<div className="repeat-toolbar">
			<button type="button" className="btn-secondary" data-add-row>Add device row</button>
		</div>
	</fieldset>
	<fieldset>
		<legend>Supply budget (optional)</legend>
		<div className="field">
			<label htmlFor="budget">Console / supply budget (mA)</label>
			<input id="budget" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Leave empty to skip remaining-mA. This field is never pre-filled with 500.</p>
		</div>
	</fieldset>
</CalcShell>
	)
}
