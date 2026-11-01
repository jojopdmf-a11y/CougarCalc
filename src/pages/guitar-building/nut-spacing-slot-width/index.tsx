import ToolPageLayout from '../../../components/ToolPage.tsx';
import NutSpacingCalc from '../../../components/NutSpacingCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeNutSpacing, formatNutSpacingCopy } from '../../../calcs/nut-spacing.ts';
import { formatInches } from '../../../calcs/format.ts';

export default function Page() {
const gauges = [0.01, 0.013, 0.017, 0.026, 0.036, 0.046];
const example = computeNutSpacing({ eToE: 1.406, unit: 'in', gauges, gaugeUnit: 'in' });
if (!example.ok) throw new Error('nut-spacing example failed');
const related = relatedGuitarPage('nut-spacing-slot-width');
const warning =
	'Equal remaining gap between string edges. Slot clearance is not a universal spec and is not invented here. Filing a nut is irreversible; this page is not a procedure.';
const lede = 'Centers from half-gauges plus equal remaining gap between string edges. E-to-E is outer centers.';
	return (
<ToolPageLayout
	title="Nut spacing / slot width"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="irreversible"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/nut-spacing-slot-width/', label: 'Nut spacing' },
	]}
>
	<NutSpacingCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is the equal remaining gap between adjacent string edges. Centers are measured from the
			first outer string. Slot width beyond the gauge is not specified — there is no universal clearance here.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p>
			Occupied width = half the first gauge + half the last gauge + the inner gauges. Remaining gap =
			(E-to-E − occupied) / (n − 1). Each next center is previous center + half this gauge + gap + half the next
			gauge.
		</p>
		<p>E-to-E is center-to-center of the outer strings. Gauges may be listed comma-separated or one per row.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				1.406 in E-to-E, gauges 0.010–0.046 in. Equal edge gap
				<strong>{formatInches(example.gap)} in</strong>. Last center =
				<strong>{formatInches(example.centers[5])} in</strong> (the E-to-E).
			</p>
			<p className="mono">{formatNutSpacingCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Equal remaining gap between edges, not equal center-to-center pitch.</li>
			<li>Gauges are used as typed. 10 is not converted to 0.010.</li>
			<li>Slot clearance, flare, and file size are not invented.</li>
			<li>This is layout geometry, not a nut-filing procedure.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure E-to-E on the nut or the intended string path, not the blank width.</li>
			<li>If gauges do not fit, the card errors rather than emitting a negative gap.</li>
			<li>File the slot to the string after you have centers. Do not treat the gap as a slot width.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why equal edge gap instead of equal centers?</h3>
		<p>
			Mixed gauges with equal centers crowd the bass side. This tool uses equal remaining gap between edges, a
			common layout choice. It is not the only method.
		</p>
		<h3>What slot clearance should I add?</h3>
		<p>None is specified here. There is no universal nut-slot clearance in this prototype.</p>
		<h3>Is E-to-E the nut width?</h3>
		<p>No. It is the center-to-center distance of the two outer strings.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID LX-NUT-SP — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href="https://www.stewmac.com/video-and-ideas/online-resources/learn-about-guitar-and-instrument-setup-and-repair/nut-slotting-101/">StewMac — Nut slotting 101 (slot to the string; no universal clearance copied here)</a>
			</li>
			<li>
				<a href="https://www.liutaiomottola.com/formulae/fret.htm">Mottola — layout formulae (geometry, not a filing recipe)</a>
			</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Equal-edge-gap layout only. Slot clearance is not specified. Filing a nut is irreversible shop work; this
			page is not a procedure. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
