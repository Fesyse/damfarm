"use client"

import { useMemo } from "react"
import { Position, Rotation } from "../types"

interface MountainsProps {
  position: Position
  rotation?: Rotation
}

export function Mountains({
  position,
  rotation = [0, 0, 0] as Rotation,
}: MountainsProps) {
  const mountainPositions = useMemo(() => {
    return Array(10)
      .fill(null)
      .map(() => ({
        x: -40 + Math.random() * 80,
        z: -10 + Math.random() * 13,
        scale: 3 + Math.random() * 10,
        height: 10 + Math.random() * 20,
      }))
  }, [])

  return (
    <group position={position} rotation={rotation}>
      {mountainPositions.map((mountain, i) => (
        <mesh
          key={i}
          position={[mountain.x, mountain.height / 2, mountain.z]}
          castShadow
        >
          <coneGeometry args={[mountain.scale, mountain.height, 8]} />
          <meshStandardMaterial color='#607D8B' />
        </mesh>
      ))}
    </group>
  )
}
