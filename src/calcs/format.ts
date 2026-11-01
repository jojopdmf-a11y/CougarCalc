/**
 * Display-only rounding. Calculation modules never call these for math.
 */

import { metersToLength } from './units.ts';

export function formatFixed(value: number, digits: number): string {
	if (!Number.isFinite(value)) {
		return '—';
	}
	return value.toFixed(digits);
}

export function formatSpeed(metersPerSecond: number): string {
	return formatFixed(metersPerSecond, 3);
}

export function formatMeters(m: number): string {
	return formatFixed(m, 3);
}

export function formatSamples(samples: number): string {
	return formatFixed(samples, 2);
}

export function formatDb(value: number): string {
	return formatFixed(value, 1);
}

export function formatMs(value: number): string {
	return formatFixed(value, 1);
}

export function formatInches(value: number): string {
	return formatFixed(value, 3);
}

export function formatMm(value: number): string {
	return formatFixed(value, 2);
}

export function formatOhms(value: number): string {
	return formatFixed(value, 2);
}

/** Metres plus feet for tools that take a length. */
export function formatDualLength(meters: number): string {
	return `${formatMeters(meters)} m (${formatFixed(metersToLength(meters, 'ft'), 2)} ft)`;
}

export function formatLbf(value: number): string {
	return formatFixed(value, 1);
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
