import ToolPageLayout from '../../../components/ToolPage.tsx';
import ActionWorksheetCalc from '../../../components/ActionWorksheetCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	FENDER_ELECTRIC_17TH,
	FENDER_SUPPORT_GUIDE_LABEL,
	FENDER_SUPPORT_GUIDE_URL,
	computeActionWorksheet,
	formatActionCopy,
} from '../../../calcs/action-worksheet.ts';
import { formatInches } from '../../../calcs/format.ts';

export default function Page() {
const guide725 = FENDER_ELECTRIC_17TH[0];
const example = computeActionWorksheet({
	fretNumber: 17,
	bass: guide725.bassIn,
	treble: guide725.trebleIn,
	unit: 'in',
});
if (!example.ok) throw new Error('action-worksheet example failed');
const related = relatedGuitarPage('action-worksheet');
const warning =
	'Named-fret heights are a worksheet. Fender 17th-fret electric numbers are a guide, not hard rules. No saddle-height formula is given.';
const lede =
	'Bass and treble string height at a named fret. Electric 17th figures are by radius from the Fender support guide — not hard rules.';
	return (
<ToolPageLayout
	title="Action worksheet"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/action-worksheet/', label: 'Action worksheet' },
	]}
>
	<ActionWorksheetCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The card records bass and treble height at the fret you named. If those heights match a Fender support-guide
			row, the matching radius band is labeled as a guide, not a factory guarantee. Saddle height is not solved.
			6/64 · 4/64 is not an electric 17th pair.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p>
			There is no closed-form action equation here. You type a required named fret and two heights. The worksheet
			converts units and, when the pair matches a cited row, names that guide.
		</p>
		<ul>
			<li>Electric 17th, 7.25″: bass 5/64, treble 4/64 (relief .012″ is companion chart text).</li>
			<li>Electric 17th, 9.5–12″: 4/64 · 4/64.</li>
			<li>Electric 17th, 15–17″: 4/64 · 3/64.</li>
			<li>Acoustic 6/64 · 5/64 is the <strong>14th</strong>-fret chart — not the electric 17th.</li>
		</ul>
		<p>Saddle height, relief, and neck angle are not inverted from these two numbers.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Fret 17, 7.25″ electric guide: bass 5/64 in, treble 4/64 in.
				Bass = <strong>{formatInches(example.bassIn)} in</strong>, treble =
				<strong>{formatInches(example.trebleIn)} in</strong>. Guide, not hard rules.
			</p>
			<p className="mono">{formatActionCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>A named fret is required. Electric guide numbers are at the 17th; acoustic 6/64 · 5/64 is the 14th.</li>
			<li>Guide, not hard rules. Not a pass/fail spec.</li>
			<li>No saddle-height formula. Relief is companion text on the 7.25″ row only.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure at the fret named on the chart you are using, with the same feeler or ruler method.</li>
			<li>If your chart uses the 12th fret, change the named fret. Do not treat 17th numbers as 12th numbers.</li>
			<li>Set relief first in the shop. This worksheet does not order the setup steps.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why is the fret required?</h3>
		<p>Action numbers without a location are not comparable. The electric guide is at the 17th; the acoustic pair is at the 14th.</p>
		<h3>Where did 6/64 · 4/64 go?</h3>
		<p>That pair is not on the cited Fender electric 17th chart. Acoustic 6/64 · 5/64 is a different row at the 14th.</p>
		<h3>Why is there no saddle-height output?</h3>
		<p>Saddle height depends on break angle, relief, and neck angle. Those are not a closed form from two action readings.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID SS-ACT-01 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href={FENDER_SUPPORT_GUIDE_URL}>{FENDER_SUPPORT_GUIDE_LABEL}</a>
			</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Worksheet only. Guide, not hard rules. No saddle-height formula. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
