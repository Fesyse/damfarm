"use client"

import { Position } from "../types"

interface MailboxProps {
  position?: Position
}

export function Mailbox({ position = [0, 0, 0] as Position }: MailboxProps) {
  return (
    <group position={position}>
      {/* Base pole */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1, 0.2]} />
        <meshStandardMaterial color='#A0522D' />
      </mesh>

      {/* Mail box */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.5]} />
        <meshStandardMaterial color='#CD5C5C' />
      </mesh>

      {/* Top */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>

      {/* Mail flag */}
      <mesh position={[0.4, 1.2, 0]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color='#B22222' />
      </mesh>
      <mesh position={[0.5, 1.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial color='#B22222' />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.1, 0.26]} rotation-x={0} castShadow>
        <boxGeometry args={[0.65, 0.45, 0.05]} />
        <meshStandardMaterial color='#A0522D' />
      </mesh>

      {/* Handle */}
      <mesh position={[0.2, 1.1, 0.3]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' />
      </mesh>
    </group>
  )
}
