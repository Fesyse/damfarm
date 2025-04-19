"use client"

import { Position, InteractionPoint } from "../types"
import { Buildings } from "../buildings/buildings"
import { Terrain } from "./terrain"
import { Ground } from "./ground"
import { WorldBoundaries } from "./world-boundaries"

interface GameWorldProps {
  setNearInteraction: (point: InteractionPoint | null) => void
  playerPosition: Position
}

export function GameWorld({
  setNearInteraction,
  playerPosition,
}: GameWorldProps) {
  return (
    <group>
      <Terrain />
      <Buildings
        setNearInteraction={setNearInteraction}
        playerPosition={playerPosition}
      />
      <Ground />
      <WorldBoundaries />
    </group>
  )
}
