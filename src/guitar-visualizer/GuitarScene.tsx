import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { GuitarModel } from './GuitarModel'
import type { ConfigState, LoadStats } from './types'

type GuitarSceneProps = {
  config: ConfigState
  highlightBody: boolean
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
  onStats: (stats: Partial<LoadStats>) => void
  onProgress: (pct: number) => void
  onCreated: () => void
  startedAt: number | null
}

function PerfProbe({ onStats }: { onStats: (s: Partial<LoadStats>) => void }) {
  const frames = useRef(0)
  const last = useRef(0)

  useFrame(() => {
    if (last.current === 0) last.current = performance.now()
    frames.current += 1
    const now = performance.now()
    if (now - last.current >= 1000) {
      const fps = Math.round((frames.current * 1000) / (now - last.current))
      frames.current = 0
      last.current = now
      const perfWithMemory = performance as Performance & {
        memory?: { usedJSHeapSize: number }
      }
      const memoryMb = perfWithMemory.memory
        ? Math.round(perfWithMemory.memory.usedJSHeapSize / (1024 * 1024))
        : null
      onStats({ fps, memoryMb })
    }
  })

  return null
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 7, 4]} intensity={1.35} castShadow />
      <directionalLight position={[-4, 3, -1]} intensity={0.45} />
      <directionalLight position={[0, 2, -5]} intensity={0.25} />
    </>
  )
}

function ReadyReporter({
  startedAt,
  onStats,
  onProgress,
  config,
  highlightBody,
}: {
  startedAt: number
  onStats: (s: Partial<LoadStats>) => void
  onProgress: (pct: number) => void
  config: ConfigState
  highlightBody: boolean
}) {
  const ready = useRef(false)

  const handleReady = useCallback(() => {
    if (ready.current) return
    ready.current = true
    const readyAt = performance.now()
    onProgress(100)
    onStats({
      readyAt,
      loadMs: Math.round(readyAt - startedAt),
      startedAt,
    })
  }, [onProgress, onStats, startedAt])

  useEffect(() => {
    // Staged progress only until the model reports ready — never overwrite 100%.
    if (ready.current) return
    let cancelled = false
    const steps = [15, 40, 70, 90]
    const timers = steps.map((pct, i) =>
      window.setTimeout(() => {
        if (!cancelled && !ready.current) onProgress(pct)
      }, 40 + i * 60),
    )
    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [onProgress])

  // Config swaps are instant; keep progress at ready without re-blocking the UI.
  useEffect(() => {
    if (ready.current) onProgress(100)
  }, [config, onProgress])

  return <GuitarModel config={config} onReady={handleReady} highlightBody={highlightBody} />
}

export function GuitarScene({
  config,
  highlightBody,
  controlsRef,
  onStats,
  onProgress,
  onCreated,
  startedAt,
}: GuitarSceneProps) {
  return (
    <Canvas
      className="gv-canvas"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [3.8, 3.0, 2.2], fov: 34, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={onCreated}
    >
      <color attach="background" args={['#070B12']} />
      <SceneLights />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0.4]} receiveShadow>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#0A121C" roughness={1} metalness={0} />
      </mesh>
      <Suspense fallback={null}>
        {startedAt != null && (
          <ReadyReporter
            startedAt={startedAt}
            onStats={onStats}
            onProgress={onProgress}
            config={config}
            highlightBody={highlightBody}
          />
        )}
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.4}
        maxDistance={9}
        target={[0, 0.1, 0.95]}
      />
      <PerfProbe onStats={onStats} />
    </Canvas>
  )
}
