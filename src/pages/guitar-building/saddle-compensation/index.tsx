import ToolPageLayout from '../../../components/ToolPage.tsx';
import SaddleCompensationCalc from '../../../components/SaddleCompensationCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computeSaddleCompensation, formatSaddleCopy, mottolaN, mottolaDisplacement } from '../../../calcs/saddle-compensation.ts';
import { formatFixed, formatInches } from '../../../calcs/format.ts';

export default function Page() {
const example = computeSaddleCompensation({ scale: 25.5, centsError: 5, unit: 'in' });
if (!example.ok) throw new Error('saddle-compensation example failed');
const related = relatedGuitarPage('saddle-compensation');
const warning =
	'Mottola compensation from 12th-fret cents error. Elmendorp is not used. Verify on the instrument before you lock a saddle.';
const lede = 'Mottola n = 12 + e/100 and displacement d from 12th-fret cents error. Negative e if the note is flat.';
	return (
<ToolPageLayout
	title="Saddle compensation"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/saddle-compensation/', label: 'Saddle compensation' },
	]}
>
	<SaddleCompensationCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			d is Mottola’s saddle displacement for the cents error you typed at the 12th fret. Positive d (sharp
			fretted note) moves the saddle away from the nut. Negative e (flat) moves it toward the nut. Elmendorp’s
			method is not used.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">n = 12 + (e / 100)</p>
		<p className="formula">d = ((S − (S / 2<sup>n/12</sup>)) − (S / 2)) × 2</p>
		<p>e is cents error at the 12th fret, negative if flat. Mottola only. Elmendorp is not used in this prototype.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				S = 25.500 in, e = +5 cents. n = {formatFixed(mottolaN(5), 4)}.
				d = <strong>{formatInches(example.displacement)} in</strong>
				(matches {formatInches(mottolaDisplacement(25.5, 5))} in). Direction: away from the nut.
			</p>
			<p className="mono">{formatSaddleCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>One error reading at the 12th fret, converted with Mottola’s n and d.</li>
			<li>Elmendorp and other compensation theories are not applied.</li>
			<li>This is not a finished intonation. Strings, action, and relief still move pitch.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure cents at the 12th with a tuner you trust, then apply d at that saddle.</li>
			<li>A flat 12th (negative e) shortens speaking length — saddle toward the nut.</li>
			<li>Do not mix this d with a hidden millimetre from another method.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why is e negative if the note is flat?</h3>
		<p>Mottola’s n = 12 + e/100. A flat fretted note is a negative cents error and yields n &lt; 12.</p>
		<h3>Why not Elmendorp?</h3>
		<p>Elmendorp is not used in this prototype. The card runs Mottola’s n and d only.</p>
		<h3>Does this replace intonation on the guitar?</h3>
		<p>No. It is a displacement from one cents reading. Verify on the instrument.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID FG-03 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href="https://www.liutaiomottola.com/formulae/intcomp.htm">Mottola — intonation compensation (n = 12 + e/100 and displacement d)</a>
			</li>
			<li>Elmendorp: not used</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Mottola n and d only. Elmendorp not used. Not a finished setup. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
