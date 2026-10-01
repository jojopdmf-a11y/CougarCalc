import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ConfigState, PickupKind } from './types'
import { FINISH_COLORS, HARDWARE_COLORS, pickupSlots } from './types'

const S_STYLE_GLB = '/guitar-visualizer/s-style.glb'
const T_STYLE_GLB = '/guitar-visualizer/t-style.glb'
/** Longest-axis size that roughly matches the procedural spike guitar. */
const IMPORTED_TARGET_LENGTH = 2.2

type GuitarModelProps = {
  config: ConfigState
  onReady: () => void
  highlightBody: boolean
}

function importedGlbUrl(shape: ConfigState['bodyShape']): string | null {
  if (shape === 'double-cut') return S_STYLE_GLB
  if (shape === 'single-cut') return T_STYLE_GLB
  return null
}

/**
 * Procedural placeholder parts (GLB-ready sockets).
 * Naming scheme: part-{family}-{variant}.glb — see docs/guitar-visualizer-go-nogo.md
 * S-Style / T-Style use imported GLB previews; procedural body/neck/hardware stay hidden for those.
 */
export function GuitarModel({ config, onReady, highlightBody }: GuitarModelProps) {
  const group = useRef<THREE.Group>(null)
  const glbUrl = importedGlbUrl(config.bodyShape)

  useLayoutEffect(() => {
    if (!glbUrl) onReady()
  }, [onReady, glbUrl])

  const finish = FINISH_COLORS[config.bodyFinish]
  const hardware = HARDWARE_COLORS[config.hardware]
  const slots = useMemo(() => pickupSlots(config.pickupLayout), [config.pickupLayout])

  // Spike: lefty is disabled in UI; keep scale flip ready for later.
  const mirror = config.handedness === 'left' ? -1 : 1

  return (
    <group ref={group} scale={[mirror, 1, 1]} position={[0, 0, 0]}>
      {glbUrl ? (
        <ImportedGlbModel
          url={glbUrl}
          name={config.bodyShape === 'double-cut' ? 'part-s-style-glb' : 'part-t-style-glb'}
          onReady={onReady}
          highlight={highlightBody}
        />
      ) : (
        <>
          <BodyMesh shape={config.bodyShape} color={finish} highlight={highlightBody} />
          <NeckMesh hardware={hardware} />
          <HeadstockMesh hardware={hardware} stringCount={6} />
          <BridgeMesh hardware={hardware} stringCount={6} />
          <PickupBank slots={slots} hardware={hardware} />
          <ControlsMesh hardware={hardware} />
        </>
      )}
    </group>
  )
}

/** Imported guitar GLB — hide procedural parts so we can eye-test the mesh alone. */
function ImportedGlbModel({
  url,
  name,
  onReady,
  highlight,
}: {
  url: string
  name: string
  onReady: () => void
  highlight: boolean
}) {
  const { scene } = useGLTF(url)

  const fitted = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const wrapper = new THREE.Group()
    wrapper.name = name
    clone.position.set(-center.x, -center.y, -center.z)
    wrapper.add(clone)
    const longest = Math.max(size.x, size.y, size.z) || 1
    wrapper.scale.setScalar(IMPORTED_TARGET_LENGTH / longest)
    // Sit the mesh on the floor so the body is not buried under the ground plane.
    wrapper.updateMatrixWorld(true)
    const fittedBox = new THREE.Box3().setFromObject(wrapper)
    wrapper.position.y -= fittedBox.min.y
    return wrapper
  }, [scene, name])

  useLayoutEffect(() => {
    fitted.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial
        if (!std || typeof std !== 'object') continue
        if ('emissive' in std && std.emissive) {
          std.emissive.set(highlight ? '#00D8FF' : '#000000')
          std.emissiveIntensity = highlight ? 0.35 : 0
        }
      }
    })
  }, [fitted, highlight])

  useLayoutEffect(() => {
    onReady()
  }, [onReady, fitted])

  return <primitive object={fitted} />
}

useGLTF.preload(S_STYLE_GLB)
useGLTF.preload(T_STYLE_GLB)

function emissiveFor(highlight: boolean) {
  return highlight ? '#00D8FF' : '#000000'
}

function BodyMesh({
  shape,
  color,
  highlight,
}: {
  shape: ConfigState['bodyShape']
  color: string
  highlight: boolean
}) {
  const geo = useMemo(() => bodyGeometry(shape), [shape])
  return (
    <mesh geometry={geo} position={[0, 0, 0]} castShadow receiveShadow name="part-body">
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        metalness={0.15}
        emissive={emissiveFor(highlight)}
        emissiveIntensity={highlight ? 0.35 : 0}
      />
    </mesh>
  )
}

