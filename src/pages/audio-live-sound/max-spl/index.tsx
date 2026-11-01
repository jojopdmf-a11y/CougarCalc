import ToolPageLayout from '../../../components/ToolPage.tsx';
import MaxSplCalc from '../../../components/MaxSplCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL, MAX_SPL_LEDE, MAX_SPL_SAFETY, MAX_SPL_TITLE } from '../../../site.ts';
import {
	computeMaxSpl,
	crownPointDbw,
	formatMaxSplCopy,
	nTermDb,
	splAt1mFromSensAndPower,
	wattsFromDbw,
} from '../../../calcs/max-spl.ts';
import { formatDb, formatFixed } from '../../../calcs/format.ts';

export default function Page() {
const crownDbw = crownPointDbw(85, 95, 100, 3);
const crownWatts = wattsFromDbw(crownDbw);
const crown = computeMaxSpl({
	sensitivityDb: 95,
	sensitivityRef: '1w1m',
	impedanceOhm: 8,
	powerW: 1,
	distance: 100,
	distanceUnit: 'm',
	radiation: 'point',
	count: 1,
	summing: 'incoherent',
	mode: 'watts-for-target',
	targetSpl: 85,
	headroomDb: 3,
	indoorNote: false,
});
if (!crown.ok) throw new Error('Crown watts example failed');

const spl1m = splAt1mFromSensAndPower(98, 800);
const near = computeMaxSpl({
	sensitivityDb: 98,
	sensitivityRef: '1w1m',
	impedanceOhm: 8,
	powerW: 800,
	distance: 1,
	distanceUnit: 'm',
	radiation: 'point',
	count: 1,
	summing: 'incoherent',
	mode: 'max-spl',
	indoorNote: false,
});
if (!near.ok) throw new Error('98 dB / 800 W / 1 m example failed');
const far = computeMaxSpl({
	sensitivityDb: 98,
	sensitivityRef: '1w1m',
	impedanceOhm: 8,
	powerW: 800,
	distance: 10,
	distanceUnit: 'm',
	radiation: 'point',
	count: 1,
	summing: 'incoherent',
	mode: 'max-spl',
	indoorNote: false,
});
if (!far.ok) throw new Error('98 dB / 800 W / 10 m example failed');

const related = relatedAudioPage('max-spl');
	return (
<ToolPageLayout
	title={MAX_SPL_TITLE}
	description={MAX_SPL_LEDE}
	kicker="Audio / live sound"
	lede={MAX_SPL_LEDE}
	warning={MAX_SPL_SAFETY}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/max-spl/', label: 'Max SPL' },
	]}
