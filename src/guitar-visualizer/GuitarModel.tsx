import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  BODY_TOP_Y,
  bodyShapeFor,
  createSixInlineHeadstockShape,
  extrudeFaceUp,
  STRAT_POCKET_FLOOR_Y,
} from './shapes'
import type { ConfigState, PickupKind } from './types'
import { FINISH_COLORS, HARDWARE_COLORS, pickupSlots } from './types'

type GuitarModelProps = {
  config: ConfigState
  onReady: () => void
  highlightBody: boolean
}

/**
 * Strat silhouette redo: traced double-cut body + bolt-on neck + 6-inline paddle.
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
  const geo = useMemo(() => extrudeFaceUp(bodyShapeFor(shape), BODY_TOP_Y, true), [shape])

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
  // 25.5" scale ≈ 1.63 scene units; heel butts at traced pocket floor.
  const neckLen = 1.52
  const heelZ = STRAT_POCKET_FLOOR_Y
  const shaftCenterZ = heelZ + neckLen / 2
  const nutZ = heelZ + neckLen
  const headZ = nutZ + 0.008
  const boardY = BODY_TOP_Y + 0.01

  const headGeo = useMemo(() => {
    const g = extrudeFaceUp(createSixInlineHeadstockShape(), 0.048, true)
    g.computeBoundingBox()
    const box = g.boundingBox!
    g.translate(0, -box.min.y, -box.min.z)
    return g
  }, [])

  return (
    <group name="socket-heel" position={[0, 0, 0]}>
      {/* Heel block into body pocket */}
      <mesh castShadow position={[0, BODY_TOP_Y * 0.45, heelZ + 0.02]} name="part-heel">
        <boxGeometry args={[0.22, BODY_TOP_Y * 0.85, 0.12]} />
        <meshStandardMaterial color="#4A3224" roughness={0.62} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.015, heelZ + 0.02]}>
        <boxGeometry args={[0.13, 0.018, 0.09]} />
        <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Neck shaft — slight taper toward nut */}
      <mesh castShadow position={[0, boardY - 0.04, shaftCenterZ]} name="part-neck">
        <boxGeometry args={[0.185, 0.065, neckLen]} />
        <meshStandardMaterial color="#5C3D28" roughness={0.68} metalness={0.04} />
      </mesh>

      {/* Rounded neck back */}
      <mesh
        castShadow
        position={[0, boardY - 0.072, shaftCenterZ]}
        rotation={[Math.PI / 2, 0, Math.PI]}
      >
        <cylinderGeometry args={[0.032, 0.026, neckLen * 0.98, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5C3D28" roughness={0.7} metalness={0.04} />
      </mesh>

      {/* Fretboard */}
      <mesh castShadow position={[0, boardY, shaftCenterZ]}>
        <boxGeometry args={[0.172, 0.015, neckLen]} />
        <meshStandardMaterial color="#1A100C" roughness={0.5} metalness={0.05} />
      </mesh>

      <Frets count={21} startZ={heelZ + 0.1} endZ={nutZ - 0.04} y={boardY + 0.009} />

      {/* Nut */}
      <mesh castShadow position={[0, boardY + 0.011, nutZ]} name="part-nut">
        <boxGeometry args={[0.174, 0.011, 0.014]} />
        <meshStandardMaterial color="#E8E0D4" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* 6-inline headstock */}
      <group name="socket-headstock-joint" position={[0, boardY - 0.028, headZ]}>
        <mesh geometry={headGeo} castShadow receiveShadow name="part-headstock">
          <meshStandardMaterial color="#5C3D28" roughness={0.62} metalness={0.05} />
        </mesh>
        <TunerRow hardware={hardware} stringCount={stringCount} />
      </group>
    </group>
  )
}

