import CalcShell from './CalcShell.tsx';
import { COPPER_DCR_OHM_PER_KFT, UNCITED_AWG_PRESET_IDS } from '../calcs/speaker-cable-loss.ts';
import { bindSpeakerCableLossForm } from '../islands/speaker-cable-loss-ui.ts';

export default function SpeakerCableLossCalc() {
const warning =
	'Speaker-level copper loop only. Not 70 V constant-voltage, not an NEC ampacity table, not a fire-rating. Lumen power shortfall (1−ratio²) and BoomSpeaker R/(R+Z) are different percentages — both are shown.';
const cited12 = COPPER_DCR_OHM_PER_KFT['12'];
	return (
<CalcShell
	bind={bindSpeakerCableLossForm} formId="speaker-cable-loss-form" emptyMessage="Enter cable length and a DCR" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Cable</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="length">Length (one-way)</label>
				<input id="length" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="length-unit">Unit</label>
				<select defaultValue="ft" id="length-unit">
					<option value="ft">ft</option>
					<option value="m">m</option>
				</select>
			</div>
		</div>
		<p className="hint">Loop uses two conductors: R = 2 × L_ft × DCR_per_kft / 1000.</p>
		<div className="field-row">
			<div className="field">
				<label htmlFor="dcr">DCR</label>
				<input id="dcr" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="dcr-unit">DCR unit</label>
				<select defaultValue="ohm-per-kft" id="dcr-unit">
					<option value="ohm-per-kft">Ω / 1000 ft</option>
					<option value="ohm-per-km">Ω / km</option>
				</select>
			</div>
		</div>
		<p className="hint">Custom DCR, or the cited 12 AWG chip. Empty is not a default.</p>
		<div className="chips" role="group" aria-label="Cited AWG DCR">
			<button
				type="button"
				className="chip"
				data-awg-chip
				data-awg={cited12.awg}
				data-dcr={String(cited12.dcr)}
			>
				{cited12.awg} AWG · {cited12.dcr} Ω/kft
			</button>
		</div>
		<div className="chips" role="group" aria-label="Uncited AWG presets — fail closed">
			{
				UNCITED_AWG_PRESET_IDS.map((awg) => (
					<button type="button" className="chip" data-awg-refuse data-awg={awg}>
						{awg} AWG (uncited)
					</button>
				))
			}
		</div>
		<p className="hint">12 AWG 1.588 Ω/kft is PowerStream + Lumen JS observed. Other AWG chips fail closed.</p>
	</fieldset>
	<fieldset>
		<legend>Load and amplifier</legend>
		<div className="field">
			<label htmlFor="load-z">Load Z (Ω)</label>
			<input id="load-z" type="text" inputMode="decimal" autoComplete="off" />
		</div>
		<div className="field">
			<label htmlFor="re">Re (Ω) — optional, for DF</label>
			<input id="re" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">DF = Re / (Zamp + Rcable) only if you enter both. No baked Re. Do not treat 6.4 as a McGregor default.</p>
		</div>
		<div className="field">
			<label htmlFor="zamp">Amplifier source Z (Ω) — optional, for DF</label>
			<input id="zamp" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Required with Re for DF. Type 0 if you treat source Z as zero. Empty skips DF.</p>
		</div>
	</fieldset>
</CalcShell>
	)
}
