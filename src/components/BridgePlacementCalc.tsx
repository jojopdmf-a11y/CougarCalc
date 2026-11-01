import CalcShell from './CalcShell.tsx';
import { bindBridgePlacementForm } from '../islands/bridge-placement-ui.ts';

export default function BridgePlacementCalc() {
const warning =
	'Break ≈ S is a first layout. Speaking length is along the string path, not the centerline. Exact compensation millimetres are not a universal figure. Drilling or routing from this mark is irreversible.';
	return (
<CalcShell
	bind={bindBridgePlacementForm}
	formId="bridge-placement-form"
	emptyMessage="Enter a scale length"
	warning={warning}
	warningKind="irreversible"
>
	<fieldset>
		<legend>Scale and compensation</legend>
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
			<label htmlFor="compensation">Compensation (0 is allowed)</label>
			<input id="compensation" type="text" inputMode="decimal" defaultValue="0" autoComplete="off" />
			<p className="hint">
				User-supplied offset along the string path. Empty is treated as 0. This tool does not invent a millimetre.
			</p>
		</div>
	</fieldset>
</CalcShell>
	)
}
