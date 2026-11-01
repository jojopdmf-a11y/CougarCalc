import ToolPageLayout from '../../../components/ToolPage.tsx';
import SpeakerCableLossCalc from '../../../components/SpeakerCableLossCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	COPPER_DCR_OHM_PER_KFT,
	COPPER_DCR_SOURCE,
	computeSpeakerCableLoss,
	formatCableLossCopy,
} from '../../../calcs/speaker-cable-loss.ts';
import { formatDb, formatFixed, formatOhms } from '../../../calcs/format.ts';

export default function Page() {
const cited12 = COPPER_DCR_OHM_PER_KFT['12'];
const example = computeSpeakerCableLoss({
	length: 50,
	lengthUnit: 'ft',
	dcr: null,
	dcrUnit: 'ohm-per-kft',
	awgPreset: '12',
	loadZ: 8,
	reOhm: null,
	zAmpOhm: null,
});
if (!example.ok) throw new Error('speaker-cable-loss example failed');
const related = relatedAudioPage('speaker-cable-loss');
const warning =
	'Speaker-level copper loop only. Not 70 V constant-voltage, not an NEC ampacity table, not a fire-rating. Lumen power shortfall (1−ratio²) and BoomSpeaker R/(R+Z) are different percentages — both are shown.';
const lede =
	'Speaker-level copper loop from cited 12 AWG DCR or a custom Ω/kft. Voltage ratio and both loss percentages. Not 70 V and not NEC.';
	return (
<ToolPageLayout
	title="Speaker cable loss"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/speaker-cable-loss/', label: 'Speaker cable loss' },
	]}
>
	<SpeakerCableLossCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is voltage attenuation in dB from the copper loop. Under it are two different percentages:
			Lumen power shortfall 100×(1−ratio²) and the BoomSpeaker resistance ratio R/(R+Z). They are not the same
			number. This is not a 70 V tap calculator and not an ampacity table.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">loop R = 2 × L<sub>ft</sub> × DCR<sub>per kft</sub> / 1000</p>
		<p className="formula">voltage ratio = Z / (Z + R)</p>
		<p className="formula">Lumen shortfall % = 100 × (1 − ratio²)</p>
		<p className="formula">BoomSpeaker resistance-ratio % = 100 × R / (R + Z)</p>
		<p className="formula">atten = −20 log<sub>10</sub>(ratio) &nbsp; DF = Re / (Zamp + Rcable) when both are entered</p>
		<p>
			Cited preset: 12 AWG = {cited12.dcr} Ω/kft ({COPPER_DCR_SOURCE}). Other AWG gauges fail closed. Custom DCR in
			Ω/kft or Ω/km still works. DF is not computed unless you type Re and Zamp — no baked Re.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				50 ft of cited 12 AWG (DCR {cited12.dcr} Ω/kft, {COPPER_DCR_SOURCE}) into 8 Ω. Re is not entered — no DF.
				Loop R = 2 × 50 × {cited12.dcr}/1000 =
				<strong>{formatOhms(example.loopR)} Ω</strong>.
				Lumen shortfall = <strong>{formatFixed(example.powerShortfallPct, 2)}%</strong>.
				BoomSpeaker R/(R+Z) = <strong>{formatFixed(example.resistanceRatioPct, 2)}%</strong>.
				Atten = <strong>{formatDb(example.attenDb)} dB</strong>.
			</p>
			<p className="mono">{formatCableLossCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>DC resistance of copper at the cited 12 AWG cell, or the DCR you typed.</li>
			<li>Two-conductor loop. SpeakON +1/−1 only; 70 V distributed lines are a different tool.</li>
			<li>Load Z is the number you typed. It is not a full impedance curve.</li>
			<li>Not NEC ampacity, conduit fill, voltage drop for 120 V, or fire rating.</li>
			<li>Re = 6.4 is not used as a default. Butler Audio is not mixed with McGregor here.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>If someone quotes “3% cable loss,” ask which percentage. This page prints both, labeled.</li>
			<li>Uncited AWG chips refuse on purpose. Type a datasheet DCR instead.</li>
			<li>Ω/km is converted as × 0.3048 to Ω/kft before the Lumen loop formula.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why are the two percentages different?</h3>
		<p>
			Lumen shortfall is power delivered to the load scaling with voltage squared, so 1−ratio². BoomSpeaker
			R/(R+Z) is the series divider fraction. They agree only in a limit that live copper rarely hits.
		</p>
		<h3>Can I use this for 70 V?</h3>
		<p>No. Constant-voltage taps are the 70 V tap tool. This is speaker-level low-Z copper.</p>
		<h3>Is this an NEC table?</h3>
		<p>No. The 12 AWG cell is PowerStream + Lumen JS observed, not Chapter 9 ampacity.</p>
		<h3>Why did 14 AWG error?</h3>
		<p>That gauge is not in the cited PowerStream + Lumen set in this checkout. Fail closed. Custom DCR still works.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>12 AWG DCR 1.588 Ω/kft — {COPPER_DCR_SOURCE}.</li>
			<li>Lumen loop R = 2 × L_ft × DCR/1000; voltage ratio Z/(Z+R); shortfall 100×(1−ratio²); atten −20 log10(ratio).</li>
			<li>BoomSpeaker resistance-ratio % = 100 × R/(R+Z), labeled separately.</li>
			<li>DF = Re / (Zamp + Rcable) with user-entered Re and Zamp only. Re = 6.4 is not shipped.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			DC copper estimate from the cited 12 AWG cell or the DCR you typed. Not 70 V, not NEC, not a thermal rating.
			CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
