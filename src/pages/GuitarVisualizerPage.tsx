import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { ConfigPanel } from '../guitar-visualizer/ConfigPanel'
import { GuitarScene } from '../guitar-visualizer/GuitarScene'
import { resetView } from '../guitar-visualizer/resetView'
import {
  DEFAULT_CONFIG,
  statusLine,
  type ConfigState,
  type LoadStats,
} from '../guitar-visualizer/types'
import '../guitar-visualizer/visualizer.css'

type SectionId =
  | 'instrument'
  | 'body'
  | 'hand'
  | 'finish'
  | 'hardware'
  | 'pickups'
  | 'neck'
  | 'inlays'
  | 'extras'

export function GuitarVisualizerPage() {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG)
  const [openSection, setOpenSection] = useState<SectionId | null>('body')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showTip, setShowTip] = useState(true)
  const [highlightBody, setHighlightBody] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [stats, setStats] = useState<LoadStats>({
    startedAt: 0,
    readyAt: null,
    loadMs: null,
    fps: null,
    memoryMb: null,
  })
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const highlightTimer = useRef<number | null>(null)

  const onChange = useCallback((patch: Partial<ConfigState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch }
      if (next.highlightChanges && patch.bodyShape && patch.bodyShape !== prev.bodyShape) {
        setHighlightBody(true)
        if (highlightTimer.current != null) window.clearTimeout(highlightTimer.current)
        highlightTimer.current = window.setTimeout(() => setHighlightBody(false), 900)
      }
      return next
    })
  }, [])

  const onStats = useCallback((partial: Partial<LoadStats>) => {
    setStats((prev) => ({ ...prev, ...partial }))
  }, [])

  const onSceneCreated = useCallback(() => {
    const now = performance.now()
    setStartedAt((prev) => prev ?? now)
    setProgress(10)
  }, [])

  const checklist = useMemo(
    () => [
      `Instrument: electric ${config.instrument === 'guitar' ? '6-string' : '4-string'}`,
      `Body: ${
        config.bodyShape === 'double-cut'
          ? 'Double-cut / Strat-style'
          : config.bodyShape === 'single-cut'
            ? 'Single-cut'
            : 'Offset'
      }`,
      `Neck: bolt-on · 6-inline headstock`,
      `Hand: ${config.handedness}-handed`,
      `Finish: ${config.bodyFinish}`,
      `Hardware: ${config.hardware}`,
      `Pickups: ${config.pickupLayout}`,
    ],
    [config],
  )

  return (
    <section className="gv-page">
      <div className="gv-top">
        <div>
          <p className="gv-eyebrow">
            <Link to="/guitar-building">Guitar building</Link> / Visualizer spike
          </p>
          <h1 className="gv-title">3D electric guitar visualizer</h1>
          <p className="gv-status" aria-live="polite">
            {statusLine(config)}
          </p>
        </div>
        <div className="gv-perf" aria-label="Performance probe">
          <span>{progress < 100 ? `Loading ${progress}%` : 'Ready'}</span>
          {stats.loadMs != null && <span>Load {stats.loadMs} ms</span>}
          {stats.fps != null && <span>{stats.fps} FPS</span>}
          {stats.memoryMb != null && stats.memoryMb > 0 && <span>~{stats.memoryMb} MB</span>}
        </div>
      </div>

      <div className="gv-layout">
        <ConfigPanel
          config={config}
          onChange={onChange}
          openSection={openSection}
          onToggleSection={(id) => setOpenSection((cur) => (cur === id ? null : id))}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          checklist={checklist}
        />

        <div className="gv-viewport">
          {progress < 100 && (
            <div className="gv-progress" role="status" aria-live="polite">
              <div className="gv-progress-bar" style={{ width: `${progress}%` }} />
              <span>Loading parts… {progress}%</span>
            </div>
          )}

          <div className="gv-legend">
            <strong>Controls</strong>
            <span>Drag = rotate</span>
            <span>Scroll = zoom</span>
            <span>Ctrl/Cmd + drag = pan</span>
          </div>

          {showTip && (
            <button type="button" className="gv-tip" onClick={() => setShowTip(false)}>
              Drag to rotate
            </button>
          )}

          <button
            type="button"
            className="gv-reset"
            onClick={() => resetView(controlsRef.current)}
          >
            Reset view
          </button>

          <GuitarScene
            config={config}
            highlightBody={highlightBody && config.highlightChanges}
            controlsRef={controlsRef}
            onStats={onStats}
            onProgress={setProgress}
            onCreated={onSceneCreated}
            startedAt={startedAt}
          />
        </div>
      </div>
    </section>
  )
}
