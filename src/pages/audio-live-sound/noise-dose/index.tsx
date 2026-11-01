import ToolPageLayout from '../../../components/ToolPage.tsx';
import NoiseDoseCalc from '../../../components/NoiseDoseCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeNoiseDose, formatNoiseDoseCopy, NIOSH_LC, NIOSH_Q, OSHA_LC, OSHA_Q } from '../../../calcs/noise-dose.ts';
import { formatFixed } from '../../../calcs/format.ts';

export default function Page() {
const example = computeNoiseDose({ bands: [{ levelDba: 85, hours: 8 }] });
if (!example.ok) throw new Error('noise-dose example failed');
const related = relatedAudioPage('noise-dose');
const warning =
	'Educational only. Not a dosimeter, not personal sampling, not OSHA or NIOSH compliance. dBA only. The NIOSH 98-126 PDF was unavailable to this prototype.';
const lede =
	'Educational NIOSH and OSHA dose from dBA and time. Not a dosimeter. Not compliance. NIOSH 98-126 was not available to this prototype.';
	return (
<ToolPageLayout
	title="Noise dose (educational)"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/noise-dose/', label: 'Noise dose' },
	]}
>
	<NoiseDoseCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is educational NIOSH dose percent from the dBA bands you typed. OSHA 1910.95 (90 dBA / 5 dB)
			is shown beside it. This is not a dosimeter, not personal sampling, and not an exposure record.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">T = 8 / 2<sup>(L − Lc) / q</sup> &nbsp;hours</p>
		<p className="formula">D% = 100 × Σ (C<sub>i</sub> / T<sub>i</sub>)</p>
		<p>NIOSH REL: Lc = {NIOSH_LC} dBA, q = {NIOSH_Q} dB. OSHA PEL (29 CFR 1910.95): Lc = {OSHA_LC} dBA, q = {OSHA_Q} dB.</p>
		<p>
			NIOSH TWA from dose uses 10 log<sub>10</sub>(D/100) + 85. OSHA TWA uses (q / log<sub>10</sub> 2) log<sub>10</sub>(D/100)
			+ 90. dBA only — no dBC, no unweighted peak.
		</p>
		<p>
			<strong>Label:</strong> the NIOSH 98-126 Criteria for a Recommended Standard PDF was unavailable to this
			prototype. Formulas follow the publicly cited 85 dBA / 3 dB REL and OSHA’s 1910.95 text.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				85 dBA for 8 hours. NIOSH T = 8 h, so dose =
				<strong>{formatFixed(example.niosh.dosePct, 1)}%</strong>.
				88 dBA for 8 hours is 200% NIOSH (3 dB exchange). 90 dBA for 8 hours is 100% OSHA.
			</p>
			<p className="mono">{formatNoiseDoseCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Educational arithmetic from typed dBA and hours. Not a Type 2 dosimeter. Not compliance.</li>
			<li>dBA only. No C-weighting, no LCpeak, no impulse.</li>
			<li>NIOSH 98-126 PDF was unavailable to this prototype — labeled on the card and here.</li>
			<li>No threshold / criterion switching, no shift-length other than the 8-hour T in the formula.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>A show level you guessed in dBA is not an exposure assessment. Hire measurement if you need a record.</li>
			<li>OSHA’s 5 dB exchange is more lenient than NIOSH’s 3 dB. Both are shown so you can see they disagree.</li>
			<li>In-ear monitors, wedges, and FOH are different ears. This page does not know which ear you meant.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Is this a dosimeter?</h3>
		<p>No. A dosimeter logs A-weighted sound at a microphone on a person. This is a spreadsheet of numbers you type.</p>
		<h3>Can I use this for OSHA compliance?</h3>
		<p>
			No. 29 CFR 1910.95 has monitoring, hearing conservation, and instrumentation rules. A website form is not
			that program.
		</p>
		<h3>Why is NIOSH 98-126 called out as unavailable?</h3>
		<p>
			The prototype could not open that PDF while these pages were written. The 85/3 REL is the publicly cited
			criterion; the missing PDF is labeled rather than quoted from memory.
		</p>
		<h3>Why dBA only?</h3>
		<p>Both criteria are A-weighted. Entering dBC or “peak SPL” here would be a unit error.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>
				<a href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.95"
					>OSHA 29 CFR 1910.95 — Occupational noise exposure (90 dBA, 5 dB exchange)</a
				>
			</li>
			<li>
				NIOSH Recommended Exposure Limit 85 dBA / 3 dB exchange (public REL). NIOSH 98-126 PDF was unavailable to
				this prototype.
			</li>
			<li>Dose D% = 100 × Σ (C_i / T_i) with T = 8 / 2^((L−Lc)/q).</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Educational only. Not a dosimeter, not personal sampling, not OSHA or NIOSH compliance, not medical advice.
			dBA only. NIOSH 98-126 PDF was unavailable to this prototype. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
