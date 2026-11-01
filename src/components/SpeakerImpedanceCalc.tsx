import CalcShell from './CalcShell.tsx';
import { bindSpeakerImpedanceForm } from '../islands/speaker-impedance-ui.ts';

export default function SpeakerImpedanceCalc() {
const warning =
	'Ohm’s law at the speakON. Bridged Z_ch = Z_load/2. This is not a mains/breaker calculation and does not invent 2× or 4× power.';
	return (
<CalcShell
	bind={bindSpeakerImpedanceForm} formId="speaker-impedance-form" emptyMessage="Enter cabinet impedances" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Combination</legend>
		<div className="radios">
			<label><input type="radio" name="mode" value="series" /> Series (sum)</label>
			<label><input type="radio" name="mode" value="parallel" defaultChecked /> Parallel (reciprocal)</label>
			<label><input type="radio" name="mode" value="bridged" /> Bridged (Z_ch = Z_load / 2)</label>
		</div>
		<p className="hint">Bridged is usually one load. Multiple Z in bridged mode are series-summed, then halved per amplifier half. No 2×/4× wattage claim.</p>
	</fieldset>
	<fieldset>
		<legend>Cabinet Z list (Ω)</legend>
		<div className="repeat-list" data-row-list>
			<div className="repeat-row repeat-row-1" data-row>
				<div className="field">
					<label>Z (Ω)</label>
					<input className="js-z" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<button type="button" className="btn-secondary" data-remove-row>Remove</button>
			</div>
			<div className="repeat-row repeat-row-1" data-row>
				<div className="field">
					<label>Z (Ω)</label>
					<input className="js-z" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<button type="button" className="btn-secondary" data-remove-row>Remove</button>
			</div>
		</div>
		<div className="repeat-toolbar">
			<button type="button" className="btn-secondary" data-add-row>Add cabinet</button>
		</div>
	</fieldset>
	<fieldset>
		<legend>Optional speakON voltage</legend>
		<div className="field">
			<label htmlFor="voltage">Voltage at the speakON (Vrms)</label>
			<input id="voltage" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Empty skips I and P. This is the amplifier output, not a mains receptacle.</p>
		</div>
	</fieldset>
</CalcShell>
	)
}
