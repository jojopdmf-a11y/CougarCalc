import CalcShell from './CalcShell.tsx';
import { HEADROOM_CHIP_DB, LEA_LIMITER_DISCLAIMER } from '../calcs/max-spl.ts';
import { MAX_SPL_SAFETY } from '../site.ts';
import { bindMaxSplForm } from '../islands/max-spl-ui.ts';

export default function MaxSplCalc() {
const warning = MAX_SPL_SAFETY;
	return (
<CalcShell
	bind={bindMaxSplForm} formId="max-spl-form" emptyMessage="Enter sensitivity and power" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Sensitivity</legend>
		<div className="field">
			<label htmlFor="sens">Sensitivity (dB SPL)</label>
			<input id="sens" type="text" inputMode="decimal" autoComplete="off" />
		</div>
		<div className="radios">
			<label><input type="radio" name="sens-ref" value="1w1m" defaultChecked /> 1 W / 1 m</label>
			<label><input type="radio" name="sens-ref" value="2.83v1m" /> 2.83 V / 1 m</label>
		</div>
		<div className="field">
			<label htmlFor="z">Z (Ω)</label>
			<input id="z" type="text" inputMode="decimal" defaultValue="8" autoComplete="off" />
			<p className="hint">
				Needed when sensitivity is 2.83 V / 1 m: watts at 2.83 V = 2.83² / Z. 8 Ω = 1 W; 4 Ω = 2 W. Same Z is the
				nominal-Z assumption in the AES and limiter drawers.
			</p>
		</div>
	</fieldset>

	<fieldset>
		<legend>Mode</legend>
		<div className="radios">
			<label><input type="radio" name="mode" value="max-spl" defaultChecked /> Max SPL from power (continuous)</label>
			<label><input type="radio" name="mode" value="watts-for-target" /> Watts for target + headroom (Crown)</label>
		</div>
		<div className="field" data-power-field>
			<label htmlFor="power">Amplifier power (W, continuous)</label>
			<input id="power" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Peak vs continuous: this field is continuous watts. Peak lives in the AES drawer.</p>
		</div>
		<div data-watts-fields hidden>
			<div className="field">
				<label htmlFor="target">Target SPL (dB, continuous)</label>
				<input id="target" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="headroom">Headroom (dB)</label>
				<input id="headroom" type="text" inputMode="decimal" autoComplete="off" />
				<p className="hint">
					You type this. Empty is an error. Crown’s calculator widget uses 3 dB as an example, not as a law.
					Suggested live-sound chips below are from the Crown amplifier-power article (about 6 dB speech, 10–15 dB
					compressed playback, 20 dB uncompressed peaks) — chips fill the field, they are not silent defaults.
				</p>
				<div className="chips" role="group" aria-label="Crown article headroom suggestions">
					{HEADROOM_CHIP_DB.map((db) => (
						<button type="button" className="chip" data-hr-chip data-hr={String(db)} aria-pressed="false">
							{db} dB
						</button>
					))}
				</div>
			</div>
		</div>
	</fieldset>

	<fieldset>
		<legend>Throw, radiation, and box count</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="distance">Distance</label>
				<input id="distance" type="text" inputMode="decimal" defaultValue="1" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="dist-unit">Unit</label>
				<select defaultValue="m" id="dist-unit">
					<option value="m">m</option>
					<option value="ft">ft</option>
				</select>
			</div>
		</div>
		<p className="hint">Point source −20 log10(d / 1 m). Ideal line −10 log10(d / 1 m). Result card shows metres and feet.</p>
		<div className="radios">
			<label><input type="radio" name="radiation" value="point" defaultChecked /> Point source (−20 log10)</label>
			<label><input type="radio" name="radiation" value="line" /> Ideal line source (−10 log10)</label>
		</div>
		<div className="field">
			<label htmlFor="count">Cabinets N</label>
			<input id="count" type="text" inputMode="numeric" defaultValue="1" autoComplete="off" />
		</div>
		<div className="radios">
			<label><input type="radio" name="summing" value="incoherent" defaultChecked /> Incoherent +10 log10(N) (default)</label>
			<label><input type="radio" name="summing" value="coherent" /> Coherent +20 log10(N) (rare)</label>
		</div>
		<p className="hint">
			Coherent summing is only for equal level, in-phase, same distance at that seat. A warning shows on the card
			when you pick it.
		</p>
		<div className="checks">
			<label>
				<input type="checkbox" id="indoor-note" />
				Show Crown-article indoor note (+6 dB) as a labeled extra — never added to the large number
			</label>
		</div>
	</fieldset>

	<details className="drawer">
		<summary>AES / program / peak — conventions, not a lab</summary>
		<p>
			Vrms = √(P · Z). Pick whether Z is labeled Zmin (AES / B&amp;C) or Znom (EAW). Program = 2 × continuous is a
			B&amp;C / QSC / Crown rule of thumb, not physics. 6 dB crest ⇒ Vpeak = 2 Vrms and Ppeak_convention = 4P. AES2-2012
			is a 12 dB crest-factor rating — this drawer will not call 4× “AES peak.” Not a certification. Not a 2-hour lab.
		</p>
		<div className="field">
			<label htmlFor="aes-power">Continuous rating P (W)</label>
			<input id="aes-power" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Empty skips this drawer. Does not change the large SPL / watts number.</p>
		</div>
		<div className="radios">
			<label><input type="radio" name="z-convention" value="zmin" defaultChecked /> Zmin (AES / B&amp;C label)</label>
			<label><input type="radio" name="z-convention" value="znom" /> Znom (EAW label)</label>
		</div>
		<div className="radios">
			<label><input type="radio" name="aes-path" value="6db-convention" defaultChecked /> 6 dB crest convention (4× power labeled)</label>
			<label><input type="radio" name="aes-path" value="aes2-2012-12db" /> AES2-2012 12 dB CF (do not emit 4× as AES peak)</label>
		</div>
	</details>

	<details className="drawer">
		<summary>Limiter / crest starting estimate</summary>
		<p>
			Urms = √(P · Z) at the nominal Z above. CF_dB = 20 log10(Upeak / Urms). 6 dB ⇒ Upeak = 2 Urms; 12 dB ⇒ Upeak =
			4 Urms; custom CF allowed. dBu = 20 log10(U / 0.775). Threshold_dBu = Upeak_dBu − G_amp (processor driving the
			amp). Threshold_dBFS = Threshold_dBu − FS_dBu you enter.
		</p>
		<p className="hint">{LEA_LIMITER_DISCLAIMER}</p>
		<div className="field">
			<label htmlFor="lim-power">Power for estimate (W, continuous)</label>
			<input id="lim-power" type="text" inputMode="decimal" autoComplete="off" />
		</div>
		<div className="field">
			<label htmlFor="lim-cf">Crest factor (dB)</label>
			<input id="lim-cf" type="text" inputMode="decimal" autoComplete="off" />
			<div className="chips" role="group" aria-label="Crest-factor chips">
				<button type="button" className="chip" data-cf-chip data-cf="6" aria-pressed="false">6 dB</button>
				<button type="button" className="chip" data-cf-chip data-cf="12" aria-pressed="false">12 dB</button>
			</div>
		</div>
		<div className="field">
			<label htmlFor="lim-gain">Amp voltage gain G_amp (dB)</label>
			<input id="lim-gain" type="text" inputMode="decimal" autoComplete="off" />
		</div>
		<div className="field">
			<label htmlFor="lim-fs">Processor FS mapping (dBu)</label>
			<input id="lim-fs" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Empty skips this drawer. All four limiter fields are required together.</p>
		</div>
	</details>
</CalcShell>
	)
}
