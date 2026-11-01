import ToolPageLayout from '../../../components/ToolPage.tsx';
import WirelessAntennaCalc from '../../../components/WirelessAntennaCalc.tsx';
import RelatedTools from '../../../components/RelatedTools.tsx';
import { AUDIO_CATEGORY, AUDIO_RELATED_INTRO, relatedAudioPage } from '../../../data/catalog.ts';
import { LAST_REVIEWED_LABEL } from '../../../site.ts';
import {
	computeWirelessSpacing,
	formatWirelessCopy,
	RF_C_MPS,
	BELDEN_9913_ALPHA_DB_PER_100M_700MHZ,
} from '../../../calcs/wireless-antenna.ts';
import { formatDualLength, formatFixed } from '../../../calcs/format.ts';

export default function Page() {
const example = computeWirelessSpacing({ frequencyHz: 500e6, applyCoax: false });
if (!example.ok) throw new Error('wireless-antenna example failed');
const related = relatedAudioPage('wireless-antenna-spacing');
const warning =
	'RF wavelength uses c = 2.99792458×10⁸ m/s, not the speed of sound. Diversity ¼λ is a starting spacing, not a guarantee. Coax loss uses only Belden 9913 at 700 MHz; it is not interpolated.';
const lede =
	'RF wavelength and a ¼λ diversity starting spacing. Coax loss is optional and only at the cited Belden 9913 figure.';
	return (
<ToolPageLayout
	title="Wireless antenna spacing"
	description={lede}
	kicker="Audio / live sound"
	lede={lede}
	warning={warning}
	warningKind="warn"
	crumbs={[
		{ href: '/', label: 'Home' },
		{ href: AUDIO_CATEGORY.href, label: AUDIO_CATEGORY.title },
		{ href: '/audio-live-sound/wireless-antenna-spacing/', label: 'Wireless antenna spacing' },
	]}
>
	<WirelessAntennaCalc />
	<section className="prose">
		<h2>What the result means</h2>
		<p>
			The large number is ¼λ in metres: a common minimum diversity spacing at that frequency. It is not a scanned
			RF plot, not a guarantee against dropouts, and not an antenna-gain figure.
		</p>
	</section>
	<section className="prose">
		<h2>Formula / method</h2>
		<p className="formula">λ = c / f &nbsp; with c = {RF_C_MPS} m/s</p>
		<p className="formula">λ(m) ≈ 300 / f_MHz &nbsp;(rule of thumb, shown beside the exact value)</p>
		<p className="formula">Diversity minimum ≈ λ / 4</p>
		<p>
			Coax loss, if enabled: (L / 100) × {formatFixed(BELDEN_9913_ALPHA_DB_PER_100M_700MHZ, 1)} dB using Belden 9913
			at 700 MHz only. That α is not interpolated to other frequencies. The amateur-radio 468/f dipole formula is
			not used.
		</p>
	</section>
	<section className="prose">
		<h2>Worked example</h2>
		<div className="example-box">
			<p>
				500 MHz. λ = c/f = {RF_C_MPS} / 5×10⁸ = <strong>{formatDualLength(example.lambda_m)}</strong>.
				300/500 = 0.600 m. ¼λ = <strong>{formatDualLength(example.quarterWave_m)}</strong>.
			</p>
			<p className="mono">{formatWirelessCopy(example)}</p>
		</div>
	</section>
	<section className="prose">
		<h2>Assumptions and limitations</h2>
		<ul>
			<li>Free-space RF wavelength in air. No building materials, no body absorption, no antenna pattern.</li>
			<li>¼λ is a starting diversity spacing cited in wireless-mic practice, not a measured correlation distance.</li>
			<li>The only opened coax α is Belden 9913 at 700 MHz. Other cables are not invented here.</li>
			<li>c is the SI speed of light, not Sengpiel air speed and not 468/f in feet.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>Practical notes</h2>
		<ul>
			<li>Keep antennas in the same polarization and out of the metal forest behind the console.</li>
			<li>If you change bands (470 MHz vs 900 MHz), ¼λ changes. Recalculate; do not reuse a UHF TV spacing blindly.</li>
			<li>Remote antennas add coax loss. Only 9913 @ 700 MHz is quantified here; look up any other cable.</li>
		</ul>
	</section>
	<section className="prose">
		<h2>FAQs</h2>
		<h3>Why isn’t this 343 m/s?</h3>
		<p>
			343 m/s is air for sound. RF uses the speed of light. Mixing them is a common live-sound landmine; this tool
			uses {RF_C_MPS} m/s.
		</p>
		<h3>Why not 468/f?</h3>
		<p>
			468/f is an amateur half-wave dipole length in feet. It is not a diversity spacing and is not used here.
		</p>
		<h3>Can I enter another coax’s dB/100 m?</h3>
		<p>
			Not in this prototype. The opened figure is Belden 9913 11.8 dB/100 m at 700 MHz (Shure’s 3.6 dB/100 ft).
			Other α values are not invented.
		</p>
		<h3>Is ¼λ enough for diversity?</h3>
		<p>
			It is a widely cited minimum. Manufacturer RF guides still tell you to verify on site. Spacing does not fix a
			missing line of sight.
		</p>
	</section>
	<RelatedTools tools={related} intro={AUDIO_RELATED_INTRO} />
	<section className="prose sources">
		<h2>Sources</h2>
		<p>Last reviewed {LAST_REVIEWED_LABEL}.</p>
		<ul>
			<li>SI speed of light c = 2.99792458×10⁸ m/s.</li>
			<li>
				<a href="https://www.shure.com/en-US/insights">Shure wireless practice — diversity spacing on the order of ¼λ</a>
			</li>
			<li>Belden 9913 attenuation 3.6 dB/100 ft @ 700 MHz = 11.8 dB/100 m (Shure / Belden, not interpolated here).</li>
			<li>λ(m) ≈ 300 / f_MHz as a check on c/f, not a replacement.</li>
		</ul>
	</section>
	<section className="disclaimer">
		<h2>Disclaimer</h2>
		<p>
			RF geometry aid only. Not a coordination plot, not a license check, not a measurement of dropouts. Coax loss
			at frequencies other than 700 MHz on 9913 is not computed. CougarCalc is a Phase 2 prototype.
		</p>
	</section>
</ToolPageLayout>
	)
}
