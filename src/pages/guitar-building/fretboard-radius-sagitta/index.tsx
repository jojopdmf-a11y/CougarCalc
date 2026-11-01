import ToolPageLayout from '../../../components/ToolPage.tsx';
import FretboardRadiusCalc from '../../../components/FretboardRadiusCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	computeFretboardRadius,
	formatRadiusCopy,
	sagittaFromRadius,
	radiusFromSagitta,
	hartsteinRx,
} from '../../../calcs/fretboard-radius.ts';
import { formatInches } from '../../../calcs/format.ts';

export default function Page() {
const r = 7.25;
const l = 2.2;
const example = computeFretboardRadius({ mode: 'sagitta', radius: r, width: l, unit: 'in' });
if (!example.ok) throw new Error('fretboard-radius example failed');
const s = sagittaFromRadius(r, l);
const cone = hartsteinRx(10, 1.4, 2.1, 25.5, 12.75);
const related = relatedGuitarPage('fretboard-radius-sagitta');
const warning =
	'Geometry of a circular arc or a Hartstein/Mottola cone. Warmoth radius pairs were not re-fetched and are not invented here. Sanding a board to a radius is irreversible.';
const lede = 'Sagitta from radius, radius from sagitta, or conical Hartstein/Mottola Rx. Warmoth pairs are not invented.';
	return (
<ToolPageLayout
	title="Fretboard radius / sagitta"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="irreversible"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/fretboard-radius-sagitta/', label: 'Fretboard radius' },
	]}
>
	<FretboardRadiusCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			In sagitta mode the large number is s, the height of the circular arc over chord l. Inverse mode returns r.
			Conical mode returns Hartstein/Mottola Rx at Dx. Warmoth published nut/heel pairs are not listed because
			they were not re-fetched for this prototype.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">s = r − √(r² − (l/2)²)</p>
		<p className="formula">r = (s² + (l/2)²) / (2s)</p>
		<p className="formula">R<sub>x</sub> = R<sub>n</sub> × (1 + D<sub>x</sub> × (S<sub>f</sub> − S<sub>n</sub>) / (D<sub>f</sub> × S<sub>n</sub>))</p>
		<p>The cone is Hartstein as given via Mottola. Chord half-width must be less than r.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				r = 7.25 in, l = 2.20 in. s = <strong>{formatInches(example.sagitta ?? 0)} in</strong>
				(matches {formatInches(s)} in). Inverse recovers r =
				{formatInches(radiusFromSagitta(s, l))} in. Cone example: Rn = 10 in, Sn = 1.4 in, Sf = 2.1 in,
				Df = 25.5 in, Dx = 12.75 in → Rx = {formatInches(cone)} in.
			</p>
			<p className="mono">{formatRadiusCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Circular arc in the first two modes. Real boards have fret-leveling and sanding error.</li>
			<li>Conical mode is the Hartstein/Mottola expression, not a CNC program.</li>
			<li>Warmoth radius pairs were not re-fetched and are not invented as chips.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Chord width l is the span you actually measured, not a catalog nut width unless you measured that.</li>
			<li>Compound boards need the cone fields. A single r does not describe a cone.</li>
			<li>Do not paste an uncited Warmoth pair into the cone fields and call it a source from this page.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Does the inverse recover r?</h3>
		<p>Yes, from the same circle identities, within float64. Display rounding is three decimal inches or two decimal millimetres.</p>
		<h3>Where are Warmoth 10–16 in pairs?</h3>
		<p>Not re-fetched for this prototype, so not listed. They are not invented here.</p>
		<h3>What is Hartstein/Mottola?</h3>
		<p>A conical (compound) radius at distance Dx from the nut, using nut radius and two widths. That is the only cone in this tool.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID SS-RAD-01 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>Circle sagitta identities s = r − √(r² − (l/2)²) and r = (s² + (l/2)²)/(2s)</li>
			<li>
				<a href="https://www.liutaiomottola.com/formulae/compound.htm">Mottola — compound / conical radius (Hartstein Rx)</a>
			</li>
			<li>Warmoth published pairs: not re-fetched; not invented</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Arc geometry and Hartstein/Mottola Rx only. Warmoth pairs are not invented. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
