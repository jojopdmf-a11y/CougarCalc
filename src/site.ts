/** Last editorial review date for prototype copy and formulas. */
export const LAST_REVIEWED = '2026-08-31';
export const LAST_REVIEWED_LABEL = '2026-08-31 PST';

export const SITE_NAME = 'CougarCalc';

export const PHASE_LABEL = 'Phase 2 prototype';

export const HOME_LEDE =
	'Calculators for live-sound techs and guitar builders. Type what you measured. Get a number you can check.';

export const DELAY_TITLE = 'Speaker delay / time-alignment';

export const DELAY_LEDE =
	'How many milliseconds to put on the closer (earlier) path so both arrivals meet at one seat, and which channel to delay.';

export const DELAY_CATEGORY_ONELINER =
	'Milliseconds on the closer (earlier) path so both arrivals meet at one seat.';

export const DELAY_SAFETY =
	'Geometric delay is valid at one seat. Haas extra is signal- and level-dependent, not a physical constant. Verify with an impulse response (or a known measurement method) before the show. This is not Smaart and not a manufacturer preset.';

export const MAX_SPL_TITLE =
	'Max SPL — sensitivity, power, box count, and throw — peak vs continuous labeled.';

export const MAX_SPL_LEDE =
	'Sensitivity plus 10 log10 of continuous watts, a distance law, and N-box summing. Crown watts-for-target is the inverse with headroom you type. Peak vs continuous stay labeled.';

export const MAX_SPL_SAFETY =
	'Not a hearing-dose calculator. Not a MAPP or ArrayCalc prediction. Free-field, on-axis. Peak vs continuous are labeled separately. Optional indoor +6 dB is a Crown-article note, never a silent default. Manufacturer limiter presets win over the starting estimate in the limiter drawer.';

export const GAIN_STAGING_TITLE = 'Gain staging: dBu / dBFS — Analog voltage vs 0 dBFS mapping for the console or interface.';

export const GAIN_STAGING_LEDE =
	'Analog voltage versus the 0 dBFS mapping you confirm in the manual. +4 vs −10 is 11.78 dB. Wrong mapping clips converters or amp inputs.';

export const GAIN_STAGING_SAFETY =
	'Wrong FS mapping clips converters or amp inputs (a +24 dBu line into a +18 dBu amp is the Biamp-class example). Presets are published examples — confirm in the manual. Digital trim cannot unclip an analog HA clip. No invented DiGiCo/Avid or global AES-17 volt.';

export const FRET_IRREVERSIBLE =
	'Theoretical 12-TET locations, not finished intonation. Verify the 12th fret equals half the scale (S/2) before you saw. Sawing is irreversible.';

export const FOOTER_LINES = [
	'CougarCalc is a toolbox for live-sound techs and guitar builders.',
	"Working name. Public name not approved. Not Luthier's Lowdown. Not Load Brief.",
	'Last reviewed 2026-08-31 PST. Sources on each tool page.',
] as const;
