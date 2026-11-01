// @vitest-environment jsdom
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { formatMs, formatSpeed } from '../calcs/format.ts'
import { computeFretPositions, formatScaleDisplay } from '../calcs/fret-position.ts'
import { computeSpeakerDelay, formatDelayMsDisplay } from '../calcs/speaker-delay.ts'
import { computeSubMainDelay } from '../calcs/sub-main-delay.ts'
import FretPage from '../pages/guitar-building/fret-position-calculator/index.tsx'
import DelayPage from '../pages/audio-live-sound/speaker-delay/index.tsx'
import SubPage from '../pages/audio-live-sound/sub-main-crossover-delay/index.tsx'

let root: Root | null = null

afterEach(() => {
  act(() => {
    root?.unmount()
  })
  root = null
  document.body.innerHTML = ''
})

function mount(node: ReactNode): HTMLDivElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  root = createRoot(el)
  act(() => {
    root?.render(<MemoryRouter initialEntries={['/tool/']}>{node}</MemoryRouter>)
  })
  return el
}

function typeInto(el: HTMLDivElement, selector: string, value: string) {
  const input = el.querySelector<HTMLInputElement>(selector)
  if (!input) throw new Error(`missing ${selector}`)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('calculator forms call the locked modules', () => {
  it('speaker delay keeps Sengpiel 331.3 + 0.6T', () => {
    const el = mount(<DelayPage />)
    typeInto(el, '#path-a', '30')
    typeInto(el, '#path-b', '20')
    const result = computeSpeakerDelay({
      pathA: 30,
      pathB: 20,
      lengthUnit: 'm',
      temperature: 20,
      temperatureUnit: 'C',
      haasMs: 0,
      sampleRate: 48000,
    })
    if (!result.ok) throw new Error('speaker delay example failed')
    expect(el.querySelector('[data-delay-ms]')?.textContent).toContain(formatDelayMsDisplay(result.t_set))
    expect(el.querySelector('[data-decision]')?.textContent).toContain('Delay path B')
    const cText = el.querySelector('[data-c-value]')?.textContent ?? ''
    expect(cText).toContain(formatSpeed(result.c_m_s))
    expect(cText).toContain('331.3 + 0.6')
    expect(cText).not.toContain('0.606')
  })

  it('sub / main keeps its own 331.3 + 0.606T line', () => {
    const el = mount(<SubPage />)
    typeInto(el, '#path-sub', '30')
    typeInto(el, '#path-main', '20')
    const result = computeSubMainDelay({
      pathSub: 30,
      pathMain: 20,
      lengthUnit: 'm',
      temperature: 20,
      temperatureUnit: 'C',
      filterDelayMs: null,
      crossoverHz: null,
    })
    if (!result.ok) throw new Error('sub-main example failed')
    const delay = computeSpeakerDelay({
      pathA: 30,
      pathB: 20,
      lengthUnit: 'm',
      temperature: 20,
      temperatureUnit: 'C',
      haasMs: 0,
      sampleRate: 48000,
    })
    if (!delay.ok) throw new Error('delay example failed')
    expect(formatSpeed(result.c_m_s)).not.toBe(formatSpeed(delay.c_m_s))
    const card = el.querySelector('.result-card')?.textContent ?? ''
    expect(card).toContain(formatMs(result.t_set))
    expect(card).toContain('0.606')
    expect(card).toContain(formatSpeed(result.c_m_s))
  })

  it('fret position shows d(12) from the locked fret module', () => {
    const el = mount(<FretPage />)
    typeInto(el, '#scale-length', '25.5')
    const result = computeFretPositions({ scale: 25.5, scaleUnit: 'in', fretCount: 22 })
    if (!result.ok) throw new Error('fret example failed')
    expect(el.querySelector('[data-twelfth]')?.textContent).toContain(
      formatScaleDisplay(result.twelfthFret, 'in'),
    )
    expect(el.querySelector('.safety-irreversible')?.textContent).toContain('Sawing is irreversible')
  })
})
