import ToolPageLayout from '../../../components/ToolPage.tsx';
import NutHeightCalc from '../../../components/NutHeightCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { GUITAR_CATEGORY, relatedGuitarPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	MUSICNOMAD_GUIDE_URL,
	MUSICNOMAD_OPEN_1ST,
	STEWMAC_TS331_PRESS_3RD,
	computeNutHeight,
	formatNutHeightCopy,
} from '../../../calcs/nut-height.ts';
import { formatInches } from '../../../calcs/format.ts';

export default function Page() {
const example = computeNutHeight({ method: 'open-1st', firstFretAction: 0.018, unit: 'in' });
if (!example.ok) throw new Error('nut-height example failed');
const related = relatedGuitarPage('nut-height-first-fret');
const warning =
	'Measurement aid only — not a filing procedure. Choose open@1st or press@3rd. One swipe can ruin a slot. Filing a nut is irreversible. Fender nut-gap numbers are unavailable.';
const lede =
	'Measured nut-slot height against a labeled shop source. Method is required. Not a Fender factory spec.';
	return (
<ToolPageLayout
	title="Nut height / first-fret action"
	description={lede}
	kicker="Guitar building"
	lede={lede}
	warning={warning}
	warningKind="irreversible"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: GUITAR_CATEGORY.href, label: GUITAR_CATEGORY.title },
		{ href: '/guitar-building/nut-height-first-fret/', label: 'Nut height' },
	]}
>
	<NutHeightCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is the height you typed. The card names the method you chose and the shop source for that
			method. It does not apply a 0.012–0.024 in window and it does not invent a Fender nut gap. Optional fret
			crown is a comparison sum only. This is not a filing procedure.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p>Record the measured height and convert to inches. A method is required before the card will run.</p>
		<p>
			<strong>MusicNomad open@1st</strong> (electric/acoustic): E/A {formatInches(MUSICNOMAD_OPEN_1ST.standard[0].heightIn)} in,
			D/G {formatInches(MUSICNOMAD_OPEN_1ST.standard[1].heightIn)} in, B/e {formatInches(MUSICNOMAD_OPEN_1ST.standard[2].heightIn)} in.
			Heavy-attack note: 0.022 / 0.020 / 0.018 in.
		</p>
		<p>
			<strong>StewMac TS331 press@3rd</strong> shop clearances, bass → treble:
			{STEWMAC_TS331_PRESS_3RD.heightsIn.map((h) => formatInches(h)).join(' / ')} in.
		</p>
		<p>If fret crown (in) is supplied: comparison = measured height (in) + crown. That sum is not a slot depth to file.</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				MusicNomad open@1st, measured 0.018 in (D/G labeled height). The card records
				<strong>{formatInches(example.firstFretIn)} in</strong> and names that shop source. It does not file
				anything.
			</p>
			<p className="mono">{formatNutHeightCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Measurement aid. Not a nut-filing recipe. One swipe can ruin a slot.</li>
			<li>No 0.012–0.024 in invented window. Fender nut-gap numbers are unavailable.</li>
			<li>Open@1st and press@3rd are different methods. Do not treat the two tables as interchangeable.</li>
			<li>Fret crown is optional and stays in inches.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Measure the same way the source describes: open at the 1st, or pressed at the 3rd.</li>
			<li>If the string sits on the fret, the nut is low — this page still will not tell you how to file.</li>
			<li>Use the action worksheet for named higher frets.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Is this how I file the nut?</h3>
		<p>No. It is a measurement aid. Filing procedure is out of scope. One swipe can ruin a slot.</p>
		<h3>Why must I pick a method?</h3>
		<p>Open@1st and press@3rd are different shop measurements. Mixing them invents a number this page will not invent.</p>
		<h3>Is there a Fender factory nut gap?</h3>
		<p>Not in this checkout. Fender nut-gap numbers are unavailable and are not invented here.</p>
	</section>
	<RelatedTools tools={related} intro="Other live guitar-building tools in this category. All twelve audio / live sound tools are live." />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}. Research ID SS-NUT-01 — see <code>docs/guitar-formulas.md</code>.</p>
		<ul>
			<li>
				<a href={MUSICNOMAD_GUIDE_URL}>{MUSICNOMAD_OPEN_1ST.source}</a>
			</li>
			<li>{STEWMAC_TS331_PRESS_3RD.source}</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Measurement aid only. Not a filing procedure. Shop sources are not a Fender factory spec. One swipe can ruin a
			slot. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
