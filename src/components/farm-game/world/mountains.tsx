"use client"

import { useMemo } from "react"
import { Position, Rotation } from "../types"
import { useRef } from "react"
import * as THREE from "three"

interface MountainsProps {
  position: Position
  rotation?: Rotation
}

export function Mountains({
  position,
  rotation = [0, 0, 0] as Rotation,
}: MountainsProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Modified mountain configuration for outside-fence placement
  const mountainRanges = useMemo(() => {
    return [
      // Main mountain range - taller, more imposing but distanced
      {
        count: 5,
        basePosition: [0, 0, -10], // Move back from fence
        spreadX: 70,
        spreadZ: 10,
        minScale: 10,
        maxScale: 20,
        minHeight: 35, // Taller
        maxHeight: 60,
        color: "#78909C",
        segments: 6,
      },
      // Secondary taller peaks
      {
        count: 4,
        basePosition: [0, 0, -20], // Positioned further back
        spreadX: 80,
        spreadZ: 15,
        minScale: 15,
        maxScale: 25,
        minHeight: 45,
        maxHeight: 70,
        color: "#607D8B",
        segments: 6,
      },
    ]
  }, [])

  // Generate the individual mountains for each range
  const mountainData = useMemo(() => {
    const data: {
      x: number
      y: number
      z: number
      scale: number
      height: number
      color: string
      segments: number
      snowCap: boolean
    }[] = []

    mountainRanges.forEach(range => {
      for (let i = 0; i < range.count; i++) {
        // Generate mountain data
        const height =
          range.minHeight + Math.random() * (range.maxHeight - range.minHeight)
        data.push({
          x: range.basePosition[0] + (Math.random() - 0.5) * range.spreadX,
          y: 0,
          z: range.basePosition[2] + (Math.random() - 0.5) * range.spreadZ,
          scale:
            range.minScale + Math.random() * (range.maxScale - range.minScale),
          height: height,
          color: range.color,
          segments: range.segments,
          snowCap: height > 50, // Snow caps on the tallest peaks
        })
      }
    })

    return data
  }, [mountainRanges])

  return (
    <group position={position} rotation={rotation} ref={groupRef}>
      {mountainData.map((mountain, i) => (
        <group key={i} position={[mountain.x, 0, mountain.z]}>
          {/* Main mountain body */}
          <mesh position={[0, mountain.height / 2, 0]} castShadow>
            <coneGeometry
              args={[mountain.scale, mountain.height, mountain.segments]}
            />
            <meshStandardMaterial
              color={mountain.color}
              flatShading
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Add snow caps to tall mountains */}
          {mountain.snowCap && (
            <mesh
              position={[0, mountain.height - mountain.height * 0.15, 0]}
              castShadow
            >
              <coneGeometry
                args={[
                  mountain.scale * 0.65,
                  mountain.height * 0.3,
                  mountain.segments,
                ]}
              />
              <meshStandardMaterial
                color='#FFFFFF'
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}
