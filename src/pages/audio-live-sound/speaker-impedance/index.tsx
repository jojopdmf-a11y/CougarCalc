import ToolPageLayout from '../../../components/ToolPage.tsx';
import SpeakerImpedanceCalc from '../../../components/SpeakerImpedanceCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeSpeakerImpedance, formatImpedanceCopy, parallelZ } from '../../../calcs/speaker-impedance.ts';
import { formatOhms } from '../../../calcs/format.ts';

export default function Page() {
const example = computeSpeakerImpedance({ mode: 'parallel', impedances: [8, 8] });
if (!example.ok) throw new Error('speaker-impedance example failed');
const bridged = computeSpeakerImpedance({ mode: 'bridged', impedances: [8] });
if (!bridged.ok) throw new Error('speaker-impedance bridged example failed');
const related = relatedAudioPage('speaker-impedance');
const warning =
	'Ohm’s law at the speakON. Bridged Z_ch = Z_load/2. This is not a mains/breaker calculation and does not invent 2× or 4× power.';
const lede = 'Series, parallel, and bridged Z_ch = Z_load/2. Optional speakON voltage. No mains. No 2×/4× power claims.';
	return (
<ToolPageLayout
	title="Speaker impedance"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/speaker-impedance/', label: 'Speaker impedance' },
	]}
>
	<SpeakerImpedanceCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is the combined load in ohms at the speakON. In bridged mode, each amplifier half sees
			Z_load/2. Optional voltage yields current and power from Ohm’s law. It is not a wall-outlet or breaker
			calculation.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">Z_series = Z<sub>1</sub> + Z<sub>2</sub> + ⋯</p>
		<p className="formula">1/Z_parallel = 1/Z<sub>1</sub> + 1/Z<sub>2</sub> + ⋯</p>
		<p className="formula">Bridged: Z<sub>ch</sub> = Z_load / 2</p>
		<p className="formula">I = V / Z_load &nbsp; P = V × I &nbsp;(optional speakON Vrms)</p>
		<p>
			Bridged power is not 2× or 4× of anything here. That depends on the supply rails and the amplifier’s rating
			into the halved impedance. This tool will not invent it.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Two 8 Ω cabinets in parallel: 8 ∥ 8 = {parallelZ([8, 8])} =
				<strong>{formatOhms(example.zLoad)} Ω</strong>.
			</p>
			<p>
				One 8 Ω load on a bridged pair: Z_load = 8 Ω, Z_ch = 8/2 =
				<strong>{formatOhms(bridged.zPerChannel ?? 0)} Ω</strong> per amplifier half.
			</p>
			<p className="mono">{formatImpedanceCopy(example)}</p>
			<p className="mono">{formatImpedanceCopy(bridged)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Resistive nominal Z. No impedance curve, no minimum-Z warning from a datasheet plot.</li>
			<li>Bridged multiple cabinets are series-summed then halved. Typical use is one load.</li>
			<li>Voltage is at the speakON, not the mains receptacle, not a breaker panel.</li>
			<li>No 2×/4× power multiplication.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Parallel two 8 Ω cabs only if the amplifier is stable into 4 Ω at that rating.</li>
			<li>Bridged into 4 Ω load means each half sees 2 Ω. Check the manual before you do that.</li>
			<li>Use the speaker-cable tool if copper is long enough to matter beside Z.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Does bridged always give four times the power?</h3>
		<p>
			No. Each half sees Z/2, so current capability and the supply determine power. Crown and QSC bridging notes
			do not license a universal 4× sticker. This tool will not print one.
		</p>
		<h3>Is this a mains VA calculator?</h3>
		<p>No. No breaker, no IEC inlet, no 120/230 V.</p>
		<h3>What about 70 V?</h3>
		<p>Different domain. Use the 70 V tap tool. This page is low-Z cabinets at a speakON.</p>
		<h3>Can I mix 8 Ω and 4 Ω in parallel?</h3>
		<p>The arithmetic will run. The 4 Ω cabinet takes more power. That may or may not be what you wanted.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>Series and parallel resistor combinations (Ohm’s law).</li>
			<li>Bridged load sharing: each half sees Z_load/2 (power-amplifier bridging practice; Crown / QSC notes).</li>
			<li>No 2×/4× power invention — output depends on the amplifier’s rating into the halved Z.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Nominal-Z arithmetic at the speakON. Not a stability guarantee, not a mains calculation, not a 2×/4× power
			sticker. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
