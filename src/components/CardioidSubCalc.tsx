import CalcShell from './CalcShell.tsx';
import { bindCardioidSubForm } from '../islands/cardioid-sub-array-ui.ts';

export default function CardioidSubCalc() {
const warning =
	'λ/4 spacing and rear delay plus invert. This is not a manufacturer preset (not a d&b, Meyer, or L-Acoustics cardioid mode). Verify with measurement.';
	return (
<CalcShell
	bind={bindCardioidSubForm} formId="cardioid-sub-array-form" emptyMessage="Enter a frequency" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Design frequency</legend>
		<div className="field">
			<label htmlFor="freq">Frequency (Hz)</label>
			<input id="freq" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Spacing is λ/4, not λ/2. Rear delay is the travel time of that spacing: 1000/(4f) ms at the same c.</p>
		</div>
	</fieldset>
	<fieldset>
		<legend>Air</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="temperature">Temperature</label>
				<input id="temperature" type="text" inputMode="decimal" defaultValue="20" autoComplete="off" />
				<p className="hint">Default 20 °C / 68 °F. Same Sengpiel line as speaker delay: c = 331.3 + 0.6 × T_C.</p>
			</div>
			<div className="field">
				<label htmlFor="temperature-unit">Unit</label>
				<select defaultValue="C" id="temperature-unit">
					<option value="C">°C</option>
					<option value="F">°F</option>
				</select>
			</div>
		</div>
	</fieldset>
</CalcShell>
	)
}
