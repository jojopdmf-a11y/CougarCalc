import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { bodyShapeFor, createSixInlineHeadstockShape, extrudeFaceUp } from './shapes'
import type { ConfigState, PickupKind } from './types'
import { FINISH_COLORS, HARDWARE_COLORS, pickupSlots } from './types'

type GuitarModelProps = {
  config: ConfigState
  onReady: () => void
  highlightBody: boolean
}

/**
 * Shape-set 1: double-cut / Strat-style body + bolt-on neck + 6-inline headstock.
 * Socket names stay GLB-ready (see docs/guitar-visualizer-go-nogo.md).
 */
export function GuitarModel({ config, onReady, highlightBody }: GuitarModelProps) {
  const group = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    onReady()
  }, [onReady])

  const finish = FINISH_COLORS[config.bodyFinish]
  const hardware = HARDWARE_COLORS[config.hardware]
  const slots = useMemo(() => pickupSlots(config.pickupLayout), [config.pickupLayout])
  const stringCount = config.instrument === 'bass' ? 4 : 6

  const mirror = config.handedness === 'left' ? -1 : 1

  return (
    <group ref={group} scale={[mirror, 1, 1]} position={[0, 0, 0]}>
      <BodyMesh shape={config.bodyShape} color={finish} highlight={highlightBody} />
      <NeckAssembly hardware={hardware} stringCount={stringCount} />
      <BridgeMesh hardware={hardware} stringCount={stringCount} />
      <PickupBank slots={slots} hardware={hardware} />
      <ControlsMesh hardware={hardware} />
      <StringSet count={stringCount} />
    </group>
  )
}

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
  const geo = useMemo(() => {
    const g = extrudeFaceUp(bodyShapeFor(shape), 0.17, true)
    return g
  }, [shape])

  return (
    <mesh geometry={geo} position={[0, 0, 0]} castShadow receiveShadow name="part-body">
      <meshStandardMaterial
        color={color}
        roughness={0.42}
        metalness={0.12}
        emissive={emissiveFor(highlight)}
        emissiveIntensity={highlight ? 0.35 : 0}
      />
    </mesh>
  )
}

/** Heel socket → neck shaft → nut → 6-inline headstock + tuners. */
function NeckAssembly({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  const neckLen = 1.42
  const heelZ = 0.78
  const shaftCenterZ = heelZ + neckLen / 2
  const nutZ = heelZ + neckLen
  const headZ = nutZ + 0.02

  const headGeo = useMemo(() => {
    const g = extrudeFaceUp(createSixInlineHeadstockShape(), 0.055, true)
    // Shape origin is at the nut edge; after center() the joint is mid-paddle — shift so nut sits at local z=0.
    g.computeBoundingBox()
    const box = g.boundingBox!
    const zMin = box.min.z
    g.translate(0, 0, -zMin)
    return g
  }, [])

  return (
    <group name="socket-heel" position={[0, 0.02, 0]}>
      {/* Heel block into body */}
      <mesh castShadow position={[0, 0.04, heelZ - 0.02]} name="part-heel">
        <boxGeometry args={[0.26, 0.11, 0.16]} />
        <meshStandardMaterial color="#4A3224" roughness={0.62} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.02, heelZ - 0.02]}>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
        <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Tapered neck shaft (wider at heel) */}
      <mesh castShadow position={[0, 0.055, shaftCenterZ]} name="part-neck">
        <boxGeometry args={[0.2, 0.075, neckLen]} />
        <meshStandardMaterial color="#5C3D28" roughness={0.68} metalness={0.04} />
      </mesh>

      {/* Rounded neck back cue */}
      <mesh castShadow position={[0, 0.02, shaftCenterZ]} rotation={[Math.PI / 2, 0, Math.PI]}>
        <cylinderGeometry args={[0.036, 0.03, neckLen * 0.98, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5C3D28" roughness={0.7} metalness={0.04} />
      </mesh>

      {/* Fretboard */}
      <mesh castShadow position={[0, 0.1, shaftCenterZ]}>
        <boxGeometry args={[0.185, 0.018, neckLen]} />
        <meshStandardMaterial color="#1A100C" roughness={0.5} metalness={0.05} />
      </mesh>

      <Frets count={21} startZ={heelZ + 0.06} endZ={nutZ - 0.04} />

      {/* Nut */}
      <mesh castShadow position={[0, 0.112, nutZ]} name="part-nut">
        <boxGeometry args={[0.19, 0.012, 0.018]} />
        <meshStandardMaterial color="#E8E0D4" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* 6-inline headstock */}
      <group name="socket-headstock-joint" position={[0, 0.07, headZ]}>
        <mesh geometry={headGeo} castShadow receiveShadow name="part-headstock">
          <meshStandardMaterial color="#5C3D28" roughness={0.62} metalness={0.05} />
        </mesh>
        <TunerRow hardware={hardware} stringCount={stringCount} />
      </group>
    </group>
  )
}

