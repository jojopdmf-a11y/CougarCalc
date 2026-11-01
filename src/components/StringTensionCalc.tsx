import CalcShell from './CalcShell.tsx';
import { DADDARIO_WAYBACK_SOURCE, UNIT_WEIGHT_TABLE } from '../calcs/string-tension.ts';
import { bindStringTensionForm } from '../islands/string-tension-ui.ts';

export default function StringTensionCalc() {
const warning =
	'This is a tension estimate from a cited unit weight. It is not a max-safe load for a neck, truss rod, or tuners.';
const exl110 = UNIT_WEIGHT_TABLE.filter((row) => row.label.startsWith('EXL110'));
const extra = UNIT_WEIGHT_TABLE.filter((row) => !row.label.startsWith('EXL110'));
	return (
<CalcShell
	bind={bindStringTensionForm}
	formId="string-tension-form"
	emptyMessage="Enter scale, frequency, and a cited unit weight"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Scale length</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="scale">S</label>
				<input id="scale" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="scale-unit">Unit</label>
				<select defaultValue="in" id="scale-unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
	</fieldset>
	<fieldset>
		<legend>Frequency</legend>
		<div className="field">
			<label htmlFor="freq">Pitch (Hz)</label>
			<input id="freq" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">12-TET E4 at A4 = 440 Hz is 329.627557 Hz.</p>
		</div>
		<div className="chips" role="group" aria-label="Pitch presets">
			<button type="button" className="chip" data-e4-chip>E4 = 329.627557 Hz</button>
		</div>
	</fieldset>
	<fieldset>
		<legend>Unit weight</legend>
		<div className="field">
			<label htmlFor="uw-table">Cited UW</label>
			<select id="uw-table">
				<option value="">Select an archived D’Addario Item# or enter UW</option>
				<optgroup label="EXL110 Regular Light (archived Catalog Supplement)">
					{
						exl110.map((row) => (
							<option value={row.item}>
								{row.item} — {row.uwLbPerIn} lb/in
							</option>
						))
					}
				</optgroup>
				{
					extra.length > 0 && (
						<optgroup label="Other archived Item#">
							{extra.map((row) => (
								<option value={row.item}>
									{row.item} — {row.uwLbPerIn} lb/in
								</option>
							))}
						</optgroup>
					)
				}
				<option value="user">User-cited UW (lb/in)</option>
			</select>
			<p className="hint" data-uw-source>{DADDARIO_WAYBACK_SOURCE}</p>
		</div>
		<div className="field" data-uw-field hidden>
			<label htmlFor="uw">UW (lb/in)</label>
			<input id="uw" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Enter a manufacturer or measured unit weight. Empty is not a default. No GHS cells are mixed in.</p>
		</div>
	</fieldset>
</CalcShell>
	)
}
