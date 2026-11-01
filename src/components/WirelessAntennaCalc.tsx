import CalcShell from './CalcShell.tsx';
import { bindWirelessAntennaForm } from '../islands/wireless-antenna-spacing-ui.ts';

export default function WirelessAntennaCalc() {
const warning =
	'RF wavelength uses c = 2.99792458×10⁸ m/s, not the speed of sound. Diversity ¼λ is a starting spacing, not a guarantee. Coax loss uses only Belden 9913 at 700 MHz; it is not interpolated.';
	return (
<CalcShell
	bind={bindWirelessAntennaForm} formId="wireless-antenna-spacing-form" emptyMessage="Enter a frequency" warning={warning} warningKind="warn">
	<fieldset>
		<legend>RF frequency</legend>
		<div className="field">
			<label htmlFor="freq-mhz">Frequency (MHz)</label>
			<input id="freq-mhz" type="text" inputMode="decimal" autoComplete="off" />
			<p className="hint">λ = c/f with c = 2.99792458×10⁸ m/s. The 300/f_MHz rule of thumb is shown beside it. Not 468/f.</p>
		</div>
	</fieldset>
	<details className="drawer">
		<summary>Optional coax loss (Belden 9913 @ 700 MHz only)</summary>
		<div className="checks">
			<label>
				<input type="checkbox" id="apply-coax" />
				Apply coax loss using Belden 9913 11.8 dB / 100 m @ 700 MHz
			</label>
		</div>
		<div className="field-row">
			<div className="field">
				<label htmlFor="coax-length">Coax length</label>
				<input id="coax-length" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="coax-unit">Unit</label>
				<select defaultValue="m" id="coax-unit">
					<option value="m">m</option>
					<option value="ft">ft</option>
				</select>
			</div>
		</div>
		<p className="hint">
			α is not interpolated to other frequencies or cables. Shure cites 3.6 dB/100 ft for 9913 at 700 MHz, which is
			11.8 dB/100 m. Other α values are not invented here.
		</p>
	</details>
</CalcShell>
	)
}
