"use client"

import { Fence } from "./fence"
import { Mountains } from "./mountains"

export function WorldBoundaries() {
  return (
    <group>
      {/* Fences - keep them at the farm boundaries */}
      <Fence position={[0, 0, -40]} rotation={[0, 0, 0]} length={80} />
      <Fence position={[0, 0, 40]} rotation={[0, 0, 0]} length={80} />
      <Fence
        position={[-40, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        length={80}
      />
      <Fence position={[40, 0, 0]} rotation={[0, Math.PI / 2, 0]} length={80} />

      {/* Mountains positioned OUTSIDE the fences */}

      {/* Northern mountains (beyond negative Z fence) */}
      <Mountains position={[0, 0, -45]} />

      {/* Eastern mountains (beyond positive X fence) */}
      <Mountains position={[45, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Southern mountains (beyond positive Z fence) */}
      <Mountains position={[0, 0, 45]} rotation={[0, Math.PI, 0]} />

      {/* Western mountains (beyond negative X fence) */}
      <Mountains position={[-45, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Corners - positioned outside fence intersections */}
      <Mountains position={[45, 0, -45]} rotation={[0, -Math.PI / 4, 0]} />
      <Mountains position={[-45, 0, -45]} rotation={[0, Math.PI / 4, 0]} />
      <Mountains position={[45, 0, 45]} rotation={[0, (-Math.PI * 3) / 4, 0]} />
      <Mountains position={[-45, 0, 45]} rotation={[0, (Math.PI * 3) / 4, 0]} />
    </group>
  )
}
