import CalcShell from './CalcShell.tsx';
import { FENDER_ACOUSTIC_14TH, FENDER_ELECTRIC_17TH, FENDER_SUPPORT_GUIDE_LABEL } from '../calcs/action-worksheet.ts';
import { bindActionWorksheetForm } from '../islands/action-worksheet-ui.ts';

export default function ActionWorksheetCalc() {
const warning =
	'Named-fret heights are a worksheet. Fender 17th-fret electric numbers are a guide, not hard rules. No saddle-height formula is given.';
	return (
<CalcShell
	bind={bindActionWorksheetForm}
	formId="action-worksheet-form"
	emptyMessage="Enter bass and treble heights at a named fret"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Named fret</legend>
		<div className="field">
			<label htmlFor="fret">Fret number</label>
			<input id="fret" type="text" inputMode="numeric" autoComplete="off" />
			<p className="hint">Required. Electric Fender guide numbers are at the 17th. Acoustic 6/64 · 5/64 is the 14th — do not mislabel it as electric 17th.</p>
		</div>
	</fieldset>
	<fieldset>
		<legend>String height</legend>
		<div className="field-grid">
			<div className="field">
				<label htmlFor="bass">Bass side</label>
				<input id="bass" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="treble">Treble side</label>
				<input id="treble" type="text" inputMode="decimal" autoComplete="off" />
			</div>
		</div>
		<div className="field">
			<label htmlFor="unit">Unit</label>
			<select defaultValue="in" id="unit">
				<option value="in">in</option>
				<option value="mm">mm</option>
			</select>
		</div>
		<p className="hint">{FENDER_SUPPORT_GUIDE_LABEL} The 6/64 · 4/64 electric 17th claim is not used.</p>
		<div className="chips" role="group" aria-label="Fender electric 17th guide by radius, not hard rules">
			{
				FENDER_ELECTRIC_17TH.map((row) => (
					<button
						type="button"
						className="chip"
						data-fender-start
						data-fret={String(row.fret)}
						data-bass={String(row.bassIn)}
						data-treble={String(row.trebleIn)}
					>
						{row.radiusLabel}: {row.label.split(' · ').slice(2).join(' · ')} (guide)
					</button>
				))
			}
		</div>
		<div className="chips" role="group" aria-label="Fender acoustic 14th chart, not electric 17th">
			<button
				type="button"
				className="chip"
				data-fender-start
				data-fret={String(FENDER_ACOUSTIC_14TH.fret)}
				data-bass={String(FENDER_ACOUSTIC_14TH.bassIn)}
				data-treble={String(FENDER_ACOUSTIC_14TH.trebleIn)}
			>
				Acoustic 14th: 6/64 · 5/64 (not electric 17th)
			</button>
		</div>
	</fieldset>
</CalcShell>
	)
}
