/**
 * Tool catalog for CougarCalc Phase 2.
 * Audio hub: all twelve tools live. Related-tool lists only link live pages.
 */

import { DELAY_CATEGORY_ONELINER, DELAY_TITLE, GAIN_STAGING_TITLE, MAX_SPL_TITLE } from '../site.ts';

export type ToolEntry = {
	slug: string;
	title: string;
	summary: string;
	category: 'audio-live-sound' | 'guitar-building';
	built: boolean;
	href: string;
};

export const AUDIO_CATEGORY = {
	href: '/audio-live-sound/',
	title: 'Audio / live sound',
	summary: 'Time, level, and coverage helpers for techs aligning a system to a seat or a zone.',
} as const;

export const GUITAR_CATEGORY = {
	href: '/guitar-building/',
	title: 'Guitar building',
	summary: 'Layout numbers for scale length, frets, and related shop geometry.',
} as const;

export const AUDIO_TOOLS: ToolEntry[] = [
	{
		slug: 'speaker-delay',
		title: DELAY_TITLE,
		summary: DELAY_CATEGORY_ONELINER,
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/speaker-delay/',
	},
	{
		slug: 'max-spl',
		title: MAX_SPL_TITLE,
		summary: 'Sensitivity, power, box count, and throw. Peak vs continuous labeled. Not a room prediction.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/max-spl/',
	},
	{
		slug: 'gain-staging-dbu-dbfs',
		title: GAIN_STAGING_TITLE,
		summary: 'Analog voltage vs 0 dBFS mapping you confirm in the manual. +4 vs −10 is 11.78 dB.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/gain-staging-dbu-dbfs/',
	},
	{
		slug: 'wireless-antenna-spacing',
		title: 'Wireless antenna spacing',
		summary: 'RF wavelength and ¼λ diversity spacing. Coax loss only at a cited α.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/wireless-antenna-spacing/',
	},
	{
		slug: 'speaker-cable-loss',
		title: 'Speaker cable loss',
		summary: 'Speaker-level copper loop resistance, voltage ratio, and damping factor. Not 70 V. Not NEC.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/speaker-cable-loss/',
	},
	{
		slug: 'phantom-power-budget',
		title: 'Phantom power budget',
		summary: 'Sum of milliamps times count. Empty supply budget stays empty.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/phantom-power-budget/',
	},
	{
		slug: 'show-latency',
		title: 'Show latency',
		summary: 'Series stage times, samples-to-ms, optional air path. Dante hops are table rows, not a law.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/show-latency/',
	},
	{
		slug: 'speaker-impedance',
		title: 'Speaker impedance',
		summary: 'Series, parallel, and bridged Z_ch = Z_load/2. Ohm’s law at speakON. No mains.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/speaker-impedance/',
	},
	{
		slug: 'cardioid-sub-array',
		title: 'Cardioid sub array',
		summary: 'λ/4 spacing and rear-sub delay/polarity. Not a branded preset.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/cardioid-sub-array/',
	},
	{
		slug: '70v-tap',
		title: '70 V tap / distributed load',
		summary: 'BGM, paging, and under-balcony taps only. Fire-alarm standards are refused.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/70v-tap/',
	},
	{
		slug: 'noise-dose',
		title: 'Noise dose (educational)',
		summary: 'NIOSH and OSHA dose from dBA and time. Not a dosimeter. Not compliance.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/noise-dose/',
	},
	{
		slug: 'sub-main-crossover-delay',
		title: 'Sub / main crossover delay',
		summary: 'Geometric path difference plus an optional filter-delay note. Delay the earlier path. Not SubAligner.',
		category: 'audio-live-sound',
		built: true,
		href: '/audio-live-sound/sub-main-crossover-delay/',
	},
];

