import CalcShell from './CalcShell.tsx';
import { FS_PRESETS } from '../calcs/gain-staging-dbu-dbfs.ts';
import { GAIN_STAGING_SAFETY } from '../site.ts';
import { bindGainStagingForm } from '../islands/gain-staging-dbu-dbfs-ui.ts';

export default function GainStagingCalc() {
const warning = GAIN_STAGING_SAFETY;
const chips = FS_PRESETS.filter((p) => p.id !== 'custom');
	return (
<CalcShell
	bind={bindGainStagingForm} formId="gain-staging-dbu-dbfs-form" emptyMessage="Enter a level or pick a mode" warning={warning} warningKind="warn">
	<fieldset>
		<legend>Mode</legend>
		<div className="radios">
			<label><input type="radio" name="mode" value="analog-to-dbfs" defaultChecked /> Analog dBu → dBFS (C02)</label>
			<label><input type="radio" name="mode" value="dbu-to-v" /> dBu ↔ Vrms (C01)</label>
			<label><input type="radio" name="mode" value="v-to-dbu" /> Vrms → dBu (C01)</label>
			<label><input type="radio" name="mode" value="mic-pre" /> Mic preamp helper (C05)</label>
			<label><input type="radio" name="mode" value="interconnect" /> +4 vs −10 / bal↔unbal (C06)</label>
			<label><input type="radio" name="mode" value="ha-trim" /> Analog HA vs digital trim (C14)</label>
		</div>
	</fieldset>

	<fieldset>
		<legend>FS mapping (user-replaceable)</legend>
		<div className="field">
			<label htmlFor="fs-dbu">FS_dBu (0 dBFS analog)</label>
			<input id="fs-dbu" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">Required for dBFS. Presets below are published examples — confirm in the manual. No invented DiGiCo/Avid or AES-17 volt.</p>
		</div>
		<div className="chips" role="group" aria-label="Published FS presets, confirm in the manual">
			{
				chips.map((p) => (
					<button type="button" className="chip" data-fs-chip={p.id} aria-pressed="false">
						{p.label}
					</button>
				))
			}
		</div>
	</fieldset>

	<div data-analog-fields>
		<fieldset>
			<legend>Analog level</legend>
			<div className="field">
				<label htmlFor="dbu">Level (dBu)</label>
				<input id="dbu" type="text" inputMode="decimal" autoComplete="off" />
				<p className="hint">0 dBu = 0.775 Vrms. +4 dBu ≈ 1.228 Vrms.</p>
			</div>
			<div className="field">
				<label htmlFor="vrms">Vrms</label>
				<input id="vrms" type="text" inputMode="decimal" autoComplete="off" />
				<p className="hint">Used in Vrms → dBu.</p>
			</div>
			<div className="checks">
				<label>
					<input type="checkbox" id="rane-pad" />
					Apply Rane −6 dB ordinary differential bal→unbal (Note 124)
				</label>
			</div>
		</fieldset>
	</div>

	<div data-mic-fields hidden>
		<fieldset>
			<legend>Mic preamp (user-entered sensitivity only)</legend>
			<div className="field">
				<label htmlFor="spl">SPL (dB)</label>
				<input id="spl" type="text" inputMode="decimal" autoComplete="off" />
				<p className="hint">1 Pa = 94 dB SPL. Not A-weighted.</p>
			</div>
			<div className="field">
				<label htmlFor="mic-sens">Sensitivity (dBV/Pa)</label>
				<input id="mic-sens" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="mic-mv">or mV/Pa</label>
				<input id="mic-mv" type="text" inputMode="decimal" autoComplete="off" />
				<p className="hint">dBV/Pa = 20 log10((mV/Pa)/1000). No scraped Shure table.</p>
			</div>
			<div className="field">
				<label htmlFor="target-dbfs">Target (dBFS)</label>
				<input id="target-dbfs" type="text" inputMode="decimal" defaultValue="-18" autoComplete="off" />
				<p className="hint">Pell-style starting practice, user-editable. Not EBU R68.</p>
			</div>
			<div className="field">
				<label htmlFor="pad">Pad (dB, positive attenuation)</label>
				<input id="pad" type="text" inputMode="decimal" defaultValue="0" autoComplete="off" />
			</div>
		</fieldset>
	</div>

	<div data-interconnect-fields hidden>
		<fieldset>
			<legend>Interconnect</legend>
			<p className="hint">+4 dBu vs −10 dBV offset is 11.78 dB (Biamp / Sengpiel). Not 14 dB.</p>
			<div className="radios">
				<label><input type="radio" name="bal-unbal" value="differential" defaultChecked /> Ordinary differential bal→unbal (−6 dB, Rane 124)</label>
				<label><input type="radio" name="bal-unbal" value="transformer" /> Transformer / cross-coupled (0 dB gain; headroom caveat still applies)</label>
			</div>
		</fieldset>
	</div>

	<div data-ha-fields hidden>
		<fieldset>
			<legend>Analog HA vs digital trim</legend>
			<div className="field">
				<label htmlFor="delta-ha">Analog HA change (dB)</label>
				<input id="delta-ha" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="checks">
				<label>
					<input type="checkbox" id="yamaha-comp" />
					Yamaha-style rack compensation (network_level_change = 0)
				</label>
			</div>
			<div className="field">
				<label htmlFor="pell">Peak-meter practice target (dBFS, optional)</label>
				<input id="pell" type="text" inputMode="decimal" defaultValue="-18" autoComplete="off" />
				<p className="hint">Pell practice, user-editable. Do not conflate with EBU R68 / C02 FS mapping. Digital trim cannot unclip an analog HA clip.</p>
			</div>
		</fieldset>
	</div>
</CalcShell>
	)
}
