import ToolPageLayout from '../../../components/ToolPage.tsx';
import BridgePlacementCalc from '../../../components/BridgePlacementCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeBridgePlacement, formatBridgeCopy } from '../../../calcs/bridge-placement.ts';
import { formatInches } from '../../../calcs/format.ts';

export default function Page() {
const example = computeBridgePlacement({ scale: 25.5, compensation: 0.125, unit: 'in' });
if (!example.ok) throw new Error('bridge-placement example failed');
const related = relatedGuitarPage('bridge-placement');
const warning =
	'Break ≈ S is a first layout. Speaking length is along the string path, not the centerline. Exact compensation millimetres are not a universal figure. Drilling or routing from this mark is irreversible.';
const lede = 'Break length ≈ S. Speaking length ≈ S + compensation along the string path, not the centerline.';
	return (
<ToolPageLayout
	title="Bridge placement"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="irreversible"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/bridge-placement/', label: 'Bridge placement' },
	]}
>
	<BridgePlacementCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			Break length is a first layout: nut to saddle contact ≈ S. Speaking length adds the compensation you typed,
			measured along the string path. It is not a centerline drill mark and not a published millimetre that this
			tool invented.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">break ≈ S</p>
		<p className="formula">speaking ≈ S + compensation &nbsp; (along the string path)</p>
		<p>Compensation is user-supplied. 0 is allowed. Exact compensation millimetres are unavailable as a universal figure and are not invented.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				S = 25.500 in, compensation = 0.125 in. Break ≈ <strong>{formatInches(example.breakLength)} in</strong>.
				Speaking ≈ <strong>{formatInches(example.speakingLength)} in</strong> along the string path.
			</p>
			<p className="mono">{formatBridgeCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>First layout only. Intonation still happens on the finished instrument.</li>
			<li>Path is the string, not the board centerline or a bass-side drill line.</li>
			<li>Compensation millimetres are not looked up from a hidden table.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Place the saddle contact from the nut along the string, then add your compensation if you have one.</li>
			<li>Tune-o-matic and tremolo posts are not the same as saddle contact. Measure the contact.</li>
			<li>Zero compensation is a valid first mark. It is not a claim that the guitar will intonate there.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Is break length exactly S?</h3>
		<p>It is the first layout. Break ≈ S at the saddle contact. Finished intonation will move the contact.</p>
		<h3>Why along the string path?</h3>
		<p>The speaking length is the string, not a line down the middle of the board. Centerline marks mis-place outer saddles.</p>
		<h3>What compensation should I type?</h3>
		<p>Whatever you measured or were given. This tool does not invent a millimetre. 0 is allowed.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID FG-04 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href="https://www.liutaiomottola.com/formulae/fret.htm">Mottola — scale and fret layout (speaking length from the nut; compensation is a separate intonation job)</a>
			</li>
			<li>
				<a href="https://www.stewmac.com/video-and-ideas/online-resources/learn-about-guitar-building-and-guitar-repair/scale-length-explained/">StewMac — Scale length explained (nut-to-saddle as scale; compensation not a universal mm)</a>
			</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			First layout only. Speaking length is along the string path. Compensation millimetres are not invented.
			CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