export const GUITAR_TOOLS: ToolEntry[] = [
	{
		slug: 'fret-position-calculator',
		title: 'Fret position calculator',
		summary: 'Nut-to-fret distances for any scale length in 12-TET.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/fret-position-calculator/',
	},
	{
		slug: 'string-tension-calculator',
		title: 'String tension',
		summary: 'T from archived D’Addario Item# or a user-cited UW. Fail closed if UW is missing. No max-safe T.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/string-tension-calculator/',
	},
	{
		slug: 'nut-spacing-slot-width',
		title: 'Nut spacing / slot width',
		summary: 'Equal remaining gap between string edges. Centers from half-gauges plus gaps.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/nut-spacing-slot-width/',
	},
	{
		slug: 'action-worksheet',
		title: 'Action worksheet',
		summary: 'Named-fret string height starting ranges. Not a spec. No closed-form saddle height.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/action-worksheet/',
	},
	{
		slug: 'pickup-pole-spacing',
		title: 'Pickup pole spacing',
		summary: 'Duncan 1.930 in / 2.070 in. Bridge E-to-E over 2 in suggests Trembucker.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/pickup-pole-spacing/',
	},
	{
		slug: 'bridge-placement',
		title: 'Bridge placement',
		summary: 'Break ≈ S. Speaking length ≈ S + compensation along the string path.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/bridge-placement/',
	},
	{
		slug: 'scale-length-compare',
		title: 'Scale length compare',
		summary: 'Cited published lengths only. S_actual = 2 × nut-to-12th. 25.500 in ≠ 650 mm.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/scale-length-compare/',
	},
	{
		slug: 'saddle-compensation',
		title: 'Saddle compensation',
		summary: 'Mottola n = 12 + e/100 and displacement d. Elmendorp is not used.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/saddle-compensation/',
	},
	{
		slug: 'string-set-tension',
		title: 'String-set tension',
		summary: 'Per-string T from archived Item# or user-cited UW; total is the sum. Never a neck-safe badge.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/string-set-tension/',
	},
	{
		slug: 'nut-height-first-fret',
		title: 'Nut height / first-fret action',
		summary: 'Measurement aid. Method required. Not a filing procedure. No merged shop window.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/nut-height-first-fret/',
	},
	{
		slug: 'fretboard-radius-sagitta',
		title: 'Fretboard radius / sagitta',
		summary: 's = r − √(r² − (l/2)²) and the inverse. Warmoth pairs are not invented here.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/fretboard-radius-sagitta/',
	},
	{
		slug: 'neck-taper-width',
		title: 'Neck taper / width',
		summary: 'Linear interpolation between two measured stations. Fender 1st/12th table is depth.',
		category: 'guitar-building',
		built: true,
		href: '/guitar-building/neck-taper-width/',
	},
];

export function builtAudioTools(): ToolEntry[] {
	return AUDIO_TOOLS.filter((t) => t.built);
}

export function builtGuitarTools(): ToolEntry[] {
	return GUITAR_TOOLS.filter((t) => t.built);
}

export function relatedAudio(currentSlug: string): ToolEntry[] {
	return AUDIO_TOOLS.filter((t) => t.built && t.slug !== currentSlug);
}

export function relatedGuitar(currentSlug: string): ToolEntry[] {
	return GUITAR_TOOLS.filter((t) => t.built && t.slug !== currentSlug);
}

export const AUDIO_HUB_ENTRY: ToolEntry = {
	slug: 'audio-live-sound',
	title: AUDIO_CATEGORY.title,
	summary: AUDIO_CATEGORY.summary,
	category: 'audio-live-sound',
	built: true,
	href: AUDIO_CATEGORY.href,
};

export const GUITAR_HUB_ENTRY: ToolEntry = {
	slug: 'guitar-building',
	title: GUITAR_CATEGORY.title,
	summary: GUITAR_CATEGORY.summary,
	category: 'guitar-building',
	built: true,
	href: GUITAR_CATEGORY.href,
};

/** Live sibling audio tools plus hubs and fret position. No stub 404s. */
export function relatedAudioPage(slug: string): ToolEntry[] {
	return [...relatedAudio(slug), AUDIO_HUB_ENTRY, GUITAR_HUB_ENTRY, GUITAR_TOOLS[0]];
}

/** Live sibling guitar tools plus live audio tools and hubs. No stub 404s. */
export function relatedGuitarPage(slug: string): ToolEntry[] {
	return [...relatedGuitar(slug), AUDIO_HUB_ENTRY, ...builtAudioTools()];
}

export const AUDIO_RELATED_INTRO =
	'All twelve audio tools are live in this category. Fret position is live under Guitar building.';

export function liveCount(tools: ToolEntry[]): { live: number; total: number } {
	return { live: tools.filter((t) => t.built).length, total: tools.length };
}

/** Pathnames that may appear in sitemap.xml. Stubs are excluded. */
export function liveSitemapPathnames(): string[] {
	return [
		'/',
		'/about/',
		'/privacy/',
		'/methodology/',
		AUDIO_CATEGORY.href,
		GUITAR_CATEGORY.href,
		...AUDIO_TOOLS.filter((t) => t.built).map((t) => t.href),
		...GUITAR_TOOLS.filter((t) => t.built).map((t) => t.href),
	];
}
