import ToolPageLayout from '../../../components/ToolPage.tsx';
import StringSetCalc from '../../../components/StringSetCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { DADDARIO_WAYBACK_SOURCE, DADDARIO_WAYBACK_URL } from '../../../calcs/string-tension.ts';
import { computeStringSet, formatStringSetCopy } from '../../../calcs/string-set.ts';
import { formatLbf } from '../../../calcs/format.ts';

export default function Page() {
const E4_CHART = 329.6;
const example = computeStringSet([
	{ name: 'E4', scale: 25.5, scaleUnit: 'in', frequencyHz: E4_CHART, uwLbPerIn: null, tableId: 'PL010' },
	{ name: 'G3', scale: 25.5, scaleUnit: 'in', frequencyHz: 196, uwLbPerIn: null, tableId: 'NW018' },
]);
if (!example.ok) throw new Error('string-set example failed');
const related = relatedGuitarPage('string-set-tension');
const warning =
	'Total is the sum of per-string tensions. This is never a green “safe for this neck” rating.';
const lede = 'Per-string T from the tension formula; total is the sum. Never a neck-safe badge.';
	return (
<ToolPageLayout
	title="String-set tension"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/string-set-tension/', label: 'String-set tension' },
	]}
>
	<StringSetCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is Σ Ti in pounds-force. Each string uses the same tension calc as the single-string tool
			(cited UW, scale, frequency). The total is only a sum. It is never presented as safe for this neck.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">T<sub>i</sub> = (UW<sub>i</sub> × (2 L F<sub>i</sub>)²) / 386.4</p>
		<p className="formula">total = Σ T<sub>i</sub></p>
		<p>
			Blank rows are ignored. A row with frequency but no UW fails closed. Missing or unknown Item# is not guessed.
			GHS cells are not blended with D’Addario. The live storefront PDF is not used. No green badge.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				Two strings on 25.500 in: archived PL010 at {E4_CHART} Hz and NW018 at 196 Hz. Total =
				<strong>{formatLbf(example.totalLbf)} lbf</strong>, equal to the sum of the two T<sub>i</sub>.
			</p>
			<p className="mono">{formatStringSetCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Shared scale for every string in the set. Multi-scale sets need separate runs.</li>
			<li>Same UW rules as the single-string tool. Fail closed if a filled row lacks UW.</li>
			<li>The sum is not a structural rating.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Add or remove rows to match the set. Empty extra rows are skipped.</li>
			<li>Compare totals only when UW sources match. Mixing guessed gauges is still a guessed total.</li>
			<li>If you need a neck limit, this is the wrong tool. None is given.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Is the total safe for this neck?</h3>
		<p>This tool never says so. There is no green “safe for this neck” state.</p>
		<h3>Is this a different formula from string tension?</h3>
		<p>No. Each T<sub>i</sub> uses the same inch-pound / SI pair. The set page only sums them.</p>
		<h3>What if one string is missing UW?</h3>
		<p>That row fails closed. The total is not computed from a guessed mass.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID SS-SET-01 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href={DADDARIO_WAYBACK_URL}>{DADDARIO_WAYBACK_SOURCE}</a>
			</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Sum of cited per-string tensions only. Never a neck-safe rating. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
