import CalcShell from './CalcShell.tsx';
import { bindNoiseDoseForm } from '../islands/noise-dose-ui.ts';

export default function NoiseDoseCalc() {
const warning =
	'Educational only. Not a dosimeter, not personal sampling, not OSHA or NIOSH compliance. dBA only. The NIOSH 98-126 PDF was unavailable to this prototype.';
	return (
<CalcShell
	bind={bindNoiseDoseForm} formId="noise-dose-form" emptyMessage="Enter a dBA band" warning={warning} warningKind="warn">
	<fieldset>
		<legend>dBA bands</legend>
		<p className="hint">
			T = 8 / 2^((L − Lc) / q) hours. Dose % = 100 × Σ (C_i / T_i). NIOSH: 85 dBA / 3 dB. OSHA 1910.95: 90 dBA / 5 dB.
		</p>
		<div className="repeat-list" data-row-list>
			<div className="repeat-row" data-row>
				<div className="field">
					<label>Level (dBA)</label>
					<input className="js-dba" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<div className="field">
					<label>Duration (hours)</label>
					<input className="js-hours" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<button type="button" className="btn-secondary" data-remove-row>Remove</button>
			</div>
		</div>
		<div className="repeat-toolbar">
			<button type="button" className="btn-secondary" data-add-row>Add band</button>
		</div>
	</fieldset>
</CalcShell>
	)
}
