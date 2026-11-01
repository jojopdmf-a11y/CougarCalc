import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export const AUDIO_TOOL_PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
	'70v-tap': lazy(() => import('./pages/audio-live-sound/70v-tap/index.tsx')),
	'cardioid-sub-array': lazy(() => import('./pages/audio-live-sound/cardioid-sub-array/index.tsx')),
	'gain-staging-dbu-dbfs': lazy(() => import('./pages/audio-live-sound/gain-staging-dbu-dbfs/index.tsx')),
	'max-spl': lazy(() => import('./pages/audio-live-sound/max-spl/index.tsx')),
	'noise-dose': lazy(() => import('./pages/audio-live-sound/noise-dose/index.tsx')),
	'phantom-power-budget': lazy(() => import('./pages/audio-live-sound/phantom-power-budget/index.tsx')),
	'show-latency': lazy(() => import('./pages/audio-live-sound/show-latency/index.tsx')),
	'speaker-cable-loss': lazy(() => import('./pages/audio-live-sound/speaker-cable-loss/index.tsx')),
	'speaker-delay': lazy(() => import('./pages/audio-live-sound/speaker-delay/index.tsx')),
	'speaker-impedance': lazy(() => import('./pages/audio-live-sound/speaker-impedance/index.tsx')),
	'sub-main-crossover-delay': lazy(() => import('./pages/audio-live-sound/sub-main-crossover-delay/index.tsx')),
	'wireless-antenna-spacing': lazy(() => import('./pages/audio-live-sound/wireless-antenna-spacing/index.tsx')),
}
