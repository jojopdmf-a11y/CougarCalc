import CalcShell from './CalcShell.tsx';
import { bindSubMainDelayForm } from '../islands/sub-main-crossover-delay-ui.ts';

export default function SubMainDelayCalc() {
const warning =
	'Geometric path difference at this page’s air line (331.3 + 0.606×T_C → 343.42 m/s at 20 °C). Optional filter note is a number you type, not a modeled crossover. Not SubAligner.';
	return (
<CalcShell
	bind={bindSubMainDelayForm} formId="sub-main-crossover-delay-form" emptyMessage="Enter both path lengths" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Two paths to the seat</legend>
		<div className="field">
			<label htmlFor="path-sub">Sub path</label>
			<input id="path-sub" type="text" inputMode="decimal" autoComplete="off" />
		</div>
		<div className="field">
			<label htmlFor="path-main">Main path</label>
			<input id="path-main" type="text" inputMode="decimal" autoComplete="off" />
		</div>
		<div className="field">
			<label htmlFor="path-unit">Length unit</label>
			<select defaultValue="m" id="path-unit">
				<option value="m">m</option>
				<option value="ft">ft</option>
			</select>
		</div>
		<p className="hint">Straight-line acoustic-center distances. Delay the earlier (usually closer) path.</p>
	</fieldset>
	<fieldset>
		<legend>Air</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="temperature">Temperature</label>
				<input id="temperature" type="text" inputMode="decimal" defaultValue="20" autoComplete="off" />
				<p className="hint">Default 20 °C. This page: c = 331.3 + 0.606 × T_C → 343.42 m/s at 20 °C. Speaker-delay stays on Sengpiel 0.6×T → 343.3. Do not hardcode 343.</p>
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
	<details className="drawer">
		<summary>Optional geometric phase (fc)</summary>
		<div className="field">
			<label htmlFor="crossover-hz">Crossover frequency (Hz)</label>
			<input id="crossover-hz" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">φ(°) = 360 · fc · Δt, wrap ±180°. Geometric only. Empty skips phase. Not filter/FIR phase.</p>
		</div>
	</details>
	<details className="drawer">
		<summary>Optional filter / group delay note (empty = 0)</summary>
		<div className="field">
			<label htmlFor="filter-delay">Filter delay note (ms)</label>
			<input id="filter-delay" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">A number you type. Not modeled from a crossover trace, FIR, or SubAligner.</p>
		</div>
	</details>
</CalcShell>
	)
}
