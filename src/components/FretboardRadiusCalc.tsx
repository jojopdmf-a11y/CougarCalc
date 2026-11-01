import CalcShell from './CalcShell.tsx';
import { bindFretboardRadiusForm } from '../islands/fretboard-radius-ui.ts';

export default function FretboardRadiusCalc() {
const warning =
	'Geometry of a circular arc or a Hartstein/Mottola cone. Warmoth radius pairs were not re-fetched and are not invented here. Sanding a board to a radius is irreversible.';
	return (
<CalcShell
	bind={bindFretboardRadiusForm}
	formId="fretboard-radius-form"
	emptyMessage="Enter radius and width, or sagitta and width, or cone stations"
	warning={warning}
	warningKind="irreversible"
>
	<fieldset>
		<legend>Mode</legend>
		<div className="radios">
			<label><input type="radio" name="mode" value="sagitta" defaultChecked /> Sagitta from radius</label>
			<label><input type="radio" name="mode" value="radius-from-sagitta" /> Radius from sagitta</label>
			<label><input type="radio" name="mode" value="conical" /> Conical (Hartstein/Mottola)</label>
		</div>
		<div className="field">
			<label htmlFor="unit">Unit</label>
			<select defaultValue="in" id="unit">
				<option value="in">in</option>
				<option value="mm">mm</option>
			</select>
		</div>
	</fieldset>
	<fieldset data-mode-panel="sagitta">
		<legend>s = r − √(r² − (l/2)²)</legend>
		<div className="field-grid">
			<div className="field">
				<label htmlFor="radius">Radius r</label>
				<input id="radius" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="width-s">Chord width l</label>
				<input id="width-s" type="text" inputMode="decimal" autoComplete="off" />
			</div>
		</div>
	</fieldset>
	<fieldset data-mode-panel="radius-from-sagitta" hidden>
		<legend>r = (s² + (l/2)²) / (2s)</legend>
		<div className="field-grid">
			<div className="field">
				<label htmlFor="sagitta">Sagitta s</label>
				<input id="sagitta" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="width-r">Chord width l</label>
				<input id="width-r" type="text" inputMode="decimal" autoComplete="off" />
			</div>
		</div>
	</fieldset>
	<fieldset data-mode-panel="conical" hidden>
		<legend>Rx = Rn × (1 + Dx × (Sf − Sn) / (Df × Sn))</legend>
		<div className="field-grid">
			<div className="field">
				<label htmlFor="rn">Rn (radius at nut)</label>
				<input id="rn" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="sn">Sn (width at nut)</label>
				<input id="sn" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="sf">Sf (width at far station)</label>
				<input id="sf" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="df">Df (nut to far station)</label>
				<input id="df" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="dx">Dx (nut to query station)</label>
				<input id="dx" type="text" inputMode="decimal" autoComplete="off" />
			</div>
		</div>
		<p className="hint">Hartstein via Mottola. Warmoth published nut/heel pairs are not listed here because they were not re-fetched.</p>
	</fieldset>
</CalcShell>
	)
}