function bodyGeometry(shape: ConfigState['bodyShape']): THREE.BufferGeometry {
  const shape2d = new THREE.Shape()

  if (shape === 'single-cut') {
    // Asymmetric single-cut silhouette (generic)
    shape2d.moveTo(-0.55, -0.95)
    shape2d.bezierCurveTo(-0.85, -0.7, -0.9, -0.1, -0.7, 0.35)
    shape2d.bezierCurveTo(-0.55, 0.75, -0.15, 0.95, 0.15, 0.85)
    shape2d.bezierCurveTo(0.55, 0.7, 0.75, 0.25, 0.7, -0.15)
    shape2d.bezierCurveTo(0.65, -0.55, 0.35, -0.95, -0.05, -1.05)
    shape2d.bezierCurveTo(-0.25, -1.1, -0.4, -1.05, -0.55, -0.95)
  } else if (shape === 'double-cut') {
    shape2d.moveTo(-0.45, -1.0)
    shape2d.bezierCurveTo(-0.8, -0.75, -0.85, -0.2, -0.65, 0.25)
    shape2d.bezierCurveTo(-0.85, 0.55, -0.55, 0.95, -0.1, 0.9)
    shape2d.bezierCurveTo(0.35, 0.95, 0.75, 0.55, 0.55, 0.2)
    shape2d.bezierCurveTo(0.8, -0.15, 0.75, -0.7, 0.4, -0.95)
    shape2d.bezierCurveTo(0.1, -1.1, -0.15, -1.1, -0.45, -1.0)
  } else {
    // offset
    shape2d.moveTo(-0.35, -1.05)
    shape2d.bezierCurveTo(-0.75, -0.85, -0.95, -0.25, -0.7, 0.2)
    shape2d.bezierCurveTo(-0.9, 0.55, -0.5, 0.95, 0.05, 0.85)
    shape2d.bezierCurveTo(0.55, 0.75, 0.85, 0.35, 0.75, -0.1)
    shape2d.bezierCurveTo(0.9, -0.45, 0.55, -0.95, 0.1, -1.05)
    shape2d.bezierCurveTo(-0.1, -1.12, -0.2, -1.1, -0.35, -1.05)
  }

  const geo = new THREE.ExtrudeGeometry(shape2d, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelSegments: 2,
    curveSegments: 16,
  })
  geo.center()
  geo.rotateX(-Math.PI / 2)
  return geo
}

function NeckMesh({ hardware }: { hardware: string }) {
  // Heel socket attachment — neck butts into body at heel
  return (
    <group name="socket-heel" position={[0, 0.05, 0.85]}>
      <mesh castShadow position={[0, 0.04, 0.55]}>
        <boxGeometry args={[0.22, 0.08, 1.35]} />
        <meshStandardMaterial color="#3E2A1E" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* fretboard */}
      <mesh castShadow position={[0, 0.09, 0.55]}>
        <boxGeometry args={[0.2, 0.02, 1.32]} />
        <meshStandardMaterial color="#1A1210" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* heel block */}
      <mesh castShadow position={[0, 0.02, -0.05]} name="part-heel">
        <boxGeometry args={[0.28, 0.12, 0.18]} />
        <meshStandardMaterial color="#3E2A1E" roughness={0.65} />
      </mesh>
      {/* tiny hardware plate */}
      <mesh position={[0, -0.02, -0.02]}>
        <boxGeometry args={[0.16, 0.02, 0.12]} />
        <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  )
}

function HeadstockMesh({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  const tuners = Array.from({ length: stringCount }, (_, i) => i)
  return (
    <group name="socket-headstock-joint" position={[0, 0.08, 2.05]}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.05, 0.42]} />
        <meshStandardMaterial color="#3E2A1E" roughness={0.65} />
      </mesh>
      <group name="socket-tuner-row">
        {tuners.map((i) => {
          const y = ((i - (stringCount - 1) / 2) * 0.035)
          return (
            <mesh key={i} position={[-0.16, 0.04 + y * 0.2, 0.12 - i * 0.05]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.06, 10]} />
              <meshStandardMaterial color={hardware} metalness={0.9} roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function BridgeMesh({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  const saddles = Array.from({ length: stringCount }, (_, i) => i)
  return (
    <group name="socket-bridge-mount" position={[0, 0.1, -0.55]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.04, 0.14]} />
        <meshStandardMaterial color={hardware} metalness={0.88} roughness={0.22} />
      </mesh>
      {saddles.map((i) => {
        const x = (i - (stringCount - 1) / 2) * 0.045
        return (
          <mesh key={i} position={[x, 0.035, 0]} castShadow>
            <boxGeometry args={[0.03, 0.03, 0.06]} />
            <meshStandardMaterial color={hardware} metalness={0.9} roughness={0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

function PickupMesh({
  kind,
  position,
  hardware,
}: {
  kind: PickupKind
  position: [number, number, number]
  hardware: string
}) {
  const w = kind === 'humbucker' ? 0.28 : 0.22
  const d = kind === 'humbucker' ? 0.14 : 0.08
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[w, 0.05, d]} />
      <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.45} />
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[w * 0.85, 0.01, d * 0.7]} />
        <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
      </mesh>
    </mesh>
  )
}

function PickupBank({ slots, hardware }: { slots: PickupKind[]; hardware: string }) {
  // Snap to fixed body slots; unused slots omitted.
  const slotZ = {
    neck: 0.25,
    middle: -0.05,
    bridge: -0.32,
  } as const

  let positions: Array<{ kind: PickupKind; z: number; name: string }> = []
  if (slots.length === 2) {
    positions = [
      { kind: slots[0]!, z: slotZ.neck, name: 'socket-pickup-neck' },
      { kind: slots[1]!, z: slotZ.bridge, name: 'socket-pickup-bridge' },
    ]
  } else {
    positions = [
      { kind: slots[0]!, z: slotZ.neck, name: 'socket-pickup-neck' },
      { kind: slots[1]!, z: slotZ.middle, name: 'socket-pickup-middle' },
      { kind: slots[2]!, z: slotZ.bridge, name: 'socket-pickup-bridge' },
    ]
  }

  return (
    <group>
      {positions.map((p) => (
        <group key={p.name} name={p.name}>
          <PickupMesh kind={p.kind} position={[0, 0.1, p.z]} hardware={hardware} />
        </group>
      ))}
    </group>
  )
}

function ControlsMesh({ hardware }: { hardware: string }) {
  return (
    <group position={[0.28, 0.1, -0.2]}>
      {[0, 1].map((i) => (
        <mesh key={i} position={[0, 0.03, -i * 0.12]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.05, 12]} />
          <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[-0.08, 0.03, 0.14]} castShadow>
        <boxGeometry args={[0.04, 0.04, 0.08]} />
        <meshStandardMaterial color={hardware} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}
