import ToolPageLayout from '../../../components/ToolPage.tsx';
import NeckTaperCalc from '../../../components/NeckTaperCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeNeckTaper, formatNeckTaperCopy, interpolateWidth } from '../../../calcs/neck-taper.ts';
import { formatInches } from '../../../calcs/format.ts';

export default function Page() {
const example = computeNeckTaper({ x1: 0, w1: 1.65, x2: 12.75, w2: 2.062, x: 6.375, unit: 'in' });
if (!example.ok) throw new Error('neck-taper example failed');
const mid = interpolateWidth(0, 1.65, 12.75, 2.062, 6.375);
const related = relatedGuitarPage('neck-taper-width');
const warning =
	'Linear interpolation between two measured stations. Fender 1st/12th published table values are neck depth (thickness), not width.';
const lede = 'Width at x from two measured stations. Linear only. Fender 1st/12th tables are depth, not width.';
	return (
<ToolPageLayout
	title="Neck taper / width"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/neck-taper-width/', label: 'Neck taper' },
	]}
>
	<NeckTaperCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is width at the query location, linearly interpolated between two stations you measured.
			t is the fractional position between those stations. Fender published 1st-fret / 12th-fret tables that
			builders often quote are neck depth (thickness), not this width.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">w(x) = w1 + (w2 − w1) × (x − x1) / (x2 − x1)</p>
		<p>t = (x − x1) / (x2 − x1). Stations cannot share a location. Widths must be greater than zero. Extrapolation (t outside 0–1) is still linear and is not clamped.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Measured 1.650 in at x = 0 and 2.062 in at x = 12.750 in. At x = 6.375 in (midway),
				w = <strong>{formatInches(example.width)} in</strong>
				(matches {formatInches(mid)} in). These two stations are a worked measurement pair, not a Fender width spec.
			</p>
			<p className="mono">{formatNeckTaperCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Straight taper between two points. Real necks can have non-linear outlines.</li>
			<li>Fender 1st/12th spec tables that list ~0.85 in / ~0.95 in class numbers are depth, not width.</li>
			<li>Nut width on a drawing is a width, but it is still only valid if you measured that station.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Use the same axis for x (from nut, from butt) on both stations and the query.</li>
			<li>Do not paste Fender thickness numbers into w1/w2 and call the result a width.</li>
			<li>Template work still needs a physical check. This is interpolation, not CAM.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Can I use Fender’s 1st and 12th numbers?</h3>
		<p>Not as widths. Those published table values are neck depth (thickness). This tool interpolates width.</p>
		<h3>What if x is past station 2?</h3>
		<p>t will be greater than 1. The line continues. It is not clamped to the segment.</p>
		<h3>Is the outline assumed straight?</h3>
		<p>Yes. Only two stations are used. A third station is a different measurement, not this formula.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID SS-TAP-01 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>Linear interpolation between two measured stations</li>
			<li>
				<a href="https://www.fender.com/en-US/electric-guitars/stratocaster/">Fender instrument spec tables — 1st/12th figures on those charts are neck depth (thickness), not width</a>
			</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Linear interpolation of measured widths only. Fender 1st/12th table values are depth, not width. CougarCalc
			is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
