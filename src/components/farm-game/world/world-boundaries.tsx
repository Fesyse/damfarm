"use client"

import { Fence } from "./fence"
import { Mountains } from "./mountains"

export function WorldBoundaries() {
  return (
    <group>
      {/* Fences */}
      <Fence position={[0, 0, -40]} rotation={[0, 0, 0]} length={80} />
      <Fence position={[0, 0, 40]} rotation={[0, 0, 0]} length={80} />
      <Fence
        position={[-40, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={80}
      />
      <Fence position={[40, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={80} />

      {/* Mountains in the distance */}
      <Mountains position={[0, 0, -50]} />
      <Mountains position={[25, 0, -50]} rotation={[0, Math.PI, 0]} />
      <Mountains position={[75, 0, 0]} rotation={[0, Math.PI, 0]} />
      <Mountains position={[-40, 0, 50]} rotation={[0, Math.PI, 0]} />
      <Mountains position={[-50, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Mountains position={[50, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  )
}
