/**
 * Cardioid sub pair: λ/4 spacing (NOT λ/2).
 * Rear sub delayed by travel time of the spacing and polarity inverted.
 * Air c = Sengpiel 331.3 + 0.6×T_C (same line as speaker-delay).
 * Never a branded preset replacement.
 */

import { temperatureToCelsius, type TemperatureUnit } from './units.ts';
import { fail, type CalcFailure, type FieldError } from './types.ts';
import { formatFixed, formatMeters, formatMs } from './format.ts';

export function speedOfSoundSengpiel(tempC: number): number {
	return 331.3 + 0.6 * tempC;
}

export type CardioidSubInput = {
	frequencyHz: number;
	temperature: number;
	temperatureUnit: TemperatureUnit;
};

export type CardioidSubSuccess = {
	ok: true;
	c_m_s: number;
	lambda_m: number;
	spacing_m: number;
	rearDelayMs: number;
	rearPolarity: 'inverted';
};

export type CardioidSubResult = CardioidSubSuccess | CalcFailure;

export function computeCardioidSub(input: CardioidSubInput): CardioidSubResult {
	const errors: FieldError[] = [];
	if (!Number.isFinite(input.frequencyHz) || input.frequencyHz <= 0) {
		errors.push({ field: 'frequencyHz', message: 'Frequency must be greater than zero.' });
	}
	if (!Number.isFinite(input.temperature)) {
		errors.push({ field: 'temperature', message: 'Temperature must be a finite number.' });
	}
	if (errors.length) return fail(errors);

	const tempC = temperatureToCelsius(input.temperature, input.temperatureUnit);
	const c = speedOfSoundSengpiel(tempC);
	const lambda_m = c / input.frequencyHz;
	const spacing_m = lambda_m / 4;
	const rearDelayMs = (1000 * spacing_m) / c;
	return {
		ok: true,
		c_m_s: c,
		lambda_m,
		spacing_m,
		rearDelayMs,
		rearPolarity: 'inverted',
	};
}

export function formatCardioidCopy(result: CardioidSubSuccess): string {
	return `λ/4 spacing ${formatMeters(result.spacing_m)} m at ${formatFixed(result.lambda_m, 3)} m wavelength. Rear delay ${formatMs(result.rearDelayMs)} ms, polarity inverted. Not a manufacturer preset.`;
}
