import ToolPageLayout from '../../../components/ToolPage.tsx';
import ScaleCompareCalc from '../../../components/ScaleCompareCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeScaleCompare, formatScaleCompareCopy } from '../../../calcs/scale-compare.ts';
import { formatInches, formatMm } from '../../../calcs/format.ts';

export default function Page() {
const example = computeScaleCompare({ nutToTwelfth: 12.75, unit: 'in', compareId: 'metric-650' });
if (!example.ok) throw new Error('scale-compare example failed');
const related = relatedGuitarPage('scale-length-compare');
const warning =
	'S_actual = 2 × nut-to-12th. 25.500 in × 25.4 = 647.7 mm, not 650 mm. Cited published lengths only.';
const lede = 'Double the nut-to-12th distance. Compare only to cited published lengths. 25.500 in is not 650 mm.';
	return (
<ToolPageLayout
	title="Scale length compare"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/scale-length-compare/', label: 'Scale length compare' },
	]}
>
	<ScaleCompareCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			S_actual is twice the nut-to-twelfth distance you measured. Compare chips are only the published rows in
			this prototype. 25.500 in converted at 25.4 mm/in is 647.7 mm, which is not 650 mm.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">S_actual = 2 × (nut to 12th)</p>
		<p>
			In 12-TET, d(12) = S/2, so doubling the nut-to-12th recovers scale. Conversion uses 1 in = 25.4 mm.
			25.500 × 25.4 = {formatMm(example.inchTimes254)} mm ≠ 650 mm.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Nut-to-12th = 12.750 in. S_actual = <strong>{formatInches(example.sActual)} in</strong>
				({formatMm(example.sActualMm)} mm). Versus 650 mm, Δ is not zero.
				25.500 × 25.4 = <strong>{formatMm(example.inchTimes254)} mm</strong>, not 650.
			</p>
			<p className="mono">{formatScaleCompareCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>12-TET identity d(12) = S/2. Compensated saddles and worn nuts shift a tape measure.</li>
			<li>Compare chips are only PUBLISHED_SCALES. No invented “vintage” lengths.</li>
			<li>equals650 is always false for the 25.500 in conversion check.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure nut face to 12th-fret center, then double. Do not mix a 650 mm tape with a 25.500 in drawing.</li>
			<li>Confirm the cited published length on the instrument. Catalog names are not a caliper.</li>
			<li>The fret-position tool uses the same 12-TET identity for d(12).</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why double nut-to-12th?</h3>
		<p>Because d(12) = S/2 in 12-TET. That is layout geometry, not intonation.</p>
		<h3>Is 25.5 in the same as 650 mm?</h3>
		<p>No. 25.500 × 25.4 = 647.7 mm.</p>
		<h3>Can I type a scale that is not on a chip?</h3>
		<p>You type a measurement. Chips only select a published comparison row. Unknown ids error.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID FG-05 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href="https://www.liutaiomottola.com/formulae/fret.htm">Mottola — fret formulae (d(12) = S/2)</a>
			</li>
			<li>
				<a href="https://www.stewmac.com/video-and-ideas/online-resources/learn-about-guitar-building-and-guitar-repair/scale-length-explained/">StewMac — 25.5 in as a Fender-style scale (not a maker spec from this site)</a>
			</li>
			<li>1 in = 25.4 mm. 25.500 × 25.4 = 647.7 mm ≠ 650 mm</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			S_actual = 2 × nut-to-12th. 25.500 in is not 650 mm. Cited published lengths only. CougarCalc is a Phase 2
			prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
