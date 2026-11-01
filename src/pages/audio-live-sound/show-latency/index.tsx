import ToolPageLayout from '../../../components/ToolPage.tsx';
import ShowLatencyCalc from '../../../components/ShowLatencyCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	computeShowLatency,
	formatShowLatencyCopy,
	samplesToMs,
	DANTE_HOP_TABLE,
	AIR_C_20C,
	PSW_ROUNDTRIP_GUIDELINE_MS,
} from '../../../calcs/show-latency.ts';
import { formatMs } from '../../../calcs/format.ts';

export default function Page() {
const example = computeShowLatency({
	stages: [{ label: 'buffer', samples: 32, sampleRate: 48000 }],
	includeAirPath: true,
});
if (!example.ok) throw new Error('show-latency example failed');
const related = relatedAudioPage('show-latency');
const warning =
	'Dante Controller latency is not analog I/O latency. Hop times are discrete Audinate table rows, not interpolated. A ~5 ms in-ear round trip (ProSoundWeb) is a guideline, not a law.';
const lede =
	'Series stage times, samples-to-milliseconds, optional air path. Dante hops are table rows, not an interpolated law.';
	return (
<ToolPageLayout
	title="Show latency"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/show-latency/', label: 'Show latency' },
	]}
>
	<ShowLatencyCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is the sum of the stage times you entered, plus a Dante table row if you picked one. It is
			not analog input-to-output latency by itself: Controller latency is the network hop setting, not the
			converter.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">t_total = Σ t_i</p>
		<p className="formula">t_ms = 1000 × N / f<sub>s</sub></p>
		<p>
			Optional air path = c × t at {AIR_C_20C} m/s (Sengpiel 331.3 + 0.6 × 20). Dante suggestions are the five
			Audinate rows below. Intermediate hop counts are not interpolated.
		</p>
		<ul>
			{DANTE_HOP_TABLE.map((row) => (
				<li>
					{row.hops} switch hop(s) → {row.ms} ms
				</li>
			))}
		</ul>
		<p>ProSoundWeb discusses ~{PSW_ROUNDTRIP_GUIDELINE_MS} ms as an in-ear round-trip guideline, not a law.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				32 samples at 48 kHz. t = 1000 × 32 / 48000 =
				<strong>{formatMs(samplesToMs(32, 48000))} ms</strong>
				(exactly {samplesToMs(32, 48000)} ms). With air path on, distance =
				{AIR_C_20C} × t seconds.
			</p>
			<p className="mono">{formatShowLatencyCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Stages add in series. Parallel buses and redundant Dante are not modeled.</li>
			<li>Dante values are Audinate’s discrete suggestions, not a measurement of your switches.</li>
			<li>Analog I/O, SRC, and speaker processing are separate stages you must type if you care about them.</li>
			<li>Air path uses 20 °C Sengpiel only. Humidity and wind are ignored.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Add the converter, the DSP, the network, and the radio pack as separate rows. One number is not the show.</li>
			<li>In-ears feel late from round trip. A ~5 ms one-way buffer is not the same as 5 ms mouth-to-ear.</li>
			<li>If Dante Controller says 1 ms, that is not the analog round trip through the stage box.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Is Dante Controller latency analog I/O latency?</h3>
		<p>
			No. Audinate documents Controller latency as the time allowed for packets to cross the network. Converters
			and SRC sit outside that number.
		</p>
		<h3>Can I interpolate 7 hops?</h3>
		<p>No. The table has 1, 3, 5, 10, and “+10” rows. This tool will not invent a 7-hop millisecond value.</p>
		<h3>Is 5 ms the IEM limit?</h3>
		<p>
			ProSoundWeb has discussed ~5 ms as a round-trip comfort guideline. Players disagree. It is labeled a
			guideline on the card.
		</p>
		<h3>Why 343.3 m/s?</h3>
		<p>Same Sengpiel line as speaker delay at 20 °C: 331.3 + 0.6 × 20. Not 344, not 1130 ft/s rounded.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>
				<a href="https://support.getdante.com/hc/en-gb/articles/5508275296415-How-is-latency-adjusted-in-a-Dante-system"
					>Audinate — How is latency adjusted in a Dante system (discrete hop table)</a
				>
			</li>
			<li>t_ms = 1000 × N / fs (digital audio buffers).</li>
			<li>ProSoundWeb — in-ear round-trip on the order of ~5 ms as a guideline, not a law.</li>
			<li>Sengpiel simplified c = 331.3 + 0.6 × T_C (air path at 20 °C = 343.3 m/s).</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Bookkeeping sum of the times you type. Not a measurement, not analog I/O, not a Dante certificate. Hop rows
			are not interpolated. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
