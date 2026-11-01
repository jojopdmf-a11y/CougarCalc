import ToolPageLayout from '../../../components/ToolPage.tsx';
import PhantomBudgetCalc from '../../../components/PhantomBudgetCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { computePhantomBudget, formatPhantomCopy } from '../../../calcs/phantom-budget.ts';
import { formatFixed } from '../../../calcs/format.ts';

export default function Page() {
const example = computePhantomBudget({
	rows: [
		{ label: 'condenser', mA: 4, count: 3 },
		{ label: 'DI', mA: 7, count: 2 },
	],
	budgetMa: null,
});
if (!example.ok) throw new Error('phantom-budget example failed');
const related = relatedAudioPage('phantom-power-budget');
const warning =
	'Empty supply budget stays empty — this tool never assumes 500 mA. High microphone current on long, thin cable can sag 48 V (Bartlett); that drop is not modeled here.';
const lede = 'Sum of milliamps times count. If you leave the supply budget empty, it stays empty.';
	return (
<ToolPageLayout
	title="Phantom power budget"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/phantom-power-budget/', label: 'Phantom power budget' },
	]}
>
	<PhantomBudgetCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is total phantom current in milliamps. Remaining milliamps appear only if you typed a supply
			budget. An empty budget is not silently replaced with 500 mA.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">total_mA = Σ (mA × count)</p>
		<p>If a budget B is typed: remaining = B − total. If B is empty, remaining is empty.</p>
		<p>
			IEC 61938 P48 is 48 V phantom. Current per input is whatever the microphone or DI datasheet lists. This tool
			does not convert volts or model cable resistance.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				3 × 4 mA condensers + 2 × 7 mA DIs. Total = 12 + 14 =
				<strong>{formatFixed(example.totalMa, 1)} mA</strong>. Budget left empty, so remaining stays empty.
			</p>
			<p className="mono">{formatPhantomCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Arithmetic sum only. No 6.8 kΩ pair, no cable DCR, no voltage-drop model.</li>
			<li>500 mA is a common mixer marketing number. It is not assumed here.</li>
			<li>Datasheet milliamps are DC. Peak digital-mic draw can be higher than the average you typed.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Read mA from the mic or active-DI sheet. Ribbon “do not apply phantom” is a different problem.</li>
			<li>
				Bruce Bartlett notes that high current on long, thin cable can sag the 48 V at the microphone. This
				prototype does not compute that sag.
			</li>
			<li>If the mixer spec is “48 V, max 10 mA per channel,” use that as the budget per input, not a desk-wide 500.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why isn’t the budget 500 mA?</h3>
		<p>
			Some desks publish ~500 mA total; many do not. Filling 500 by default would over-promise. Leave it empty or
			type the figure from your mixer manual.
		</p>
		<h3>Does this tell me if phantom will sag?</h3>
		<p>
			No. Bartlett’s practical recording notes warn that high-draw mics plus long thin cable can pull 48 V down.
			You would need cable resistance and the IEC 61938 resistors to model it. This tool only sums milliamps.
		</p>
		<h3>Is phantom the same as +48 V plug-in power?</h3>
		<p>No. Plug-in power is a few volts for electret lavs. Do not mix the two.</p>
		<h3>Can I enter 0 mA?</h3>
		<p>Yes, for dynamic mics that draw nothing. Count still has to be an integer ≥ 1 if the row is used.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>IEC 61938 — P48 phantom powering of microphones (48 V).</li>
			<li>Bruce Bartlett — high current and long thin cable can sag 48 V at the microphone (practical recording notes).</li>
			<li>Manufacturer mixer specs: total phantom current is product-specific; 500 mA is not universal.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			Milliamp sum only. Not a voltage-drop model, not a ribbon-mic safety check, not a mixer design. Empty budget
			is empty. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
