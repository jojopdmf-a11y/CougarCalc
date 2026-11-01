/** International inch. Conversion constant, not a maker spec. */
export const MM_PER_INCH = 25.4;

/** International foot: 0.3048 m exactly. */
export const METERS_PER_FOOT = 0.3048;

export const METERS_PER_INCH = MM_PER_INCH / 1000;

export type LengthUnit = 'm' | 'ft' | 'in' | 'mm';

export type TemperatureUnit = 'C' | 'F';

export function lengthToMeters(value: number, unit: LengthUnit): number {
	switch (unit) {
		case 'm':
			return value;
		case 'ft':
			return value * METERS_PER_FOOT;
		case 'in':
			return value * METERS_PER_INCH;
		case 'mm':
			return value / 1000;
	}
}

export function metersToLength(meters: number, unit: LengthUnit): number {
	switch (unit) {
		case 'm':
			return meters;
		case 'ft':
			return meters / METERS_PER_FOOT;
		case 'in':
			return meters / METERS_PER_INCH;
		case 'mm':
			return meters * 1000;
	}
}

export function temperatureToCelsius(value: number, unit: TemperatureUnit): number {
	if (unit === 'C') {
		return value;
	}
	return ((value - 32) * 5) / 9;
}

export function inchesToMm(inches: number): number {
	return inches * MM_PER_INCH;
}

export function mmToInches(mm: number): number {
	return mm / MM_PER_INCH;
}

export function convertScale(value: number, from: 'in' | 'mm', to: 'in' | 'mm'): number {
	if (from === to) {
		return value;
	}
	return from === 'in' ? inchesToMm(value) : mmToInches(value);
}
