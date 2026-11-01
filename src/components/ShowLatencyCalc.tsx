import CalcShell from './CalcShell.tsx';
import { DANTE_HOP_TABLE } from '../calcs/show-latency.ts';
import { bindShowLatencyForm } from '../islands/show-latency-ui.ts';

export default function ShowLatencyCalc() {
const warning =
	'Dante Controller latency is not analog I/O latency. Hop times are discrete Audinate table rows, not interpolated. A ~5 ms in-ear round trip (ProSoundWeb) is a guideline, not a law.';
	return (
<CalcShell
	bind={bindShowLatencyForm} formId="show-latency-form" emptyMessage="Enter at least one stage" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Series stages</legend>
		<p className="hint">t_total = Σ t_i. Each row is milliseconds, or samples converted with t_ms = 1000 × N / fs.</p>
		<div className="repeat-list" data-row-list>
			<div className="repeat-row repeat-row-wide" data-row>
				<div className="field">
					<label>Label</label>
					<input className="js-label" type="text" autoComplete="off" />
				</div>
				<div className="field">
					<label>Entry</label>
					<select defaultValue="ms" className="js-kind" data-default="ms">
						<option value="ms">milliseconds</option>
						<option value="samples">samples + fs</option>
					</select>
				</div>
				<div className="field">
					<label>Time (ms)</label>
					<input className="js-ms" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<div className="field">
					<label>Samples</label>
					<input className="js-samples" type="text" inputMode="decimal" autoComplete="off" />
				</div>
				<div className="field">
					<label>fs (Hz)</label>
					<input className="js-fs" type="text" inputMode="decimal" defaultValue="48000" data-default="48000" autoComplete="off" />
				</div>
				<button type="button" className="btn-secondary" data-remove-row>Remove</button>
			</div>
		</div>
		<div className="repeat-toolbar">
			<button type="button" className="btn-secondary" data-add-row>Add stage</button>
		</div>
	</fieldset>
	<fieldset>
		<legend>Dante hop (optional, discrete table)</legend>
		<div className="field">
			<label htmlFor="dante-hop">Audinate suggested latency vs switch hops</label>
			<select defaultValue="" id="dante-hop">
				<option value="">None — do not add a Dante hop</option>
				{DANTE_HOP_TABLE.map((row) => (
					<option value={String(row.ms)}>{row.label}</option>
				))}
			</select>
			<p className="hint">These five rows are copied from Audinate’s table. Intermediate hop counts are not interpolated.</p>
		</div>
	</fieldset>
	<fieldset>
		<legend>Air path (optional)</legend>
		<div className="checks">
			<label>
				<input type="checkbox" id="air-path" />
				Show equivalent air path at 343.3 m/s (20 °C, Sengpiel)
			</label>
		</div>
	</fieldset>
</CalcShell>
	)
}
