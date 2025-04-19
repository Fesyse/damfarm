"use client"

import { Position, Rotation } from "../types"

interface FenceProps {
  position: Position
  rotation: Rotation
  length: number
}

export function Fence({ position, rotation, length }: FenceProps) {
  const posts = Math.floor(length / 4)
  const fencePosts = []

  for (let i = 0; i < posts; i++) {
    const offset = i * 4 - length / 2 + 2
    fencePosts.push(
      <group key={i} position={[offset, 0, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.4, 8]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[4, 0.1, 0.05]} />
          <meshStandardMaterial color='#A0522D' />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[4, 0.1, 0.05]} />
          <meshStandardMaterial color='#A0522D' />
        </mesh>
      </group>
    )
  }

  return (
    <group position={position} rotation={rotation}>
      {fencePosts}
    </group>
  )
}
