import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export const GUITAR_TOOL_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
	'action-worksheet': lazy(() => import('./pages/guitar-building/action-worksheet/index.tsx')),
	'bridge-placement': lazy(() => import('./pages/guitar-building/bridge-placement/index.tsx')),
	'fret-position-calculator': lazy(() => import('./pages/guitar-building/fret-position-calculator/index.tsx')),
	'fretboard-radius-sagitta': lazy(() => import('./pages/guitar-building/fretboard-radius-sagitta/index.tsx')),
	'neck-taper-width': lazy(() => import('./pages/guitar-building/neck-taper-width/index.tsx')),
	'nut-height-first-fret': lazy(() => import('./pages/guitar-building/nut-height-first-fret/index.tsx')),
	'nut-spacing-slot-width': lazy(() => import('./pages/guitar-building/nut-spacing-slot-width/index.tsx')),
	'pickup-pole-spacing': lazy(() => import('./pages/guitar-building/pickup-pole-spacing/index.tsx')),
	'saddle-compensation': lazy(() => import('./pages/guitar-building/saddle-compensation/index.tsx')),
	'scale-length-compare': lazy(() => import('./pages/guitar-building/scale-length-compare/index.tsx')),
	'string-set-tension': lazy(() => import('./pages/guitar-building/string-set-tension/index.tsx')),
	'string-tension-calculator': lazy(() => import('./pages/guitar-building/string-tension-calculator/index.tsx')),
}
