import ToolPageLayout from '../../../components/ToolPage.tsx';
import GainStagingCalc from '../../../components/GainStagingCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { GAIN_STAGING_LEDE, GAIN_STAGING_SAFETY, GAIN_STAGING_TITLE, LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	PLUS4_VS_MINUS10_DB,
	analogToDbfs,
	computeGainStaging,
	dBuFromDBv,
	formatGainCopy,
	preampGainDb,
	vrmsFromDbu,
} from '../../../calcs/gain-staging-dbu-dbfs.ts';
import { formatDb, formatFixed } from '../../../calcs/format.ts';

export default function Page() {
const plus4 = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, fsDbu: 24, applyRanePad: false });
if (!plus4.ok) throw new Error('gain-staging +24 example failed');
const rme = computeGainStaging({ mode: 'analog-to-dbfs', dBu: 4, fsDbu: 19, applyRanePad: false });
if (!rme.ok) throw new Error('gain-staging RME example failed');
const micDbu = dBuFromDBv(-59);
const micGain = preampGainDb(-18, 24, micDbu, 0);
const related = relatedAudioPage('gain-staging-dbu-dbfs');
	return (
<ToolPageLayout
	title={GAIN_STAGING_TITLE}
	description={GAIN_STAGING_LEDE}
	kicker="Audio / live sound"
	lede={GAIN_STAGING_LEDE}
	warning={GAIN_STAGING_SAFETY}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/gain-staging-dbu-dbfs/', label: 'Gain staging' },
	]}
>
	<GainStagingCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is analog dBFS relative to the FS_dBu you typed, or Vrms / dBu / a helper result. It is not a
			loudness meter. Presets fill FS_dBu; they do not replace the converter manual.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">Vrms = 0.775 × 10<sup>dBu/20</sup></p>
		<p className="formula">dBu = 20 log<sub>10</sub>(Vrms / 0.775)</p>
		<p className="formula">dBV = 20 log<sub>10</sub>(Vrms / 1)</p>
		<p>dBu = dBV + 20 log10(1/0.775) ≈ dBV + 2.218.</p>
		<p className="formula">dBFS = analog_dBu − FS_dBu</p>
		<p className="formula">headroom = FS_dBu − analog_dBu</p>
		<p>
			+4 dBu vs −10 dBV = <strong>{formatFixed(PLUS4_VS_MINUS10_DB, 2)} dB</strong> (Biamp / Sengpiel). Not 14 dB.
			+4 dBu ≈ 1.228 Vrms. −10 dBV = 0.316 Vrms ≡ −7.78 dBu.
		</p>
		<p>Mic: 1 Pa = 94 dB SPL. L_dBV = sens_dBV/Pa + (SPL − 94). mic_dBu = L_dBV + 20 log10(1/0.775).</p>
		<p className="formula">gain_dB = target_dBFS + FS_dBu − mic_dBu + pad_dB</p>
		<p>Ordinary differential bal→unbal: −6 dB (Rane Note 124). Transformer / cross-coupled: 0 dB gain.</p>
		<p>Without HA compensation: delta_trim = −delta_HA. Yamaha-style compensation: network_level_change = 0.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				+4 dBu into FS = +24 dBu: dBFS = {analogToDbfs(4, 24)} = <strong>{formatDb(plus4.dBfs ?? 0)} dBFS</strong>,
				headroom 20 dB. Vrms = 0.775 × 10<sup>4/20</sup> = {formatFixed(vrmsFromDbu(4), 4)} V.
			</p>
			<p>Same +4 dBu into RME Lo Gain FS = +19: <strong>{formatDb(rme.dBfs ?? 0)} dBFS</strong>.</p>
			<p>
				Mic −59 dBV/Pa at 94 dB SPL: L = −59 dBV. With FS +24 and target −18 dBFS, pad 0: gain =
				<strong>{formatDb(micGain)} dB</strong>.
			</p>
			<p className="mono">{formatGainCopy(plus4)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>You supply FS_dBu. Empty FS in analog-to-dBFS mode is an error, not a default AES-17 volt.</li>
			<li>Published chips (Yamaha/Biamp +24, RME +19/+13, RME −10 path as +2 dBV converted, EBU +18, US post +24) are examples.</li>
			<li>Sine crest ≈ 3 dB and program 12–20 dB peaks are notes, not a calc law.</li>
			<li>Pell −18 dBFS peak-meter practice is user-editable and is not EBU R68.</li>
			<li>No DiGiCo or Avid FS numbers are stored here.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Confirm 0 dBFS analog in the console or interface manual before you trust a chip.</li>
			<li>A +24 dBu line into a +18 dBu amp input clips. Mapping errors show up as converter or amp clips.</li>
			<li>Digital trim cannot unclip an analog HA clip.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why isn’t +4 vs −10 equal to 14 dB or 12 dB?</h3>
		<p>−10 dBV is 0.316 Vrms ≡ −7.78 dBu. +4 − (−7.78) = 11.78 dB.</p>
		<h3>Is the EBU chip the same as Pell −18 dBFS?</h3>
		<p>No. EBU-style 0 dBu ↔ −18 dBFS is an FS mapping (FS = +18 dBu). Pell −18 is a meter-practice target you can edit.</p>
		<h3>Can I leave FS empty?</h3>
		<p>Not in analog-to-dBFS mode. The card errors instead of inventing a volt.</p>
		<h3>Does digital trim fix a clipped preamp?</h3>
		<p>No. Analog HA clip cannot be repaired in the digital trim.</p>
	</section>
	<RelatedTools
		tools={related}
		intro={AUDIO_RELATED_INTRO}
	/>
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>0 dBu = 0.775 Vrms. dBu = dBV + 20 log10(1/0.775). +4 vs −10 = 11.78 dB (Biamp / Sengpiel).</li>
			<li>RME published analog FS examples used as labeled chips: Lo Gain +19 dBu; +4 dBu switch +13 dBu; −10 dBV path +2 dBV. Confirm in the manual. No extra URL invented here.</li>
			<li>Biamp Tesira / Yamaha note: 0 dBFS = +24 dBu as a labeled class example. Confirm in the manual.</li>
			<li>Rane Note 124 — ordinary differential bal→unbal −6 dB; transformer / cross-coupled 0 dB gain with a headroom caveat. (URL not in this checkout; not invented.)</li>
			<li>BBC WHP202, Yamaha CL FAQ, PSW Pell peak-meter practice, Lumen mic-preamp helper: named as in the locked spec. URLs not in this checkout; not invented.</li>
			<li>
				<a href="https://www.sengpielaudio.com/calculator-speedsound.htm">Sengpielaudio</a>
				{' '}(site already cited in this prototype; dBu/dBV identities match the locked 0.775 V and 11.78 dB offset)
			</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Level arithmetic only. Wrong FS mapping clips converters or amplifiers. Presets are examples. Digital trim
			cannot unclip analog HA. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
