import ToolPageLayout from '../../../components/ToolPage.tsx';
import SeventyVoltCalc from '../../../components/SeventyVoltCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import { compute70vTap, format70vCopy, FIRE_ALARM_REFUSAL, VOLTAGE_70V } from '../../../calcs/seventy-volt.ts';
import { formatFixed, formatOhms } from '../../../calcs/format.ts';

export default function Page() {
const example = compute70vTap({
	fireAlarm: false,
	voltage: VOLTAGE_70V,
	taps: [{ watts: 10, count: 1 }],
});
if (!example.ok || example.refused) throw new Error('70v-tap example failed');
const related = relatedAudioPage('70v-tap');
const warning =
	'BGM, paging, and under-balcony distributed audio only. Checking fire-alarm / NFPA 72 / EN 54 refuses the calculation. This is not a life-safety design tool.';
const lede = 'Constant-voltage taps for BGM, paging, and under-balcony only. Fire-alarm standards are refused.';
	return (
<ToolPageLayout
	title="70 V tap / distributed load"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/70v-tap/', label: '70 V tap' },
	]}
>
	<SeventyVoltCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is total tap watts. Equivalent Z and current follow from V²/P. If you check fire-alarm /
			NFPA 72 / EN 54, the tool refuses and prints no numbers. US “70 V” here is 70.7 V.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">Z_tap = V² / P_tap</p>
		<p className="formula">I_tap = P_tap / V</p>
		<p className="formula">P_total = Σ (P_tap × count) &nbsp; Z_eq = V² / P_total</p>
		<p>V is 70.7 V or 100 V. Checking the fire-alarm box returns this refusal, with no ohms or amps:</p>
		<p className="formula">{FIRE_ALARM_REFUSAL}</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				10 W tap at 70.7 V, count 1. Z = 70.7² / 10 =
				<strong>{formatOhms(example.totalZ)} Ω</strong>. I = 10 / 70.7 =
				<strong>{formatFixed(example.totalCurrent, 3)} A</strong>.
			</p>
			<p className="mono">{format70vCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>BGM, paging, and under-balcony distributed audio only.</li>
			<li>Fire-alarm / NFPA 72 / EN 54 / life-safety is refused. No workaround numbers.</li>
			<li>Ideal transformers. Cable loss, tap accuracy, and transformer insertion loss are not modeled.</li>
			<li>Not the speaker-cable (low-Z) tool. Not NEC ampacity.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Leave amplifier headroom above the watt sum. Transformer losses are real and not in this arithmetic.</li>
			<li>70.7 V is the RMS value behind the US “70 volt” name. 100 V is the IEC distributed figure.</li>
			<li>If the job is a fire-alarm speaker loop, stop. Use a listed fire-alarm method.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why 70.7 V and not 70?</h3>
		<p>US constant-voltage distribution is 70.7 Vrms (100 V peak on a sine). This tool uses 70.7.</p>
		<h3>Why refuse fire alarm?</h3>
		<p>
			NFPA 72 and EN 54 speaker circuits have listed hardware, supervision, and intelligibility rules this
			prototype will not pretend to satisfy. The refusal string is the whole answer — no Z, no I.
		</p>
		<h3>Is this the same as speaker cable loss?</h3>
		<p>No. Low-Z copper loops are the speaker-cable tool. This page is transformer taps on a constant-voltage line.</p>
		<h3>Can I mix 70.7 V and 100 V taps?</h3>
		<p>Not in one run. Pick one voltage. Mixing would need a different circuit.</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>Constant-voltage distribution: Z = V²/P at 70.7 V or 100 V (AES / IEC distributed-speaker practice).</li>
			<li>NFPA 72 and EN 54 life-safety speaker circuits — refused here; use a listed fire-alarm design method.</li>
			<li>US “70 V” = 70.7 Vrms.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			BGM / paging / under-balcony arithmetic only. Fire-alarm is refused. Not a listed life-safety design.
			CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