>
	<MaxSplCalc />

	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is either estimated <strong>continuous</strong> SPL at the throw you typed, or the
			continuous amplifier watts Crown’s inverse needs for a target plus the headroom you typed. Peak is a
			separate, labeled convention in the AES drawer. This is free-field and on-axis. It is not a room, not a
			hearing dose, and not a MAPP or ArrayCalc prediction.
		</p>
	</section>

	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">SPL<sub>1m</sub> = Sens<sub>1W/1m</sub> + 10 log<sub>10</sub>(P / 1)</p>
		<p>
			N is not inside SPL<sub>1m</sub>. Listener SPL = SPL<sub>1m</sub> + distance term + N term. No invented
			room gain as a default.
		</p>
		<p>
			If sensitivity is 2.83 V / 1 m: Sens<sub>1W/1m</sub> = Sens<sub>2.83V</sub> − 10 log10((2.83²) / Z).
			2.83²/8 = 1 W; 2.83²/4 = 2 W.
		</p>
		<p>Point source distance: −20 log10(d_m / 1). Ideal line source: −10 log10(d_m / 1).</p>
		<p>
			N boxes incoherent (power sum): +10 log10(N). Fully coherent: +20 log10(N) — rare; equal level, in-phase,
			same distance.
		</p>
		<p>Crown watts-for-target, Dref = 1 m when sensitivity is 1 W / 1 m (opened Crown calculators):</p>
		<p className="formula">dBW = Lreq − Lsens + 20 log<sub>10</sub>(D2 / Dref) + HR</p>
		<p className="formula">W = 10<sup>(dBW / 10)</sup></p>
		<p>
			Ideal line uses 10 log10(D2 / Dref) so the inverse matches the distance law. Headroom is whatever you
			enter. Suggested chips are 6 / 10 / 15 / 20 dB from the Crown live-sound article. The widget’s 3 dB
			example is not a default.
		</p>
		<p>
			AES drawer: Vrms = √(P · Z). 6 dB crest convention: Vpeak = 2 Vrms ⇒ Ppeak_convention = 4P. Program = 2 ×
			continuous is a labeled rule of thumb. AES2-2012 12 dB CF does not auto-emit 4× as “AES peak.”
		</p>
		<p>
			Limiter drawer: Urms = √(P · Z) at nominal Z. CF_dB = 20 log10(Upeak / Urms). dBu = 20 log10(U / 0.775).
			Threshold_dBu = Upeak_dBu − G_amp. Threshold_dBFS = Threshold_dBu − FS_dBu.
		</p>
	</section>

	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Crown calculators page: 100 m, 85 dB target, 95 dB 1 W / 1 m, 3 dB headroom (typed, not a default).
				dBW = 85 − 95 + 20 log10(100) + 3 = <strong>{formatFixed(crownDbw, 1)}</strong>. W =
				10<sup>(dBW/10)</sup> ≈ <strong>{formatFixed(crownWatts, 1)} W</strong>.
			</p>
			<p className="mono">{formatMaxSplCopy(crown)}</p>
			<p>
				98 dB at 1 W / 1 m, 800 W, N = 1, 1 m, point, incoherent. SPL<sub>1m</sub> = 98 + 10 log10(800) ≈
				<strong>{formatDb(spl1m)} dB</strong> ({formatFixed(near.splAt1m, 12)} before display rounding). Same at
				10 m: subtract 20 dB → ≈ <strong>{formatDb(far.listenerSpl)} dB</strong>.
			</p>
			<p>
				N = 4 incoherent adds {formatFixed(nTermDb(4, 'incoherent'), 2)} dB. N = 4 coherent adds{' '}
				{formatFixed(nTermDb(4, 'coherent'), 2)} dB and shows the coherent warning.
			</p>
		</div>
	</section>

	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Free-field, on-axis, no power compression, no array prediction, no hearing dose.</li>
			<li>Sensitivity is the datasheet number you typed. Check 1 W / 1 m vs 2.83 V / 1 m.</li>
			<li>Coherent +20 log10(N) is rare. Default is incoherent +10 log10(N).</li>
			<li>Indoor +6 dB appears only if you check the Crown-article note. It is not in the large number.</li>
			<li>AES / program / peak figures are conventions. This page does not certify a driver or run a 2-hour lab.</li>
			<li>Limiter numbers are a starting estimate. Manufacturer presets win.</li>
		</ul>
	</section>

	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Use the large number as continuous. Open the AES drawer if you need a labeled peak convention.</li>
			<li>If the datasheet says 2.83 V / 1 m on a 4 Ω box, convert before 10 log10(P).</li>
			<li>Headroom for watts-for-target is a show decision. Type it. Empty is an error.</li>
			<li>Verify with a meter. This is not a prediction of a room or an array.</li>
		</ul>
	</section>

	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why isn’t 2.83 V always 1 W?</h3>
		<p>Because P = V²/Z. 2.83²/8 = 1 W; 2.83²/4 = 2 W. Convert 2.83 V sensitivity before SPL<sub>1m</sub>.</p>
		<h3>Should I multiply AES power by 4 for peak SPL?</h3>
		<p>
			Not as “AES peak.” 4× power is the 6 dB crest convention (Vpeak = 2 Vrms). AES2-2012 is a 12 dB crest
			factor. This page will not silently apply 4× on the 2012 path.
		</p>
		<h3>When is coherent +20 log10(N) real?</h3>
		<p>Only when sources are equal level, in-phase, and the same distance at that seat. Default is incoherent.</p>
		<h3>Does this include the room?</h3>
		<p>
			No. Direct field only. The Crown article mentions that a room may add about 3 to 6 dB. The +6 dB checkbox
			is that labeled note. It is off by default and does not change the large number.
		</p>
		<h3>Is this a hearing-dose or array prediction?</h3>
		<p>No. Not a dose calculator. Not MAPP. Not ArrayCalc.</p>
		<h3>Can I use the limiter drawer instead of the amp’s speaker preset?</h3>
		<p>No. Manufacturer limiter presets win. The drawer is a starting estimate from the ratings you typed.</p>
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
				<a href="https://www.crownaudio.com/en/tools/calculators">Crown Audio calculators</a>
				{' '}(power / SPL; example 100 m, 85 dB, 95 dB 1 W/1 m, 3 dB HR ≈ 1995 W)
			</li>
			<li>
				<a href="https://www.crownaudio.com/en/how-much-amplifier-power">Crown — How much amplifier power do you need?</a>
				{' '}(live-sound headroom discussion: about 6 dB speech, 10–15 dB compressed playback, 20 dB uncompressed; indoor add mentioned as about 3 to 6 dB — labeled note only here)
			</li>
			<li>
				<a href="https://www.extron.com/calculators/inverse-square-law/?tab=tools">Extron inverse-square calculator</a>
				{' '}(LN = LR − 20 log(DN/DR))
			</li>
			<li>
				<a href="https://sengpielaudio.com/calculator-distance.htm">Sengpiel — level and distance</a>
			</li>
			<li>
				<a href="https://eaw.com/support/aes-power-handling/">EAW — AES power handling</a>
				{' '}(Znom vs marketing watts; already cited on this page in the previous prototype)
			</li>
			<li>AES2-2012 — crest factor for loudspeaker power ratings (12 dB CF; not 4× peak watts as “AES peak”)</li>
			<li>
				B&amp;C / QSC / Crown program = 2 × continuous is cited as a rule of thumb in the research brief, not as a
				lab procedure
			</li>
			<li>
				LEA-class limiter disclaimer (manufacturer presets win; starting estimate only). The research dossier
				URL is not in this checkout — no extra link is invented here.
			</li>
			<li>
				BoomSpeaker and LumenCalculator inverse-square pages were listed in the product-recommendation research as
				corroborating the distance laws. Their URLs are not in this checkout and are not invented here.
			</li>
		</ul>
	</section>

	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Free-field estimate only. Not a room prediction, not a hearing-dose calculator, not MAPP, not ArrayCalc,
			not a manufacturer max-SPL sticker, not a 2-hour AES lab, not a limiter preset. Wrong sensitivity reference
			(2.83 V vs 1 W) offsets the answer on 4 Ω boxes. Trusting the limiter drawer over the manufacturer can
			damage speakers. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