function Frets({ count, startZ, endZ }: { count: number; startZ: number; endZ: number }) {
  const frets = useMemo(() => {
    const items: number[] = []
    // Approximate even visual spacing (not scale-accurate) for silhouette read.
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / (count + 1)
      items.push(startZ + (endZ - startZ) * t)
    }
    return items
  }, [count, startZ, endZ])

  return (
    <group name="part-frets">
      {frets.map((z, i) => (
        <mesh key={i} position={[0, 0.11, z]} castShadow>
          <boxGeometry args={[0.18, 0.004, 0.006]} />
          <meshStandardMaterial color="#B8B8B8" metalness={0.75} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function TunerRow({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  // Bass-side inline posts along the paddle edge; simple button + post.
  const tuners = useMemo(() => {
    return Array.from({ length: stringCount }, (_, i) => {
      const t = stringCount === 1 ? 0.5 : i / (stringCount - 1)
      return {
        x: -0.12,
        z: 0.08 + t * 0.38,
        y: 0.04,
      }
    })
  }, [stringCount])

  return (
    <group name="socket-tuner-row">
      {tuners.map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.05, 10]} />
            <meshStandardMaterial color={hardware} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.032, 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.014, 12]} />
            <meshStandardMaterial color={hardware} metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[-0.032, 0.028, 0]} castShadow>
            <boxGeometry args={[0.012, 0.028, 0.008]} />
            <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function BridgeMesh({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  const saddles = Array.from({ length: stringCount }, (_, i) => i)
  return (
    <group name="socket-bridge-mount" position={[0, 0.1, -0.62]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.035, 0.12]} />
        <meshStandardMaterial color={hardware} metalness={0.88} roughness={0.22} />
      </mesh>
      {saddles.map((i) => {
        const x = (i - (stringCount - 1) / 2) * 0.042
        return (
          <mesh key={i} position={[x, 0.03, 0.01]} castShadow>
            <boxGeometry args={[0.028, 0.022, 0.05]} />
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
  const d = kind === 'humbucker' ? 0.14 : 0.075
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[w, 0.045, d]} />
      <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.45} />
      <mesh position={[0, 0.028, 0]}>
        <boxGeometry args={[w * 0.85, 0.01, d * 0.65]} />
        <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
      </mesh>
    </mesh>
  )
}

function PickupBank({ slots, hardware }: { slots: PickupKind[]; hardware: string }) {
  const slotZ = {
    neck: 0.28,
    middle: -0.02,
    bridge: -0.34,
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
  // Strat-style control cluster on the treble lower bout.
  return (
    <group position={[0.32, 0.1, -0.28]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.02 * (i % 2), 0.03, -i * 0.1]} castShadow>
          <cylinderGeometry args={[0.032, 0.032, 0.045, 14]} />
          <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[-0.1, 0.03, 0.16]} castShadow>
        <boxGeometry args={[0.035, 0.035, 0.07]} />
        <meshStandardMaterial color={hardware} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

function StringSet({ count }: { count: number }) {
  const strings = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const x = (i - (count - 1) / 2) * 0.028
      const radius = 0.0018 + (count - 1 - i) * 0.00035
      return { x, radius }
    })
  }, [count])

  // Bridge saddles ≈ z -0.62, nut ≈ z 2.2
  const z0 = -0.58
  const z1 = 2.18
  const midZ = (z0 + z1) / 2
  const len = z1 - z0

  return (
    <group name="part-strings">
      {strings.map((s, i) => (
        <mesh key={i} position={[s.x, 0.118, midZ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[s.radius, s.radius, len, 6]} />
          <meshStandardMaterial color="#C8C8C8" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
    </group>
  )
}
