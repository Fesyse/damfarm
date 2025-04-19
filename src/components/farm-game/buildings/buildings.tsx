"use client"

import { useEffect, useCallback } from "react"
import { Billboard, Text } from "@react-three/drei"
import { Position, InteractionPoint } from "../types"
import { INTERACTION_POINTS } from "../constants"
import { Greenhouse } from "./greenhouse"
import { Kiosk } from "./kiosk"
import { House } from "./house"
import { StockExchange } from "./stock-exchange"
import { Mailbox } from "./mailbox"
import { Barn } from "./barn"
import { FishingPond } from "../world/fishing-pond"

interface BuildingsProps {
  setNearInteraction: (point: InteractionPoint | null) => void
  playerPosition: Position
}

export function Buildings({
  setNearInteraction,
  playerPosition,
}: BuildingsProps) {
  // Use useCallback for finding the closest interaction point
  const findClosestInteraction = useCallback(
    (playerPos: Position): InteractionPoint | null => {
      let closestPoint: InteractionPoint | null = null
      let minDistance = 5

      INTERACTION_POINTS.forEach(point => {
        const dx = point.position[0] - playerPos[0]
        const dz = point.position[2] - playerPos[2]
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance < minDistance) {
          minDistance = distance
          closestPoint = point
        }
      })

      return closestPoint
    },
    []
  )

  // Update interaction detection with requestAnimationFrame instead of setInterval
  useEffect(() => {
    let animationFrameId: number

    const updateInteraction = () => {
      const closestPoint = findClosestInteraction(playerPosition)
      setNearInteraction(closestPoint)
      animationFrameId = requestAnimationFrame(updateInteraction)
    }

    animationFrameId = requestAnimationFrame(updateInteraction)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [playerPosition, setNearInteraction, findClosestInteraction])

  // Define locations precisely
  const locations = {
    center: [0, 0, 0] as Position,
    house: {
      position: [0, 0, -10] as Position,
      door: [0, 0, -7] as Position,
    },
    greenhouse: {
      position: [-15, 0, 0] as Position,
      door: [-13.9, 0, 3.5] as Position,
    },
    kiosk: {
      position: [5, 0, 15] as Position,
      door: [5, 0, 17] as Position,
    },
    stockExchange: {
      position: [15, 0, -8] as Position,
      door: [13.7, 0, -6] as Position,
    },
    fishingPond: {
      position: [-20, 0, 20] as Position,
      dock: [-15.5, 0, 17.6] as Position,
    },
    mailbox: {
      position: [2.1, 0, -6] as Position,
    },
    barn: {
      position: [15, 0, 8] as Position,
      door: [15, 0, 12] as Position,
    },
  }

  return (
    <group>
      {/* Greenhouse */}
      <group position={locations.greenhouse.position} rotation-y={Math.PI / 6}>
        <Greenhouse />
        <Billboard position={[0, 10, 0]}>
          <Text fontSize={1} color='black'>
            Теплица
          </Text>
        </Billboard>
      </group>

      {/* Kiosk - rotation adjusted to face center */}
      <group
        position={locations.kiosk.position}
        rotation-y={Math.atan2(
          -locations.kiosk.position[0],
          -locations.kiosk.position[2]
        )}
      >
        <Kiosk />
        <Billboard position={[0, 6, 0]}>
          <Text fontSize={1} color='black'>
            Киоск
          </Text>
        </Billboard>
      </group>

      {/* House */}
      <group position={locations.house.position}>
        <House />
        <Billboard position={[0, 6.5, 0]}>
          <Text fontSize={1} color='black'>
            Дом
          </Text>
        </Billboard>

        {/* Mailbox */}
        <Mailbox position={[2.1, 0, 4]} />
      </group>

      {/* Stock Exchange */}
      <group
        position={locations.stockExchange.position}
        rotation-y={Math.PI / 4}
      >
        <StockExchange />
        <Billboard position={[0, 5.5, 0]}>
          <Text fontSize={1} color='black'>
            Биржа
          </Text>
        </Billboard>
      </group>

      {/* Fishing Pond */}
      <group position={locations.fishingPond.position}>
        <FishingPond />
        <Billboard position={[0, 4, 0]}>
          <Text fontSize={1} color='black'>
            Пруд
          </Text>
        </Billboard>
      </group>

      {/* Barn - rotation adjusted to face center */}
      <group
        position={locations.barn.position}
        rotation-y={Math.atan2(
          -locations.barn.position[0],
          -locations.barn.position[2]
        )}
      >
        <Barn />
        <Billboard position={[0, 11.5, 0]}>
          <Text fontSize={1} color='black'>
            Амбар
          </Text>
        </Billboard>
      </group>
    </group>
  )
}
