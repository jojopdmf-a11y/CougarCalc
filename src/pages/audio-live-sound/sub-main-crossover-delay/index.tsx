import ToolPageLayout from '../../../components/ToolPage.tsx';
import SubMainDelayCalc from '../../../components/SubMainDelayCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeSubMainDelay, formatSubMainCopy, speedOfSoundSubMain } from '../../../calcs/sub-main-delay.ts';
import { formatDualLength, formatFixed, formatMs, formatSpeed } from '../../../calcs/format.ts';

export default function Page() {
const example = computeSubMainDelay({
	pathSub: 12,
	pathMain: 10,
	lengthUnit: 'm',
	temperature: 20,
	temperatureUnit: 'C',
	filterDelayMs: null,
	crossoverHz: 80,
});
if (!example.ok) throw new Error('sub-main-delay example failed');
const c20 = speedOfSoundSubMain(20);
const related = relatedAudioPage('sub-main-crossover-delay');
const warning =
	'Geometric path difference at this page’s air line (331.3 + 0.606×T_C). This is not Rational Acoustics SubAligner and does not read a transfer-function trace.';
const lede =
	'Geometric path difference between sub and main. Delay the earlier path. Air c is 331.3 + 0.606×T_C (343.42 m/s at 20 °C). Not SubAligner.';
	return (
<ToolPageLayout
	title="Sub / main crossover delay"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/sub-main-crossover-delay/', label: 'Sub / main crossover delay' },
	]}
>
	<SubMainDelayCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is geometric delay plus any filter note you typed. The decision line names the earlier path
			(sub or main). Optional φ is geometric only. It is physics to one seat, not a transfer-function alignment
			and not SubAligner.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">c = 331.3 + 0.606 × T_C &nbsp;(m/s)</p>
		<p>
			At 20 °C that is {formatSpeed(c20)} m/s (331.3 + 0.606 × 20 = 343.42) — not a hardcoded 343, and not
			speaker-delay’s Sengpiel simplified 0.6×T → 343.3 m/s (locked A-C-01). The two air lines stay separate
			until CougarCalc UnHOLD.
		</p>
		<p className="formula">Δt = |r_sub − r_main| / c</p>
		<p className="formula">φ(°) = 360 · f_c · Δt<sub>seconds</sub> &nbsp;(wrap ±180°, geometric only)</p>
		<p>Delay the earlier (usually closer) path. No filter phase, FIR, or SubAligner data is modeled.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Sub 12 m, main 10 m, 20 °C. c = 331.3 + 0.606 × 20 = {formatSpeed(example.c_m_s)} m/s (not 343, not 343.3). Path difference
				{formatDualLength(Math.abs(example.pathSub_m - example.pathMain_m))}. Geometric delay = 1000 × 2 / {formatSpeed(c20)} =
				<strong>{formatMs(example.geometricMs)} ms</strong> on the
				<strong>{example.delayChannel}</strong> (earlier) path.
				{
					example.phaseDeg !== null && (
						<>
							{' '}
							At 80 Hz, φ = 360 × 80 × (2/{formatSpeed(c20)}) =
							<strong>{formatFixed(example.phaseDeg, 1)}°</strong> (wrap ±180°).
						</>
					)
				}
			</p>
			<p className="mono">{formatSubMainCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Straight-line acoustic centers to one seat. No bounce, no array length, no ground plane.</li>
			<li>This page’s c uses 0.606×T_C. Speaker-delay keeps Sengpiel 0.6×T. They are not unified here.</li>
			<li>Filter delay note is whatever you type. Crossover traces are not modeled.</li>
			<li>Humidity ignored. Not Rational Acoustics SubAligner, not a mag/phase optimizer.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure both paths the same way you will listen. Cabinet-to-cabinet is the wrong geometry for this page.</li>
			<li>If the sub is farther, delay the main (the closer path). Inverting that makes a hole or a bump at the crossover.</li>
			<li>φ is a geometric check at one frequency. It is not a filter-phase prediction.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Is this SubAligner?</h3>
		<p>
			No. SubAligner uses a measured transfer function. This page adds two path lengths and optional numbers you
			type.
		</p>
		<h3>Why is c not 343.3 m/s?</h3>
		<p>
			Speaker-delay is locked to Sengpiel simplified 331.3 + 0.6×T_C (343.3 at 20 °C). This page uses Visual
			Acoustic / Lumen 0.606×T_C (343.42 at 20 °C). Do not swap them. Do not hardcode 343.
		</p>
		<h3>Why delay the closer path?</h3>
		<p>
			The closer arrival is early. Delay it so both land together. Same arrival rule as speaker-delay; here the
			two paths are named sub and main.
		</p>
		<h3>Should I add Haas?</h3>
		<p>Not on this page. Haas extra belongs on the speaker-delay tool if you want localization offset.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>Visual Acoustic / Lumen delay page — c = 331.3 + 0.606 × T_C; 343.42 m/s at 20 °C. Not hardcoded 343.</li>
			<li>Geometric Δt = |r_sub − r_main| / c; delay the earlier path.</li>
			<li>φ(°) = 360 · fc · Δt, wrap ±180°, geometric only.</li>
			<li>Speaker-delay Sengpiel 0.6×T (A-C-01) is a different locked line — not used here.</li>
			<li>Rational Acoustics SubAligner is a measured-trace method — not cloned here.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Geometric aid at one seat. Not SubAligner, not a crossover designer, not a polar. Verify with measurement.
			CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
