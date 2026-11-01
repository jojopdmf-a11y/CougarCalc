import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import audio_70v_tap from '../pages/audio-live-sound/70v-tap/index.tsx'
import audio_cardioid_sub_array from '../pages/audio-live-sound/cardioid-sub-array/index.tsx'
import audio_gain_staging_dbu_dbfs from '../pages/audio-live-sound/gain-staging-dbu-dbfs/index.tsx'
import audio_max_spl from '../pages/audio-live-sound/max-spl/index.tsx'
import audio_noise_dose from '../pages/audio-live-sound/noise-dose/index.tsx'
import audio_phantom_power_budget from '../pages/audio-live-sound/phantom-power-budget/index.tsx'
import audio_show_latency from '../pages/audio-live-sound/show-latency/index.tsx'
import audio_speaker_cable_loss from '../pages/audio-live-sound/speaker-cable-loss/index.tsx'
import audio_speaker_delay from '../pages/audio-live-sound/speaker-delay/index.tsx'
import audio_speaker_impedance from '../pages/audio-live-sound/speaker-impedance/index.tsx'
import audio_sub_main_crossover_delay from '../pages/audio-live-sound/sub-main-crossover-delay/index.tsx'
import audio_wireless_antenna_spacing from '../pages/audio-live-sound/wireless-antenna-spacing/index.tsx'
import guitar_action_worksheet from '../pages/guitar-building/action-worksheet/index.tsx'
import guitar_bridge_placement from '../pages/guitar-building/bridge-placement/index.tsx'
import guitar_fret_position_calculator from '../pages/guitar-building/fret-position-calculator/index.tsx'
import guitar_fretboard_radius_sagitta from '../pages/guitar-building/fretboard-radius-sagitta/index.tsx'
import guitar_neck_taper_width from '../pages/guitar-building/neck-taper-width/index.tsx'
import guitar_nut_height_first_fret from '../pages/guitar-building/nut-height-first-fret/index.tsx'
import guitar_nut_spacing_slot_width from '../pages/guitar-building/nut-spacing-slot-width/index.tsx'
import guitar_pickup_pole_spacing from '../pages/guitar-building/pickup-pole-spacing/index.tsx'
import guitar_saddle_compensation from '../pages/guitar-building/saddle-compensation/index.tsx'
import guitar_scale_length_compare from '../pages/guitar-building/scale-length-compare/index.tsx'
import guitar_string_set_tension from '../pages/guitar-building/string-set-tension/index.tsx'
import guitar_string_tension_calculator from '../pages/guitar-building/string-tension-calculator/index.tsx'

const pages = [
	['audio/70v-tap', audio_70v_tap],
	['audio/cardioid-sub-array', audio_cardioid_sub_array],
	['audio/gain-staging-dbu-dbfs', audio_gain_staging_dbu_dbfs],
	['audio/max-spl', audio_max_spl],
	['audio/noise-dose', audio_noise_dose],
	['audio/phantom-power-budget', audio_phantom_power_budget],
	['audio/show-latency', audio_show_latency],
	['audio/speaker-cable-loss', audio_speaker_cable_loss],
	['audio/speaker-delay', audio_speaker_delay],
	['audio/speaker-impedance', audio_speaker_impedance],
	['audio/sub-main-crossover-delay', audio_sub_main_crossover_delay],
	['audio/wireless-antenna-spacing', audio_wireless_antenna_spacing],
	['guitar/action-worksheet', guitar_action_worksheet],
	['guitar/bridge-placement', guitar_bridge_placement],
	['guitar/fret-position-calculator', guitar_fret_position_calculator],
	['guitar/fretboard-radius-sagitta', guitar_fretboard_radius_sagitta],
	['guitar/neck-taper-width', guitar_neck_taper_width],
	['guitar/nut-height-first-fret', guitar_nut_height_first_fret],
	['guitar/nut-spacing-slot-width', guitar_nut_spacing_slot_width],
	['guitar/pickup-pole-spacing', guitar_pickup_pole_spacing],
	['guitar/saddle-compensation', guitar_saddle_compensation],
	['guitar/scale-length-compare', guitar_scale_length_compare],
	['guitar/string-set-tension', guitar_string_set_tension],
	['guitar/string-tension-calculator', guitar_string_tension_calculator],
] as const

const order = [
  'What the result means',
  'Formula / method',
  'Worked example',
  'Assumptions and limitations',
  'Practical notes',
  'FAQs',
  'Related tools',
  'Sources',
  'Disclaimer',
]

describe('ported tool pages', () => {
  it('keeps the 14-section order and a visible safety warning', () => {
    for (const [id, Page] of pages) {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <Page />
        </MemoryRouter>,
      )
      expect(html, id).toContain('<h1')
      expect(html.includes('safety-warn') || html.includes('safety-irreversible'), id).toBe(true)
      let at = 0
      for (const heading of order) {
        const next = html.indexOf(heading, at)
        expect(next, id + ' ' + heading).toBeGreaterThan(at)
        at = next
      }
      const safetyCount = html.split('safety-warn').length + html.split('safety-irreversible').length - 2
      expect(safetyCount, id).toBeGreaterThanOrEqual(2)
    }
  })
})