function Frets({
  count,
  startZ,
  endZ,
  y,
}: {
  count: number
  startZ: number
  endZ: number
  y: number
}) {
  const frets = useMemo(() => {
    const items: number[] = []
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / (count + 1)
      items.push(startZ + (endZ - startZ) * t)
    }
    return items
  }, [count, startZ, endZ])

  return (
    <group name="part-frets">
      {frets.map((z, i) => (
        <mesh key={i} position={[0, y, z]} castShadow>
          <boxGeometry args={[0.17, 0.003, 0.005]} />
          <meshStandardMaterial color="#B8B8B8" metalness={0.75} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function TunerRow({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  const tuners = useMemo(() => {
    return Array.from({ length: stringCount }, (_, i) => {
      const t = stringCount === 1 ? 0.5 : i / (stringCount - 1)
      // Space along the longer paddle; slight bass-side inset follows scallops.
      return {
        x: -0.132 - t * 0.012,
        z: 0.09 + t * 0.52,
        y: 0.052,
      }
    })
  }, [stringCount])

  return (
    <group name="socket-tuner-row">
      {tuners.map((t, i) => (
        <group key={i} position={[t.x, t.y, t.z]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.045, 10]} />
            <meshStandardMaterial color={hardware} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.028, 0.008, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.011, 12]} />
            <meshStandardMaterial color={hardware} metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[-0.028, 0.024, 0]} castShadow>
            <boxGeometry args={[0.01, 0.024, 0.006]} />
            <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function BridgeMesh({ hardware, stringCount }: { hardware: string; stringCount: number }) {
  const saddles = Array.from({ length: stringCount }, (_, i) => i)
  const y = BODY_TOP_Y + 0.02
  return (
    <group name="socket-bridge-mount" position={[0, y, -0.72]}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.03, 0.11]} />
        <meshStandardMaterial color={hardware} metalness={0.88} roughness={0.22} />
      </mesh>
      {saddles.map((i) => {
        const x = (i - (stringCount - 1) / 2) * 0.04
        return (
          <mesh key={i} position={[x, 0.025, 0.01]} castShadow>
            <boxGeometry args={[0.026, 0.02, 0.045]} />
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
  const d = kind === 'humbucker' ? 0.13 : 0.07
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[w, 0.04, d]} />
      <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.45} />
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[w * 0.85, 0.01, d * 0.65]} />
        <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
      </mesh>
    </mesh>
  )
}

function PickupBank({ slots, hardware }: { slots: PickupKind[]; hardware: string }) {
  const slotZ = {
    neck: 0.32,
    middle: 0.02,
    bridge: -0.32,
  } as const
  const y = BODY_TOP_Y + 0.025

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
          <PickupMesh kind={p.kind} position={[0, y, p.z]} hardware={hardware} />
        </group>
      ))}
    </group>
  )
}

function ControlsMesh({ hardware }: { hardware: string }) {
  const y = BODY_TOP_Y + 0.025
  return (
    <group position={[0.38, y, -0.35]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.015 * (i % 2), 0.025, -i * 0.1]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 14]} />
          <meshStandardMaterial color={hardware} metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[-0.1, 0.025, 0.16]} castShadow>
        <boxGeometry args={[0.032, 0.032, 0.065]} />
        <meshStandardMaterial color={hardware} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

function StringSet({ count }: { count: number }) {
  const strings = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const x = (i - (count - 1) / 2) * 0.026
      const radius = 0.0016 + (count - 1 - i) * 0.0003
      return { x, radius }
    })
  }, [count])

  const z0 = -0.7
  const z1 = STRAT_POCKET_FLOOR_Y + 1.52 + 0.7
  const midZ = (z0 + z1) / 2
  const len = z1 - z0
  const y = BODY_TOP_Y + 0.042

  return (
    <group name="part-strings">
      {strings.map((s, i) => (
        <mesh key={i} position={[s.x, y, midZ]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[s.radius, s.radius, len, 6]} />
          <meshStandardMaterial color="#C8C8C8" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}
    </group>
  )
}
