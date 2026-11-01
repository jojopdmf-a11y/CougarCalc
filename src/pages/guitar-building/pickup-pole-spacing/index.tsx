import ToolPageLayout from '../../../components/ToolPage.tsx';
import PickupPolesCalc from '../../../components/PickupPolesCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	computePickupPoles,
	formatPickupCopy,
	DUNCAN_HUMBUCKER_IN,
	DUNCAN_TREMBUCKER_IN,
} from '../../../calcs/pickup-poles.ts';
import { formatInches, formatMm } from '../../../calcs/format.ts';

export default function Page() {
const example = computePickupPoles({ eToE: DUNCAN_TREMBUCKER_IN, unit: 'in', position: 'bridge' });
if (!example.ok) throw new Error('pickup-poles example failed');
const related = relatedGuitarPage('pickup-pole-spacing');
const warning =
	'Duncan published 1.930 in / 2.070 in. DiMarzio official figures were unavailable and are not invented. Measure E-to-E at the pickup.';
const lede = 'Compare measured E-to-E at the pickup to Duncan 1.930 in / 2.070 in. Bridge over 2 in suggests Trembucker.';
	return (
<ToolPageLayout
	title="Pickup pole spacing"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/pickup-pole-spacing/', label: 'Pickup pole spacing' },
	]}
>
	<PickupPolesCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is your E-to-E converted to inches. At the bridge, Duncan’s published split is 2 in:
			standard humbucker if E-to-E is ≤ 2 in, Trembucker if greater. Neck position is labeled as a measure, not a
			second Duncan split. DiMarzio figures are not invented.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p>
			Convert E-to-E to inches. Duncan standard humbucker = {formatInches(DUNCAN_HUMBUCKER_IN)} in
			({formatMm(DUNCAN_HUMBUCKER_IN * 25.4)} mm). Trembucker = {formatInches(DUNCAN_TREMBUCKER_IN)} in
			({formatMm(DUNCAN_TREMBUCKER_IN * 25.4)} mm). If position is bridge and E-to-E &gt; 2 in → Trembucker;
			otherwise at the bridge → humbucker.
		</p>
		<p>Deltas to both Duncan figures are displayed. They are differences, not a fit score.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Bridge E-to-E = {formatInches(DUNCAN_TREMBUCKER_IN)} in. That is greater than 2 in, so
				<strong>Trembucker</strong> per Duncan. Δ vs 1.930 in =
				{formatInches(example.deltaHumbuckerIn)} in.
			</p>
			<p className="mono">{formatPickupCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Duncan published figures only. DiMarzio official spacing was unavailable and is omitted.</li>
			<li>The 2 in split is Duncan’s bridge-pickup rule, not a measurement of your guitar until you type E-to-E.</li>
			<li>String spread at the pickup is not the same as nut E-to-E.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure E-to-E at the pickup location, strings on, in playing position if you can.</li>
			<li>Fanned or heavily radiused spreads still need a measurement. The 2 in rule is not a substitute.</li>
			<li>A neck humbucker usually covers typical neck spreads; Duncan still frames the split as a bridge question.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why 2 inches?</h3>
		<p>Seymour Duncan publishes that split between standard humbucker and Trembucker pole spacing for the bridge.</p>
		<h3>What about the neck?</h3>
		<p>Duncan treats the choice as a bridge-pickup question. This tool will not invent a second split for the neck.</p>
		<h3>Where are DiMarzio numbers?</h3>
		<p>Official DiMarzio pole-spacing figures were unavailable when this prototype was reviewed. They are not invented here.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID ES-PICK-SPACING — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href="https://www.seymourduncan.com/blog/the-tone-garage/humbucker-vs-trembucker-whats-the-difference">Seymour Duncan — Humbucker vs Trembucker (1.930 in / 2.070 in; bridge E-to-E &gt; 2 in)</a>
			</li>
			<li>DiMarzio official pole spacing: unavailable at last review; not invented</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Duncan figures only. Measure the guitar. DiMarzio numbers are not invented. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
