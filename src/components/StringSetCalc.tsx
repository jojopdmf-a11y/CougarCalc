import CalcShell from './CalcShell.tsx';
import { DADDARIO_WAYBACK_SOURCE, UNIT_WEIGHT_TABLE } from '../calcs/string-tension.ts';
import { bindStringSetForm } from '../islands/string-set-ui.ts';

export default function StringSetCalc() {
const warning =
	'Total is the sum of per-string tensions. This is never a green “safe for this neck” rating.';
const names = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
const exl110 = UNIT_WEIGHT_TABLE.filter((row) => row.label.startsWith('EXL110'));
const extra = UNIT_WEIGHT_TABLE.filter((row) => !row.label.startsWith('EXL110'));
	return (
<CalcShell
	bind={bindStringSetForm}
	formId="string-set-form"
	emptyMessage="Enter scale and at least one string with frequency and cited UW"
	warning={warning}
	warningKind="warn"
>
	<fieldset>
		<legend>Shared scale</legend>
		<div className="field-row">
			<div className="field">
				<label htmlFor="scale">S</label>
				<input id="scale" type="text" inputMode="decimal" autoComplete="off" />
			</div>
			<div className="field">
				<label htmlFor="scale-unit">Unit</label>
				<select defaultValue="in" id="scale-unit">
					<option value="in">in</option>
					<option value="mm">mm</option>
				</select>
			</div>
		</div>
		<p className="hint">{DADDARIO_WAYBACK_SOURCE} Each string uses this scale. No GHS cells. No max-safe T. No neck-safe badge.</p>
	</fieldset>
	<div className="dyn-rows" data-string-rows>
		{
			names.map((name, i) => (
				<fieldset className="string-row" data-string-row>
					<legend>String {i + 1}</legend>
					<div className="field-grid">
						<div className="field">
							<label>
								Name
								<input data-name type="text" defaultValue={name} autoComplete="off" />
							</label>
						</div>
						<div className="field">
							<label>
								Frequency (Hz)
								<input data-freq type="text" inputMode="decimal" autoComplete="off" />
							</label>
						</div>
					</div>
					<div className="field">
						<label>
							Cited UW
							<select data-uw-table>
								<option value="">Select an archived D’Addario Item# or enter UW</option>
								<optgroup label="EXL110 Regular Light (archived Catalog Supplement)">
									{exl110.map((row) => (
										<option value={row.item}>
											{row.item} — {row.uwLbPerIn} lb/in
										</option>
									))}
								</optgroup>
								{extra.length > 0 && (
									<optgroup label="Other archived Item#">
										{extra.map((row) => (
											<option value={row.item}>
												{row.item} — {row.uwLbPerIn} lb/in
											</option>
										))}
									</optgroup>
								)}
								<option value="user">User-cited UW (lb/in)</option>
							</select>
						</label>
					</div>
					<div className="field" data-uw-field hidden>
						<label>
							UW (lb/in)
							<input data-uw type="text" inputMode="decimal" autoComplete="off" />
						</label>
					</div>
					<div className="dyn-toolbar">
						<button type="button" className="btn-secondary" data-remove-row>Remove string</button>
					</div>
				</fieldset>
			))
		}
	</div>
	<div className="dyn-toolbar">
		<button type="button" className="btn-secondary" data-add-row>Add string</button>
	</div>
	<template data-string-template>
		<fieldset className="string-row" data-string-row>
			<legend>String</legend>
			<div className="field-grid">
				<div className="field">
					<label>
						Name
						<input data-name type="text" autoComplete="off" />
					</label>
				</div>
				<div className="field">
					<label>
						Frequency (Hz)
						<input data-freq type="text" inputMode="decimal" autoComplete="off" />
					</label>
				</div>
			</div>
			<div className="field">
				<label>
					Cited UW
					<select data-uw-table>
						<option value="">Select an archived D’Addario Item# or enter UW</option>
						<optgroup label="EXL110 Regular Light (archived Catalog Supplement)">
							{exl110.map((row) => (
								<option value={row.item}>
									{row.item} — {row.uwLbPerIn} lb/in
								</option>
							))}
						</optgroup>
						{extra.length > 0 && (
							<optgroup label="Other archived Item#">
								{extra.map((row) => (
									<option value={row.item}>
										{row.item} — {row.uwLbPerIn} lb/in
									</option>
								))}
							</optgroup>
						)}
						<option value="user">User-cited UW (lb/in)</option>
					</select>
				</label>
			</div>
			<div className="field" data-uw-field hidden>
				<label>
					UW (lb/in)
					<input data-uw type="text" inputMode="decimal" autoComplete="off" />
				</label>
			</div>
			<div className="dyn-toolbar">
				<button type="button" className="btn-secondary" data-remove-row>Remove string</button>
			</div>
		</fieldset>
	</template>
	<div className="table-wrap" data-table-wrap hidden slot="below">
		<table>
			<caption className="visually-hidden">Per-string tension</caption>
			<thead>
				<tr>
					<th scope="col">String</th>
					<th scope="col">T (lbf)</th>
					<th scope="col">T (N)</th>
				</tr>
			</thead>
			<tbody data-table-body></tbody>
		</table>
	</div>
</CalcShell>
	)
}
