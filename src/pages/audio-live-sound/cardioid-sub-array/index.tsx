import ToolPageLayout from '../../../components/ToolPage.tsx';
import CardioidSubCalc from '../../../components/CardioidSubCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeCardioidSub, formatCardioidCopy } from '../../../calcs/cardioid-sub.ts';
import { formatDualLength, formatMs, formatSpeed } from '../../../calcs/format.ts';

export default function Page() {
const example = computeCardioidSub({ frequencyHz: 80, temperature: 20, temperatureUnit: 'C' });
if (!example.ok) throw new Error('cardioid-sub example failed');
const related = relatedAudioPage('cardioid-sub-array');
const warning =
	'λ/4 spacing and rear delay plus invert. This is not a manufacturer preset (not a d&b, Meyer, or L-Acoustics cardioid mode). Verify with measurement.';
const lede = 'λ/4 physical spacing and rear-sub delay with inverted polarity. Not a branded cardioid preset.';
	return (
<ToolPageLayout
	title="Cardioid sub array"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/cardioid-sub-array/', label: 'Cardioid sub array' },
	]}
>
	<CardioidSubCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is the delay to put on the rear cabinet, with polarity inverted. Spacing is one-quarter
			wavelength at the design frequency, not half. It is a geometric starting point, not a manufacturer cardioid
			mode.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">c = 331.3 + 0.6 × T_C &nbsp;(m/s, Sengpiel simplified)</p>
		<p className="formula">λ = c / f</p>
		<p className="formula">spacing = λ / 4 &nbsp;(not λ / 2)</p>
		<p className="formula">t_rear = 1000 × spacing / c = 1000 / (4f) &nbsp;ms</p>
		<p>Rear polarity is inverted so the rear arrival cancels behind the pair at that frequency.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				80 Hz at 20 °C. c = {formatSpeed(example.c_m_s)} m/s. λ = c/80 =
				{formatDualLength(example.lambda_m)}. λ/4 spacing =
				<strong>{formatDualLength(example.spacing_m)}</strong>. Rear delay = 1000/(4×80) =
				<strong>{formatMs(example.rearDelayMs)} ms</strong>, polarity inverted.
			</p>
			<p className="mono">{formatCardioidCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Two sources, one design frequency. Bandwidth, floor bounce, and arrays of N are not modeled.</li>
			<li>λ/4, not λ/2. Half-wave spacing is a different (usually worse) starting guess.</li>
			<li>Same Sengpiel air line as speaker delay. Humidity ignored.</li>
			<li>Not a d&b, Meyer, L-Acoustics, or JBL preset. Those DSP modes include filters this page does not.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure behind and in front of the pair. Geometric delay is a start; mag and phase still move with level.</li>
			<li>If the manufacturer has a cardioid mode, use that when you are on their boxes. This page is physics only.</li>
			<li>Temperature changes c and therefore spacing in metres. Delay in ms at a given f is 1000/(4f) even if c changes, because spacing scales with c.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why not λ/2?</h3>
		<p>
			A rear cabinet delayed by the travel time of λ/4 with inverted polarity is the classic end-fire / gradient
			starting geometry. λ/2 puts a different null. This tool will not silently switch to λ/2.
		</p>
		<h3>Is this the same as a manufacturer cardioid preset?</h3>
		<p>
			No. Factory modes add all-pass and FIR that this page does not know. Do not type these milliseconds over a
			preset and expect the same polar.
		</p>
		<h3>Does delay stay 1000/(4f) if I change temperature?</h3>
		<p>
			Yes for this geometry: spacing = c/(4f), t = spacing/c = 1/(4f). The physical gap in metres does change with
			c.
		</p>
		<h3>Can I use this for cardioid mains?</h3>
		<p>The same λ/4 idea appears in gradient arrays. This page is labeled for sub pairs. Verify either way.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>Sengpiel simplified c = 331.3 + 0.6 × T_C (same line as speaker delay).</li>
			<li>Gradient / end-fire sub pair: λ/4 spacing, rear delayed by travel time, polarity inverted (live-sound practice; not a branded DSP dump).</li>
			<li>Manufacturer cardioid modes (d&amp;b, Meyer, L-Acoustics) include extra filters — not cloned here.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Geometric starting point at one frequency. Not a polar prediction, not a factory preset. Verify behind the
			stack. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
