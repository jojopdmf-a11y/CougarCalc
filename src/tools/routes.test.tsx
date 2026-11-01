// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App.tsx'

let root: Root | null = null

afterEach(() => {
  act(() => {
    root?.unmount()
  })
  root = null
  document.body.innerHTML = ''
  window.history.pushState({}, '', '/')
})

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  const el = document.createElement('div')
  document.body.appendChild(el)
  root = createRoot(el)
  act(() => {
    root?.render(<App />)
  })
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30))
  })
}

describe('existing routes stay mounted beside the calculators', () => {
  it('keeps home, apps, buy, and the guitar visualizer', async () => {
    renderAt('/')
    expect(document.body.textContent).toContain('Podcast stems')

    root?.unmount()
    document.body.innerHTML = ''
    renderAt('/apps')
    expect(document.body.textContent).toContain('Podcast Stripper')

    root?.unmount()
    document.body.innerHTML = ''
    renderAt('/buy')
    expect(document.body.textContent).toContain('Buy apps')

    root?.unmount()
    document.body.innerHTML = ''
    renderAt('/guitar-building/visualizer')
    await settle()
    expect(document.body.textContent).not.toContain('Coming soon')
    expect(document.body.textContent).toMatch(/3D electric guitar visualizer|Loading viewer/)
  })

  it('serves the audio hub, a live tool with a trailing slash, and coming soon for unknown slugs', async () => {
    renderAt('/audio-live-sound')
    await settle()
    expect(window.location.pathname).toBe('/audio-live-sound/')
    expect(document.body.textContent).toContain('12 / 12 tools')

    root?.unmount()
    document.body.innerHTML = ''
    renderAt('/audio-live-sound/speaker-delay')
    await settle()
    expect(window.location.pathname).toBe('/audio-live-sound/speaker-delay/')
    expect(document.body.textContent).toContain('Speaker delay / time-alignment')
    expect(document.body.textContent).toContain('Geometric delay is valid at one seat.')

    root?.unmount()
    document.body.innerHTML = ''
    renderAt('/guitar-building/not-a-calculator')
    await settle()
    expect(document.body.textContent).toContain('Coming soon')
  })
})
