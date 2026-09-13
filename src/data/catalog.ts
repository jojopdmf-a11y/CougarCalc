/**
 * Tool catalog. Only two calculators are built. Unbuilt tools stay on the
 * category page so related-tool lists never 404.
 */

import { DELAY_CATEGORY_ONELINER, DELAY_TITLE } from './toolCopy.ts'

export type ToolEntry = {
  slug: string
  title: string
  summary: string
  category: 'audio-live-sound' | 'guitar-building'
  built: boolean
  href: string
}

export const AUDIO_CATEGORY = {
  href: '/audio-live-sound',
  title: 'Audio / live sound',
  summary: 'Time, level, and coverage helpers for techs aligning a system to a seat or a zone.',
} as const

export const GUITAR_CATEGORY = {
  href: '/guitar-building',
  title: 'Guitar building',
  summary: 'Layout numbers for scale length, frets, and related shop geometry.',
} as const

export const AUDIO_TOOLS: ToolEntry[] = [
  {
    slug: 'speaker-delay',
    title: DELAY_TITLE,
    summary: DELAY_CATEGORY_ONELINER,
    category: 'audio-live-sound',
    built: true,
    href: '/audio-live-sound/speaker-delay',
  },
  {
    slug: 'speed-of-sound',
    title: 'Speed of sound',
    summary: 'Air speed from temperature, with the same linear formula used here.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'wavelength-period',
    title: 'Wavelength and period',
    summary: 'λ = c / f and period from frequency, for array and sub spacing.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'spl-vs-distance',
    title: 'SPL vs distance',
    summary: 'Inverse-square estimate between two distances. Not a prediction of a room.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'combining-sources',
    title: 'Combining incoherent sources',
    summary: 'dB sum for uncorrelated sources. Coherent summing is a different problem.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'delay-fill-coverage',
    title: 'Delay-fill coverage distance',
    summary: 'Rough throw vs. seating depth so you know where a fill is even useful.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'sub-alignment',
    title: 'Subwoofer time / polarity',
    summary: 'Arrival and polarity notes for mains-to-subs at a reference. Not a mag-opt optimizer.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'array-hang',
    title: 'Line-array hang geometry',
    summary: 'Frame height, site angle, and splay bookkeeping. Not a prediction of coverage.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'speaker-splay',
    title: 'Speaker splay angle',
    summary: 'Included angle from cabinet included-coverage figures. Check the manufacturer’s data.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'rt60-estimate',
    title: 'RT60 room estimate',
    summary: 'Sabine/Eyring sketch from volume and absorption. A measurement beats this.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'cable-vs-acoustic-delay',
    title: 'Cable vs acoustic delay',
    summary: 'Copper/fiber latency compared with air path. Analog copper is usually negligible.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
  {
    slug: 'front-fill-path',
    title: 'Front-fill vs main path',
    summary: 'Same two-path delay job as speaker delay, framed for downstage fills.',
    category: 'audio-live-sound',
    built: false,
    href: AUDIO_CATEGORY.href,
  },
]

export const GUITAR_TOOLS: ToolEntry[] = [
  {
    slug: 'fret-position-calculator',
    title: 'Fret position calculator',
    summary: 'Nut-to-fret distances for any scale length in 12-TET.',
    category: 'guitar-building',
    built: true,
    href: '/guitar-building/fret-position-calculator',
  },
  {
    slug: 'nut-slot-spacing',
    title: 'Nut slot spacing',
    summary: 'String spacing at the nut from E-to-E and count. Not a nut-file guide.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'bridge-compensation',
    title: 'Bridge saddle compensation',
    summary: 'Starting offsets from scale and string. Intonation still happens on the finished guitar.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'scale-length-converter',
    title: 'Scale length converter',
    summary: 'Inches and millimetres with 1 in = 25.4 mm. Conversion, not a maker spec.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'fretboard-radius',
    title: 'Fretboard radius / fret end',
    summary: 'Compound-radius bookmarks and fret-end fall-off. Not a CNC program.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'action-relief-geometry',
    title: 'Action and relief geometry',
    summary: 'String height vs. relief as layout numbers. Not truss-rod engineering.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'afterlength-harmonic',
    title: 'String afterlength / harmonic node',
    summary: 'Bridge-to-tailpiece length vs. harmonic nodes. Tone claims not included.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'pickup-position',
    title: 'Pickup position',
    summary: 'Distance from nut/bridge as a fraction of scale. Matches harmonic nodes, not “tone”.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'binding-length',
    title: 'Binding length',
    summary: 'Perimeter estimate from a template. Measure the actual rim before you cut plastic.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'headstock-tuner-spacing',
    title: 'Headstock tuner spacing',
    summary: 'Post centers for 3+3 and 6-in-line. Check the tuner drawing, not a forum default.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'compensated-nut',
    title: 'Compensated nut offset',
    summary: 'Starting shelf offsets. Still a first-fret intonation problem, not a finished nut.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
  {
    slug: 'fret-marker-inlay',
    title: 'Fret marker / inlay positions',
    summary: 'Dot centers from adjacent-fret midpoints. Confirm on the board before routing.',
    category: 'guitar-building',
    built: false,
    href: GUITAR_CATEGORY.href,
  },
]
