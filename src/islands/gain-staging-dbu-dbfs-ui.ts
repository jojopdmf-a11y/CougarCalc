import { bindCalcForm } from './bind-calc.ts';
import {
	FS_PRESETS,
	PLUS4_VS_MINUS10_DB,
	computeGainStaging,
	formatGainCopy,
	type BalUnbalKind,
	type FsPresetId,
	type GainMode,
} from '../calcs/gain-staging-dbu-dbfs.ts';
import { parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatDb, formatFixed } from '../calcs/format.ts';

function radioValue(form: HTMLFormElement, name: string): string | null {
	return form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? null;
}

export function bindGainStagingForm(form: HTMLFormElement): void {
	const dBu = form.querySelector<HTMLInputElement>('#dbu')!;
	const vrms = form.querySelector<HTMLInputElement>('#vrms')!;
	const fsDbu = form.querySelector<HTMLInputElement>('#fs-dbu')!;
	const ranePad = form.querySelector<HTMLInputElement>('#rane-pad')!;
	const spl = form.querySelector<HTMLInputElement>('#spl')!;
	const micSens = form.querySelector<HTMLInputElement>('#mic-sens')!;
	const micMv = form.querySelector<HTMLInputElement>('#mic-mv')!;
	const target = form.querySelector<HTMLInputElement>('#target-dbfs')!;
	const pad = form.querySelector<HTMLInputElement>('#pad')!;
	const deltaHa = form.querySelector<HTMLInputElement>('#delta-ha')!;
	const pell = form.querySelector<HTMLInputElement>('#pell')!;
	const yamaha = form.querySelector<HTMLInputElement>('#yamaha-comp')!;
	const analogFields = form.querySelector<HTMLElement>('[data-analog-fields]')!;
	const micFields = form.querySelector<HTMLElement>('[data-mic-fields]')!;
	const interconnectFields = form.querySelector<HTMLElement>('[data-interconnect-fields]')!;
	const haFields = form.querySelector<HTMLElement>('[data-ha-fields]')!;

	function mode(): GainMode {
		return (radioValue(form, 'mode') ?? 'analog-to-dbfs') as GainMode;
	}

	function syncMode(): void {
		const m = mode();
		analogFields.hidden = m === 'mic-pre' || m === 'interconnect' || m === 'ha-trim';
		micFields.hidden = m !== 'mic-pre';
		interconnectFields.hidden = m !== 'interconnect';
		haFields.hidden = m !== 'ha-trim';
	}

	form.querySelectorAll<HTMLButtonElement>('[data-fs-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			const id = (chip.dataset.fsChip ?? 'custom') as FsPresetId;
			const preset = FS_PRESETS.find((p) => p.id === id);
			if (preset?.fsDbu !== null && preset?.fsDbu !== undefined) {
				fsDbu.value = String(preset.fsDbu);
			}
			form.querySelectorAll<HTMLButtonElement>('[data-fs-chip]').forEach((other) => {
				other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
			});
			form.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});

	form.addEventListener('change', syncMode);
	form.addEventListener('reset', () => {
		form.querySelectorAll<HTMLButtonElement>('[data-fs-chip]').forEach((chip) => {
			chip.setAttribute('aria-pressed', 'false');
		});
	});

	bindCalcForm(form, {
		emptyMessage: 'Enter a level or pick a mode',
		isEmpty: () => {
			const m = mode();
			if (m === 'dbu-to-v' || m === 'analog-to-dbfs') return dBu.value.trim() === '' && fsDbu.value.trim() === '';
			if (m === 'v-to-dbu') return vrms.value.trim() === '';
			if (m === 'mic-pre') return spl.value.trim() === '' && micSens.value.trim() === '' && micMv.value.trim() === '';
			if (m === 'ha-trim') return deltaHa.value.trim() === '';
			return false;
		},
		evaluate: () => {
			syncMode();
			const m = mode();
			const dBuRaw = parseOptionalFiniteNumber(dBu.value);
			const vrmsRaw = parseOptionalFiniteNumber(vrms.value);
			const fsRaw = parseOptionalFiniteNumber(fsDbu.value);
			const splRaw = parseOptionalFiniteNumber(spl.value);
			const micRaw = parseOptionalFiniteNumber(micSens.value);
			const mvRaw = parseOptionalFiniteNumber(micMv.value);
			const targetRaw = parseOptionalFiniteNumber(target.value);
			const padRaw = parseOptionalFiniteNumber(pad.value);
			const haRaw = parseOptionalFiniteNumber(deltaHa.value);
			const pellRaw = parseOptionalFiniteNumber(pell.value);
			const errors: string[] = [];
			if (!dBuRaw.ok) errors.push('dBu must be a number, or left empty.');
			if (!vrmsRaw.ok) errors.push('Vrms must be a number, or left empty.');
			if (!fsRaw.ok) errors.push('FS_dBu must be a number, or left empty. This tool does not invent an FS volt.');
			if (!splRaw.ok) errors.push('SPL must be a number, or left empty.');
			if (!micRaw.ok) errors.push('Mic dBV/Pa must be a number, or left empty.');
			if (!mvRaw.ok) errors.push('mV/Pa must be a number, or left empty.');
			if (!targetRaw.ok) errors.push('Target dBFS must be a number, or left empty.');
			if (!padRaw.ok) errors.push('Pad must be a number ≥ 0, or left empty for 0.');
			if (!haRaw.ok) errors.push('HA change must be a number, or left empty.');
			if (!pellRaw.ok) errors.push('Pell meter target must be a number, or left empty.');

			if (m === 'dbu-to-v' && !(dBuRaw.ok && dBuRaw.value !== null)) errors.push('Enter a dBu value.');
			if (m === 'v-to-dbu' && !(vrmsRaw.ok && vrmsRaw.value !== null)) errors.push('Enter a voltage greater than zero.');
			if (m === 'analog-to-dbfs') {
				if (!(dBuRaw.ok && dBuRaw.value !== null)) errors.push('Enter the analog level in dBu.');
				if (!(fsRaw.ok && fsRaw.value !== null)) {
					errors.push('Enter FS_dBu or pick a labeled preset and confirm it in the manual.');
				}
			}
			if (m === 'mic-pre') {
				if (!(splRaw.ok && splRaw.value !== null)) errors.push('Enter SPL in dB (1 Pa = 94 dB SPL).');
				const hasSens =
					(micRaw.ok && micRaw.value !== null) || (mvRaw.ok && mvRaw.value !== null);
				if (!hasSens) errors.push('Enter mic sensitivity in dBV/Pa or mV/Pa. No scraped database.');
			}
			if (m === 'ha-trim' && !(haRaw.ok && haRaw.value !== null)) errors.push('Enter the analog HA change in dB.');
			if (errors.length) return { ok: false, errors };

			const result = computeGainStaging({
				mode: m,
				dBu: dBuRaw.ok && dBuRaw.value !== null ? dBuRaw.value : undefined,
				vrms: vrmsRaw.ok && vrmsRaw.value !== null ? vrmsRaw.value : undefined,
				fsDbu: fsRaw.ok && fsRaw.value !== null ? fsRaw.value : undefined,
				splDba: splRaw.ok && splRaw.value !== null ? splRaw.value : undefined,
				micSensitivityDbvPerPa: micRaw.ok && micRaw.value !== null ? micRaw.value : undefined,
				micSensitivityMvPerPa: mvRaw.ok && mvRaw.value !== null ? mvRaw.value : undefined,
				targetDbfs: targetRaw.ok && targetRaw.value !== null ? targetRaw.value : undefined,
				padDb: padRaw.ok && padRaw.value !== null ? padRaw.value : 0,
				applyRanePad: ranePad.checked,
				balUnbal: (radioValue(form, 'bal-unbal') ?? 'differential') as BalUnbalKind,
				deltaHaDb: haRaw.ok && haRaw.value !== null ? haRaw.value : undefined,
				yamahaCompensation: yamaha.checked,
				pellMeterTargetDbfs: pellRaw.ok && pellRaw.value !== null ? pellRaw.value : undefined,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras = [
				`+4 dBu vs −10 dBV is ${formatFixed(PLUS4_VS_MINUS10_DB, 2)} dB (not 14 dB).`,
				'Sine crest ≈ 3 dB (peak ≈ RMS + 3). Program peaks often 12–20 dB above nominal — a note, not a law.',
			];
			if (result.vrms !== null && result.dBu !== null && result.dBv !== null) {
				extras.unshift(`${formatFixed(result.vrms, 4)} Vrms · ${formatDb(result.dBu)} dBu · ${formatDb(result.dBv)} dBV`);
			}
			if (result.dBfs !== null && result.fsDbu !== null) {
				extras.push(`${formatDb(result.dBfs)} dBFS at FS ${formatDb(result.fsDbu)} dBu`);
				if (result.headroomDb !== null) extras.push(`Headroom to FS ${formatDb(result.headroomDb)} dB`);
			}
			if (result.raneApplied && result.balUnbalDb === null) extras.push('Rane −6 dB differential bal→unbal applied to the analog level.');
			if (result.micLdBv !== null) extras.push(`Mic L = ${formatDb(result.micLdBv)} dBV (1 Pa = 94 dB SPL).`);
			if (result.preampGainDb !== null) extras.push(`Suggested preamp gain ${formatDb(result.preampGainDb)} dB = target_dBFS + FS_dBu − mic_dBu + pad.`);
			if (result.balUnbalDb !== null) {
				extras.push(
					result.balUnbalDb === -6
						? 'Ordinary differential bal→unbal: −6 dB and −6 dB headroom (Rane Note 124).'
						: 'Transformer / cross-coupled: 0 dB gain. Headroom caveat from Rane still applies.',
				);
			}
			if (result.deltaHaDb !== null) {
				extras.push(
					result.yamahaCompensation
						? 'Yamaha-style rack compensation: network_level_change = 0 when HA changes.'
						: `Without compensation: delta_trim = ${formatDb(result.deltaTrimDb ?? 0)} dB so the mix holds. digital_level_change = ${formatDb(result.digitalLevelChangeDb ?? 0)} dB.`,
				);
				if (result.unclipNote) extras.push(result.unclipNote);
				if (result.pellMeterTargetDbfs !== null) {
					extras.push(
						`Pell-style peak-meter practice ${formatDb(result.pellMeterTargetDbfs)} dBFS (user-editable). Not EBU R68 / C02 FS mapping.`,
					);
				}
			}

			let value = '—';
			let unit = '';
			let decision = 'Level arithmetic';
			if (m === 'analog-to-dbfs' && result.dBfs !== null) {
				value = formatDb(result.dBfs);
				unit = 'dBFS';
				decision = 'Analog level relative to the FS_dBu you set. Confirm that mapping in the manual.';
			} else if (m === 'v-to-dbu' && result.dBu !== null) {
				value = formatDb(result.dBu);
				unit = 'dBu';
				decision = 'dBu from Vrms (0.775 V reference)';
			} else if (m === 'mic-pre' && result.preampGainDb !== null) {
				value = formatDb(result.preampGainDb);
				unit = 'dB';
				decision = 'Suggested preamp gain. Sensitivity is whatever you typed.';
			} else if (m === 'interconnect' && result.balUnbalDb !== null) {
				value = formatDb(result.balUnbalDb);
				unit = 'dB';
				decision = 'Interconnect gain change';
			} else if (m === 'ha-trim' && result.deltaTrimDb !== null) {
				value = formatDb(result.yamahaCompensation ? 0 : result.deltaTrimDb);
				unit = 'dB';
				decision = result.yamahaCompensation
					? 'Network level change (compensation on)'
					: 'Suggested digital-trim change to hold the mix';
			} else if (result.vrms !== null) {
				value = formatFixed(result.vrms, 4);
				unit = 'Vrms';
				decision = 'Vrms from dBu (0.775 V reference)';
			}

			return {
				ok: true,
				rendered: { value, unit, decision, extras, copy: formatGainCopy(result) },
			};
		},
	});

	syncMode();
}
