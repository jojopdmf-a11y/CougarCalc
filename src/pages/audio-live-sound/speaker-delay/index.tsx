import ToolPageLayout from '../../../components/ToolPage.tsx';
import SpeakerDelayCalc from '../../../components/SpeakerDelayCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { DELAY_LEDE, DELAY_SAFETY, DELAY_TITLE, LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	computeSpeakerDelay,
	formatDelayCopy,
	formatDelayMsDisplay,
} from '../../../calcs/speaker-delay.ts';

export default function Page() {
const example = computeSpeakerDelay({
	pathA: 30,
	pathB: 20,
	lengthUnit: 'm',
	temperature: 20,
	temperatureUnit: 'C',
	haasMs: 0,
	sampleRate: 48000,
});
if (!example.ok) {
	throw new Error('Worked example 1 failed to compute');
}
const exampleHaas = computeSpeakerDelay({
	pathA: 30,
	pathB: 20,
	lengthUnit: 'm',
	temperature: 20,
	temperatureUnit: 'C',
	haasMs: 8,
	sampleRate: 48000,
});
if (!exampleHaas.ok) {
	throw new Error('Worked example 1 + Haas failed to compute');
}

const related = relatedAudioPage('speaker-delay');
	return (
<ToolPageLayout
	title={DELAY_TITLE}
	description={DELAY_LEDE}
	kicker="Audio / live sound"
	lede={DELAY_LEDE}
	warning={DELAY_SAFETY}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/speaker-delay/', label: 'Speaker delay' },
	]}
>
	<SpeakerDelayCalc />

	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is the delay to put on the closer (earlier) path: 1000 × |t_A − t_B| milliseconds,
			plus any Haas extra. “Delay path A” or “Delay path B” is the channel. Milliseconds are never
			negative. Existing latency is already inside t_A and t_B, so a high-latency fill can become the
			later arrival and flip the channel. Haas extra adds to that already-chosen channel.
		</p>
	</section>

	<section className="prose">
		<h2>Formula / method</h2>
		<p>Sengpiel simplified speed of air only (not AudioCalcs 1086 + 1.08 × T_F, not 344 m/s, no square-root form):</p>
		<p className="formula">c = 331.3 + 0.6 × T_C &nbsp; (m/s)</p>
		<p>Arrival times, with L in seconds (empty latency fields are 0):</p>
		<p className="formula">t_A = r_A / c + L_A</p>
		<p className="formula">t_B = r_B / c + L_B</p>
		<p>Delay the earlier arrival by 1000 × |t_A − t_B| ms. Always ≥ 0. Haas extra adds to that channel.</p>
		<p>
			Intermediates are float64 and are not rounded. The card shows delay to one decimal millisecond.
			Samples are the unrounded product t_set × fs / 1000; the card also shows the nearest sample.
		</p>
	</section>

	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Path A 30 m, Path B 20 m, 20 °C, Haas off. c = 331.3 + 0.6 × 20 = <strong>343.3 m/s</strong>.
				t_A = 30 / 343.3, t_B = 20 / 343.3. Delay = 1000 × |t_A − t_B| ={' '}
				<span className="mono">{example.arrivalDelay_ms}</span> ms, displayed as{' '}
				<strong>{formatDelayMsDisplay(example.t_set)} ms</strong>. The closer (earlier) path is B.
				<strong> Delay path B.</strong>
			</p>
			<p>
				Samples at 48 kHz from the unrounded product: <span className="mono">{example.samples}</span>, nearest
				sample {example.nearestSample}. Not from rounded 29.1 × 48.
			</p>
			<p>
				Same inputs with front-fill Haas 8 ms: Haas adds to path B. t_set ={' '}
				<span className="mono">{exampleHaas.t_set}</span> ms, displayed as{' '}
				<strong>{formatDelayMsDisplay(exampleHaas.t_set)} ms</strong>.
			</p>
			<p className="mono">{formatDelayCopy(example)}</p>
			<p className="mono">{formatDelayCopy(exampleHaas)}</p>
		</div>
	</section>

	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Straight-line paths from acoustic centers to one seat. No bounce path, no array length.</li>
			<li>Dry-air Sengpiel line. Humidity, altitude, and wind are ignored.</li>
			<li>Geometric delay is valid at that seat, not a zone and not a 2D coverage map.</li>
			<li>Haas extra is signal- and level-dependent, not a physical constant.</li>
			<li>Latency fields are whatever you measured or read from the processor. Empty means 0.</li>
		</ul>
	</section>

	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure both paths the same way you will listen: to the seat, not cabinet-to-cabinet.</li>
			<li>Put the delay on the closer (earlier) path. If you invert that, you get echo, comb, or image pull.</li>
			<li>Verify with an impulse response (or a known measurement method) before the show.</li>
			<li>Temperature is labeled as a default, not a weather reading. Change it if the air is not 20 °C.</li>
			<li>This is not Smaart and not a manufacturer preset.</li>
		</ul>
	</section>

	<section className="prose">
		<h2>FAQs</h2>
		<h3>Do I delay the mains or the fill?</h3>
		<p>
			You delay the closer (earlier) path at that seat. That is usually the fill. Do not delay the later
			path. Processor latency on the fill can flip which path is earlier.
		</p>
		<h3>Why isn’t this the distance from the stage to the delay tower?</h3>
		<p>
			That is a different geometry (aligning at the delay cabinet). This tool is two paths to one seat.
		</p>
		<h3>Should I add Haas?</h3>
		<p>
			Only if you want the later (usually main) source to win localization. It is a starting offset.
			QSC discusses about 10–20 ms; SonaVyx discusses about 5–10 ms for front fills and 10–20 ms for
			towers. None of those numbers is a law. Haas adds to the already-chosen channel.
		</p>
		<h3>Does humidity matter?</h3>
		<p>It changes c a little. This prototype ignores it.</p>
		<h3>Why don’t samples match 29.1 × 48?</h3>
		<p>
			29.1 is display rounding. Samples are the unrounded product. The card also labels the nearest
			sample.
		</p>
	</section>

	<RelatedTools
		tools={related}
		intro={AUDIO_RELATED_INTRO}
	/>

	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>
				<a href="https://www.sengpielaudio.com/calculator-soundpath.htm">Sengpielaudio — sound path / delay</a>
			</li>
			<li>
				<a href="https://www.sengpielaudio.com/calculator-speedsound.htm">Sengpielaudio — speed of sound</a>
				{' '}(simplified c = 331.3 + 0.6 × T_C)
			</li>
			<li>
				<a href="https://www.qsc.com/resource-files/whitepapers/q-sys/wp_qsys_haaseffect.pdf"
					>QSC — Haas effect / delay fills (practice range, not a constant)</a
				>
			</li>
			<li>
				<a href="https://www.prosoundweb.com/the-speed-of-sound-in-air-a-simple-formula/"
					>ProSoundWeb — van Veen, speed of sound in air</a
				>
			</li>
		</ul>
	</section>

	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Alignment aid for one seat. Verify with measurement. Wrong delay causes echo, comb filtering, or
			image pull. Humidity is ignored. Paths are straight-line acoustic centers. CougarCalc is a Phase
			2 prototype, not a show-critical measurement system.
		</p>
	</section>
</ToolPageLayout>
	)
}
