import { bindCalcForm } from './bind-calc.ts';
import {
	COHERENT_WARNING,
	computeAesRatings,
	computeLimiterThreshold,
	computeMaxSpl,
	formatAesCopy,
	formatLimiterCopy,
	formatMaxSplCopy,
	HEADROOM_CHIP_DB,
	INDOOR_NOTE_DB,
	LEA_LIMITER_DISCLAIMER,
	type AesPath,
	type MaxSplMode,
	type Radiation,
	type SensitivityRef,
	type Summing,
	type ZConvention,
} from '../calcs/max-spl.ts';
import { parseFiniteNumber, parseInteger, parseOptionalFiniteNumber } from '../calcs/parse.ts';
import { formatDb, formatDualLength, formatFixed } from '../calcs/format.ts';
import type { LengthUnit } from '../calcs/units.ts';

function radioValue(form: HTMLFormElement, name: string): string | null {
	return form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? null;
}

export function bindMaxSplForm(form: HTMLFormElement): void {
	const sens = form.querySelector<HTMLInputElement>('#sens')!;
	const z = form.querySelector<HTMLInputElement>('#z')!;
	const power = form.querySelector<HTMLInputElement>('#power')!;
	const target = form.querySelector<HTMLInputElement>('#target')!;
	const headroom = form.querySelector<HTMLInputElement>('#headroom')!;
	const distance = form.querySelector<HTMLInputElement>('#distance')!;
	const distUnit = form.querySelector<HTMLSelectElement>('#dist-unit')!;
	const count = form.querySelector<HTMLInputElement>('#count')!;
	const indoor = form.querySelector<HTMLInputElement>('#indoor-note')!;
	const aesPower = form.querySelector<HTMLInputElement>('#aes-power')!;
	const limPower = form.querySelector<HTMLInputElement>('#lim-power')!;
	const limCf = form.querySelector<HTMLInputElement>('#lim-cf')!;
	const limGain = form.querySelector<HTMLInputElement>('#lim-gain')!;
	const limFs = form.querySelector<HTMLInputElement>('#lim-fs')!;
	const powerField = form.querySelector<HTMLElement>('[data-power-field]')!;
	const wattsFields = form.querySelector<HTMLElement>('[data-watts-fields]')!;

	function mode(): MaxSplMode {
		return radioValue(form, 'mode') === 'watts-for-target' ? 'watts-for-target' : 'max-spl';
	}

	function syncModeUi(): void {
		const watts = mode() === 'watts-for-target';
		powerField.hidden = watts;
		wattsFields.hidden = !watts;
	}

	form.querySelectorAll<HTMLButtonElement>('[data-hr-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			headroom.value = chip.dataset.hr ?? '';
			form.querySelectorAll<HTMLButtonElement>('[data-hr-chip]').forEach((other) => {
				other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
			});
			form.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});

	headroom.addEventListener('input', () => {
		form.querySelectorAll<HTMLButtonElement>('[data-hr-chip]').forEach((chip) => {
			chip.setAttribute('aria-pressed', chip.dataset.hr === headroom.value.trim() ? 'true' : 'false');
		});
	});

	form.querySelectorAll<HTMLButtonElement>('[data-cf-chip]').forEach((chip) => {
		chip.addEventListener('click', () => {
			limCf.value = chip.dataset.cf ?? '';
			form.querySelectorAll<HTMLButtonElement>('[data-cf-chip]').forEach((other) => {
				other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
			});
			form.dispatchEvent(new Event('input', { bubbles: true }));
		});
	});

	form.addEventListener('change', () => {
		syncModeUi();
	});

	form.addEventListener('reset', () => {
		form.querySelectorAll<HTMLButtonElement>('[data-hr-chip], [data-cf-chip]').forEach((chip) => {
			chip.setAttribute('aria-pressed', 'false');
		});
	});

	bindCalcForm(form, {
		emptyMessage: 'Enter sensitivity and power',
		isEmpty: () =>
			sens.value.trim() === '' &&
			power.value.trim() === '' &&
			target.value.trim() === '' &&
			headroom.value.trim() === '',
		evaluate: () => {
			syncModeUi();
			const currentMode = mode();
			const sensRaw = parseFiniteNumber(sens.value);
			const zRaw = parseFiniteNumber(z.value);
			const powerRaw = currentMode === 'max-spl' ? parseFiniteNumber(power.value) : parseOptionalFiniteNumber(power.value);
			const targetRaw = currentMode === 'watts-for-target' ? parseFiniteNumber(target.value) : parseOptionalFiniteNumber(target.value);
			const hrRaw = currentMode === 'watts-for-target' ? parseFiniteNumber(headroom.value) : parseOptionalFiniteNumber(headroom.value);
			const distRaw = parseFiniteNumber(distance.value);
			const countRaw = parseInteger(count.value);
			const errors: string[] = [];

			if (!sensRaw.ok) errors.push(sensRaw.reason === 'empty' ? 'Enter sensitivity in dB SPL.' : 'Sensitivity is not a number.');
			if (!zRaw.ok) errors.push(zRaw.reason === 'empty' ? 'Enter impedance Z greater than zero.' : 'Impedance is not a number.');
			if (currentMode === 'max-spl' && !powerRaw.ok) {
				errors.push(powerRaw.reason === 'empty' ? 'Enter amplifier power greater than zero.' : 'Amplifier power is not a number.');
			}
			if (currentMode === 'watts-for-target' && !targetRaw.ok) {
				errors.push(targetRaw.reason === 'empty' ? 'Enter a target SPL.' : 'Target SPL is not a number.');
			}
			if (currentMode === 'watts-for-target' && !hrRaw.ok) {
				errors.push(
					hrRaw.reason === 'empty'
						? `Enter headroom in dB. Suggested chips: ${HEADROOM_CHIP_DB.join(' / ')} dB (Crown article live-sound range). This tool does not default the Crown widget’s 3 dB example.`
						: 'Headroom is not a number.',
				);
			}
			if (!distRaw.ok) errors.push(distRaw.reason === 'empty' ? 'Enter distance greater than zero.' : 'Distance is not a number.');
			if (!countRaw.ok) errors.push(countRaw.reason === 'empty' ? 'Enter cabinet count N as a whole number ≥ 1.' : 'Cabinet count N must be an integer ≥ 1.');

			const aesPowerRaw = parseOptionalFiniteNumber(aesPower.value);
			if (!aesPowerRaw.ok) errors.push('AES continuous power must be a number greater than zero, or left empty to skip that drawer.');

			const limPowerRaw = parseOptionalFiniteNumber(limPower.value);
			const limCfRaw = parseOptionalFiniteNumber(limCf.value);
			const limGainRaw = parseOptionalFiniteNumber(limGain.value);
			const limFsRaw = parseOptionalFiniteNumber(limFs.value);
			const limiterTouched = [limPower.value, limCf.value, limGain.value, limFs.value].some((v) => v.trim() !== '');
			if (limiterTouched) {
				if (!limPowerRaw.ok || limPowerRaw.value === null) errors.push('Limiter drawer: enter power greater than zero, or clear the drawer.');
				if (!limCfRaw.ok || limCfRaw.value === null) errors.push('Limiter drawer: enter crest factor in dB, or clear the drawer.');
				if (!limGainRaw.ok || limGainRaw.value === null) errors.push('Limiter drawer: enter amplifier voltage gain G_amp in dB, or clear the drawer.');
				if (!limFsRaw.ok || limFsRaw.value === null) errors.push('Limiter drawer: enter FS_dBu, or clear the drawer. This tool does not invent a mapping.');
			} else {
				if (!limPowerRaw.ok) errors.push('Limiter power is not a number.');
				if (!limCfRaw.ok) errors.push('Limiter crest factor is not a number.');
				if (!limGainRaw.ok) errors.push('Limiter G_amp is not a number.');
				if (!limFsRaw.ok) errors.push('Limiter FS_dBu is not a number.');
			}

			if (errors.length) return { ok: false, errors };
			if (!sensRaw.ok || !zRaw.ok || !distRaw.ok || !countRaw.ok) return { ok: false, errors: ['Fix the inputs'] };

			const result = computeMaxSpl({
				sensitivityDb: sensRaw.value,
				sensitivityRef: (radioValue(form, 'sens-ref') ?? '1w1m') as SensitivityRef,
				impedanceOhm: zRaw.value,
				powerW: powerRaw.ok && powerRaw.value !== null ? powerRaw.value : 1,
				distance: distRaw.value,
				distanceUnit: distUnit.value as LengthUnit,
				radiation: (radioValue(form, 'radiation') ?? 'point') as Radiation,
				count: countRaw.value,
				summing: (radioValue(form, 'summing') ?? 'incoherent') as Summing,
				mode: currentMode,
				targetSpl: targetRaw.ok && targetRaw.value !== null ? targetRaw.value : undefined,
				headroomDb: hrRaw.ok && hrRaw.value !== null ? hrRaw.value : undefined,
				indoorNote: indoor.checked,
			});
			if (!result.ok) return { ok: false, errors: result.errors.map((e) => e.message) };

			const extras: string[] = [
				`Continuous, not peak. Free-field, on-axis at ${formatDualLength(result.distance_m)}.`,
				`1 W/1 m equivalent ${formatDb(result.sens1W1m)} dB`,
				result.landmineNote,
				`SPL at 1 m ${formatDb(result.splAt1m)} dB = Sens_1W1m + 10 log10(P). N is not inside this term.`,
				`Distance ${formatDb(result.distanceTermDb)} dB (${result.distanceLossDb === result.distanceTermDb ? (radioValue(form, 'radiation') === 'line' ? 'ideal line −10 log10(d/1)' : 'point −20 log10(d/1)') : ''})`,
				`N-term ${formatDb(result.nTermDb)} dB (${radioValue(form, 'summing') === 'coherent' ? 'coherent +20 log10(N)' : 'incoherent +10 log10(N)'})`,
			];
			if (result.coherentWarning) extras.push(COHERENT_WARNING);
			if (result.indoorNoteSpl !== null) {
				extras.push(
					`Crown-article indoor note +${INDOOR_NOTE_DB} dB (labeled, not a default, not in the large number): ${formatDb(result.indoorNoteSpl)} dB`,
				);
			} else {
				extras.push('No indoor room gain. Direct field only.');
			}

			let copy = formatMaxSplCopy(result);

			if (aesPowerRaw.ok && aesPowerRaw.value !== null) {
				const aes = computeAesRatings({
					continuousW: aesPowerRaw.value,
					impedanceOhm: zRaw.value,
					zConvention: (radioValue(form, 'z-convention') ?? 'zmin') as ZConvention,
					aesPath: (radioValue(form, 'aes-path') ?? '6db-convention') as AesPath,
				});
				if (!aes.ok) return { ok: false, errors: aes.errors.map((e) => e.message) };
				extras.push(`${aes.zConventionLabel}: Vrms ${formatFixed(aes.vrms, 3)} V = √(P·Z)`);
				extras.push(aes.programNote + ` Program ${formatFixed(aes.programW, 1)} W.`);
				if (aes.emitPeakConvention4x && aes.vPeak6dB !== null && aes.pPeakConvention !== null) {
					extras.push(
						`6 dB crest convention (not a lab): Vpeak = 2 × Vrms = ${formatFixed(aes.vPeak6dB, 3)} V; Ppeak_convention = 4 × P = ${formatFixed(aes.pPeakConvention, 1)} W.`,
					);
				} else {
					extras.push(aes.aes2012Note ?? 'AES2-2012 12 dB CF: 4× power is not AES peak.');
					if (aes.vPeak12dBVoltage !== null) {
						extras.push(
							`12 dB voltage crest (not AES peak watts): Upeak = 4 × Urms = ${formatFixed(aes.vPeak12dBVoltage, 3)} V.`,
						);
					}
				}
				copy += ' ' + formatAesCopy(aes);
			}

			if (limiterTouched && limPowerRaw.ok && limPowerRaw.value !== null && limCfRaw.ok && limCfRaw.value !== null && limGainRaw.ok && limGainRaw.value !== null && limFsRaw.ok && limFsRaw.value !== null) {
				const lim = computeLimiterThreshold({
					powerW: limPowerRaw.value,
					impedanceOhm: zRaw.value,
					crestFactorDb: limCfRaw.value,
					ampGainDb: limGainRaw.value,
					fsDbu: limFsRaw.value,
				});
				if (!lim.ok) return { ok: false, errors: lim.errors.map((e) => e.message) };
				extras.push(
					`Limiter (nominal Z ${formatFixed(zRaw.value, 2)} Ω): Urms ${formatFixed(lim.urms, 3)} V (${formatDb(lim.urmsDbu)} dBu), Upeak ${formatFixed(lim.upeak, 3)} V (${formatDb(lim.upeakDbu)} dBu).`,
				);
				extras.push(
					`Threshold ${formatDb(lim.thresholdDbu)} dBu = Upeak_dBu − G_amp; ${formatDb(lim.thresholdDbfs)} dBFS = Threshold_dBu − FS_dBu.`,
				);
				extras.push(LEA_LIMITER_DISCLAIMER);
				copy += ' ' + formatLimiterCopy(lim);
			}

			if (result.wattsForTarget !== null && result.dBW !== null && result.headroomDb !== null) {
				return {
					ok: true,
					rendered: {
						value: formatFixed(result.wattsForTarget, 1),
						unit: 'W',
						decision: 'Amplifier watts for the continuous target, plus the headroom you entered (Crown). Not a peak rating.',
						extras: [
							`dBW ${formatDb(result.dBW)} with headroom ${formatDb(result.headroomDb)} dB (you typed this; 3 dB is not a default).`,
							`Continuous listener SPL at that power ${formatDb(result.listenerSpl)} dB.`,
							...extras,
						],
						copy,
					},
				};
			}

			return {
				ok: true,
				rendered: {
					value: formatDb(result.listenerSpl),
					unit: 'dB',
					decision: 'Estimated continuous SPL at distance (free-field, on-axis). Peak is labeled only in the AES drawer.',
					extras: extras,
					copy,
				},
			};
		},
	});

	syncModeUi();
}
