import CalcShell from './CalcShell.tsx';
import { bindSaddleCompensationForm } from '../islands/saddle-compensation-ui.ts';

export default function SaddleCompensationCalc() {
const warning =
	'Mottola compensation from 12th-fret cents error. Elmendorp is not used. Verify on the instrument before you lock a saddle.';
	return (
<CalcShell
	bind={bindSaddleCompensationForm}
	formId="saddle-compensation-form"
	emptyMessage="Enter scale and 12th-fret cents error"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Scale and cents error</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="scale">Scale S</label>
				<input id="scale" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="unit">Unit</label>
				<select defaultValue="in" id="unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
		<div className="field">
			<label htmlFor="cents">12th-fret cents error e</label>
			<input id="cents" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Negative if the fretted note is flat. Positive if sharp. Mottola n = 12 + e/100.</p>
		</div>
	</fieldset>
</CalcShell>
	)
}
