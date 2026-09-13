/**
 * Display-only rounding. Calculation modules never call these.
 */

export function formatFixed(value: number, digits: number): string {
	if (!Number.isFinite(value)) {
		return '—';
	}
	return value.toFixed(digits);
}

export function formatDelayMs(ms: number): string {
	return formatFixed(ms, 3);
}

export function formatSpeed(metersPerSecond: number): string {
	return formatFixed(metersPerSecond, 3);
}

export function formatMeters(m: number): string {
	return formatFixed(m, 3);
}

export function formatFeet(ft: number): string {
	return formatFixed(ft, 3);
}

export function formatInches(inches: number): string {
	return formatFixed(inches, 4);
}

export function formatMm(mm: number): string {
	return formatFixed(mm, 2);
}

export function formatSamples(samples: number): string {
	return formatFixed(samples, 2);
}

export function formatScale(value: number, unit: 'in' | 'mm'): string {
	return unit === 'in' ? formatInches(value) : formatMm(value);
}

export function unitLabel(unit: 'm' | 'ft' | 'in' | 'mm' | 'C' | 'F'): string {
	switch (unit) {
		case 'm':
			return 'm';
		case 'ft':
			return 'ft';
		case 'in':
			return 'in';
		case 'mm':
			return 'mm';
		case 'C':
			return '°C';
		case 'F':
			return '°F';
	}
}
