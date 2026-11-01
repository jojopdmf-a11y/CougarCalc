import ToolPageLayout from '../../../components/ToolPage.tsx';
import StringTensionCalc from '../../../components/StringTensionCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	DADDARIO_WAYBACK_SOURCE,
	DADDARIO_WAYBACK_URL,
	computeStringTension,
	formatTensionCopy,
	lookupDaddarioItem,
	tensionLbfFromUw,
} from '../../../calcs/string-tension.ts';
import { formatFixed, formatLbf } from '../../../calcs/format.ts';

export default function Page() {
const E4_CHART = 329.6;
const example = computeStringTension({
	scale: 25.5,
	scaleUnit: 'in',
	frequencyHz: E4_CHART,
	uwLbPerIn: null,
	tableId: 'PL010',
});
if (!example.ok) throw new Error('string-tension example failed');
const uw = lookupDaddarioItem('PL010')!;
const related = relatedGuitarPage('string-tension-calculator');
const warning =
	'This is a tension estimate from a cited unit weight. It is not a max-safe load for a neck, truss rod, or tuners.';
const lede = 'Tension from unit weight, scale, and frequency. Fail closed if UW or Item# is missing. No max-safe T.';
	return (
<ToolPageLayout
	title="String tension"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/string-tension-calculator/', label: 'String tension' },
	]}
>
	<StringTensionCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is estimated tension in pounds-force. Newtons are on the same card. Both come from a cited
			unit weight, the sounding length, and the pitch you typed. This is not a safe working load for a neck.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">T = (UW × (2 L F)²) / 386.4 &nbsp; (lbf, lb/in, in, Hz)</p>
		<p>That is the inch-pound chart form. 386.4 is the 2g conversion those tables use.</p>
		<p className="formula">T = 4 μ L² f² &nbsp; (N, kg/m, m, Hz)</p>
		<p>
			μ is converted from UW. The card shows both. Unit weight must come from a cited archived D’Addario Item# or a
			value you type. Missing or unknown Item# fails closed — mass is not guessed. GHS cells are not mixed in. The
			live daddario.com PDF is not used. String Tension Pro is not scraped.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Archived Item# PL010, UW = {uw.uwLbPerIn} lb/in, S = 25.500 in, e′ = {E4_CHART} Hz.
				T = (UW × (2LF)²)/386.4 = <strong>{formatLbf(example.tensionLbf)} lbf</strong>
				({formatFixed(example.tensionN, 2)} N). Check vs {formatLbf(tensionLbfFromUw(uw.uwLbPerIn, 25.5, E4_CHART))} lbf
				from the same expression (spot-check 16.2 lbf).
			</p>
			<p className="mono">{formatTensionCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Speaking length is the scale length you typed. No compensation, no afterlength.</li>
			<li>UW is treated as constant. Real strings are not a perfect flexible wire.</li>
			<li>Pitch is the frequency you typed. The E4 chip is 12-TET at A4 = 440 Hz.</li>
			<li>Necks, truss rods, tuners, and bridges are not rated here.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Use the archived Catalog Supplement Item# or type a cited UW. Do not guess from gauge.</li>
			<li>Gauges with the same number from two brands do not share a UW. GHS is not blended here.</li>
			<li>If you do not have UW, leave the card empty. This tool will not invent one.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why fail closed without unit weight?</h3>
		<p>Tension is proportional to mass per length. A guessed UW is a guessed T. The card stays empty or errors.</p>
		<h3>Why not the live D’Addario PDF?</h3>
		<p>The live storefront chart was unavailable to research. This page uses the Wayback 20200126233815 Catalog Supplement only.</p>
		<h3>What is 386.4?</h3>
		<p>The inch-pound conversion those published tension charts use (2g with g ≈ 386.4 in/s²). It is not a safety factor.</p>
		<h3>Is there a max-safe tension?</h3>
		<p>No. This prototype does not give a neck, rod, or tuner limit.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID SS-TEN-01 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href={DADDARIO_WAYBACK_URL}>{DADDARIO_WAYBACK_SOURCE}</a>
			</li>
			<li>SI string formula T = 4 μ L² f²</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Estimate from a cited unit weight only. Not a max-safe load. Wrong UW gives a wrong T. CougarCalc is a Phase 2
			prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
