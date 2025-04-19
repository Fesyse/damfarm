"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { Position } from "../types"
import { FENCE_BOUNDARIES, BUILDING_BOUNDARIES } from "../constants"

interface PlayerProps {
  isDialogOpen: boolean
  setPlayerPosition: (pos: Position) => void
}

export function Player({ isDialogOpen, setPlayerPosition }: PlayerProps) {
  const [position, setPosition] = useState<Position>([0, 0, 0])
  const [rotation, setRotation] = useState(0)
  const positionRef = useRef<Position>([0, 0, 0])
  const baseSpeed = 0.15
  const velocityRef = useRef<Position>([0, 0, 0])

  const smoothingFactor = 0.15
  const { camera } = useThree()
  const cameraRef = useRef({
    distance: 10,
    height: 5,
    angle: 0,
    targetHeight: 1,
    needsUpdate: false,
  })

  const keys = useRef<Record<string, boolean>>({
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
  })

  const mouseControlRef = useRef({
    isRightMouseDown: false,
    lastMouseX: 0,
    lastMouseY: 0,
    sensitivity: 0.003,
    heightSensitivity: 0.01,
  })

  const buildingDoors = useMemo(() => {
    return BUILDING_BOUNDARIES.filter(building => building.doorPosition).map(
      building => ({
        x: building.doorPosition?.x || 0,
        z: building.doorPosition?.z || 0,
        radius: building.doorPosition?.radius || 0,
      })
    )
  }, [])

  const checkCollision = useCallback(
    (
      newX: number,
      newZ: number
    ): { collided: boolean; slideX?: number; slideZ?: number } => {
      const playerRadius = 0.5

      for (let i = 0; i < FENCE_BOUNDARIES.length; i++) {
        const fence = FENCE_BOUNDARIES[i]
        if (
          newX + playerRadius > fence.minX &&
          newX - playerRadius < fence.maxX &&
          newZ + playerRadius > fence.minZ &&
          newZ - playerRadius < fence.maxZ
        ) {
          const overlapLeft = newX + playerRadius - fence.minX
          const overlapRight = fence.maxX - (newX - playerRadius)
          const overlapTop = newZ + playerRadius - fence.minZ
          const overlapBottom = fence.maxZ - (newZ - playerRadius)

          const minOverlap = Math.min(
            overlapLeft,
            overlapRight,
            overlapTop,
            overlapBottom
          )

          if (minOverlap === overlapLeft && overlapLeft < playerRadius * 2) {
            return {
              collided: true,
              slideX: newX - overlapLeft - 0.01,
              slideZ: newZ,
            }
          } else if (
            minOverlap === overlapRight &&
            overlapRight < playerRadius * 2
          ) {
            return {
              collided: true,
              slideX: newX + overlapRight + 0.01,
              slideZ: newZ,
            }
          } else if (
            minOverlap === overlapTop &&
            overlapTop < playerRadius * 2
          ) {
            return {
              collided: true,
              slideX: newX,
              slideZ: newZ - overlapTop - 0.01,
            }
          } else if (
            minOverlap === overlapBottom &&
            overlapBottom < playerRadius * 2
          ) {
            return {
              collided: true,
              slideX: newX,
              slideZ: newZ + overlapBottom + 0.01,
            }
          }

          return { collided: true }
        }
      }

      for (let i = 0; i < BUILDING_BOUNDARIES.length; i++) {
        const building = BUILDING_BOUNDARIES[i]

        if (
          newX + playerRadius > building.minX &&
          newX - playerRadius < building.maxX &&
          newZ + playerRadius > building.minZ &&
          newZ - playerRadius < building.maxZ
        ) {
          for (let j = 0; j < buildingDoors.length; j++) {
            const door = buildingDoors[j]
            const dx = newX - door.x
            const dz = newZ - door.z
            const distanceSquared = dx * dx + dz * dz

            if (distanceSquared < door.radius * door.radius) {
              return { collided: false }
            }
          }

          const overlapLeft = newX + playerRadius - building.minX
          const overlapRight = building.maxX - (newX - playerRadius)
          const overlapTop = newZ + playerRadius - building.minZ
          const overlapBottom = building.maxZ - (newZ - playerRadius)

          const minOverlap = Math.min(
            overlapLeft,
            overlapRight,
            overlapTop,
            overlapBottom
          )

          if (minOverlap === overlapLeft && overlapLeft < playerRadius * 2) {
            return {
              collided: true,
              slideX: newX - overlapLeft - 0.01,
              slideZ: newZ,
            }
          } else if (
            minOverlap === overlapRight &&
            overlapRight < playerRadius * 2
          ) {
            return {
              collided: true,
              slideX: newX + overlapRight + 0.01,
              slideZ: newZ,
            }
          } else if (
            minOverlap === overlapTop &&
            overlapTop < playerRadius * 2
          ) {
            return {
              collided: true,
              slideX: newX,
              slideZ: newZ - overlapTop - 0.01,
            }
          } else if (
            minOverlap === overlapBottom &&
            overlapBottom < playerRadius * 2
          ) {
            return {
              collided: true,
              slideX: newX,
              slideZ: newZ + overlapBottom + 0.01,
            }
          }

          return { collided: true }
        }
      }

      return { collided: false }
    },
    [buildingDoors]
  )

  useFrame((_, delta) => {
    if (isDialogOpen) return
    const clampedDelta = Math.min(delta * 1000, 100)

    const speedFactor = clampedDelta / 16.67
    const speed = baseSpeed * speedFactor

    let targetMoveX = 0
    let targetMoveZ = 0

    const angle = cameraRef.current.angle
    const forward = {
      x: Math.sin(angle),
      z: Math.cos(angle),
    }

    const right = {
      x: Math.sin(angle + Math.PI / 2),
      z: Math.cos(angle + Math.PI / 2),
    }

    if (keys.current.KeyW) {
      targetMoveX -= forward.x * speed
      targetMoveZ -= forward.z * speed
    }
    if (keys.current.KeyS) {
      targetMoveX += forward.x * speed
      targetMoveZ += forward.z * speed
    }
    if (keys.current.KeyA) {
      targetMoveX -= right.x * speed
      targetMoveZ -= right.z * speed
    }
    if (keys.current.KeyD) {
      targetMoveX += right.x * speed
      targetMoveZ += right.z * speed
    }

    if (targetMoveX !== 0 && targetMoveZ !== 0) {
      const magnitude = Math.sqrt(
        targetMoveX * targetMoveX + targetMoveZ * targetMoveZ
      )
      targetMoveX = (targetMoveX / magnitude) * speed
      targetMoveZ = (targetMoveZ / magnitude) * speed
    }

    if (keys.current.ArrowLeft) cameraRef.current.angle -= 0.05 * speedFactor
    if (keys.current.ArrowRight) cameraRef.current.angle += 0.05 * speedFactor

    if (keys.current.ArrowUp)
      cameraRef.current.height = Math.min(
        15,
        cameraRef.current.height + 0.2 * speedFactor
      )
    if (keys.current.ArrowDown)
      cameraRef.current.height = Math.max(
        2,
        cameraRef.current.height - 0.2 * speedFactor
      )

    if (targetMoveX !== 0 || targetMoveZ !== 0) {
      const currentPos = positionRef.current
      const newX = currentPos[0] + targetMoveX
      const newZ = currentPos[2] + targetMoveZ

      const collisionResult = checkCollision(newX, newZ)

      if (!collisionResult.collided) {
        const moveAngle = Math.atan2(targetMoveX, targetMoveZ)
        setRotation(moveAngle)

        velocityRef.current[0] = lerp(
          velocityRef.current[0],
          targetMoveX,
          smoothingFactor
        )
        velocityRef.current[2] = lerp(
          velocityRef.current[2],
          targetMoveZ,
          smoothingFactor
        )

        const smoothX = currentPos[0] + velocityRef.current[0]
        const smoothZ = currentPos[2] + velocityRef.current[2]

        const newPosition: Position = [smoothX, currentPos[1], smoothZ]
        setPosition(newPosition)

        positionRef.current = newPosition
      } else if (
        collisionResult.slideX !== undefined &&
        collisionResult.slideZ !== undefined
      ) {
        const moveAngle = Math.atan2(targetMoveX, targetMoveZ)
        setRotation(moveAngle)

        const slidePosition: Position = [
          collisionResult.slideX,
          currentPos[1],
          collisionResult.slideZ,
        ]
        setPosition(slidePosition)
        positionRef.current = slidePosition

        const slideVecX = collisionResult.slideX - currentPos[0]
        const slideVecZ = collisionResult.slideZ - currentPos[2]

        if (Math.abs(slideVecX) > 0.001 || Math.abs(slideVecZ) > 0.001) {
          const slideMag = Math.sqrt(
            slideVecX * slideVecX + slideVecZ * slideVecZ
          )
          const slideNormX = slideVecX / slideMag
          const slideNormZ = slideVecZ / slideMag

          const dot =
            velocityRef.current[0] * slideNormX +
            velocityRef.current[2] * slideNormZ

          velocityRef.current[0] = slideNormX * dot * 0.8
          velocityRef.current[2] = slideNormZ * dot * 0.8
        } else {
          velocityRef.current[0] = lerp(velocityRef.current[0], 0, 0.7)
          velocityRef.current[2] = lerp(velocityRef.current[2], 0, 0.7)
        }
      } else {
        const checkX = checkCollision(newX, currentPos[2])
        if (!checkX.collided) {
          const newPosition: Position = [newX, currentPos[1], currentPos[2]]
          setPosition(newPosition)
          positionRef.current = newPosition
          velocityRef.current[0] = targetMoveX * 0.5
          velocityRef.current[2] = 0
          return
        }

        const checkZ = checkCollision(currentPos[0], newZ)
        if (!checkZ.collided) {
          const newPosition: Position = [currentPos[0], currentPos[1], newZ]
          setPosition(newPosition)
          positionRef.current = newPosition
          velocityRef.current[0] = 0
          velocityRef.current[2] = targetMoveZ * 0.5
          return
        }

        velocityRef.current[0] = lerp(velocityRef.current[0], 0, 0.5)
        velocityRef.current[2] = lerp(velocityRef.current[2], 0, 0.5)

        if (
          Math.abs(velocityRef.current[0]) < 0.01 &&
          Math.abs(velocityRef.current[2]) < 0.01
        ) {
          const dirX = currentPos[0] - newX
          const dirZ = currentPos[2] - newZ

          const mag = Math.sqrt(dirX * dirX + dirZ * dirZ)
          if (mag > 0.001) {
            const pushX = (dirX / mag) * 0.05
            const pushZ = (dirZ / mag) * 0.05

            const nudgedPos = [
              currentPos[0] + pushX,
              currentPos[1],
              currentPos[2] + pushZ,
            ] as Position
            if (!checkCollision(nudgedPos[0], nudgedPos[2]).collided) {
              setPosition(nudgedPos)
              positionRef.current = nudgedPos
            }
          }
        }
      }
    } else {
      velocityRef.current[0] = lerp(velocityRef.current[0], 0, 0.2)
      velocityRef.current[2] = lerp(velocityRef.current[2], 0, 0.2)

      if (
        Math.abs(velocityRef.current[0]) > 0.001 ||
        Math.abs(velocityRef.current[2]) > 0.001
      ) {
        const currentPos = positionRef.current
        const smoothX = currentPos[0] + velocityRef.current[0]
        const smoothZ = currentPos[2] + velocityRef.current[2]

        const collisionResult = checkCollision(smoothX, smoothZ)

        if (!collisionResult.collided) {
          const newPosition: Position = [smoothX, currentPos[1], smoothZ]
          setPosition(newPosition)
          positionRef.current = newPosition
        } else if (
          collisionResult.slideX !== undefined &&
          collisionResult.slideZ !== undefined
        ) {
          const slidePosition: Position = [
            collisionResult.slideX,
            currentPos[1],
            collisionResult.slideZ,
          ]
          setPosition(slidePosition)
          positionRef.current = slidePosition

          velocityRef.current[0] = lerp(velocityRef.current[0], 0, 0.4)
          velocityRef.current[2] = lerp(velocityRef.current[2], 0, 0.4)
        } else {
          velocityRef.current[0] = 0
          velocityRef.current[2] = 0
        }
      }
    }

    const currentPosition = positionRef.current
    const { distance, height, targetHeight } = cameraRef.current

    const cameraX = currentPosition[0] + Math.sin(angle) * distance
    const cameraZ = currentPosition[2] + Math.cos(angle) * distance

    camera.position.set(cameraX, currentPosition[1] + height, cameraZ)
    camera.lookAt(
      currentPosition[0],
      currentPosition[1] + targetHeight,
      currentPosition[2]
    )
  })

  useEffect(() => {
    setPlayerPosition(position)
  }, [position, setPlayerPosition])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in keys.current) {
        keys.current[e.code] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in keys.current) {
        keys.current[e.code] = false
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        mouseControlRef.current.isRightMouseDown = true
        mouseControlRef.current.lastMouseX = e.clientX
        mouseControlRef.current.lastMouseY = e.clientY
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        mouseControlRef.current.isRightMouseDown = false
      }
    }

    let lastMoveTime = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastMoveTime < 16 && !mouseControlRef.current.isRightMouseDown)
        return
      lastMoveTime = now

      if (mouseControlRef.current.isRightMouseDown) {
        const deltaX = e.clientX - mouseControlRef.current.lastMouseX
        const deltaY = e.clientY - mouseControlRef.current.lastMouseY

        cameraRef.current.angle -= deltaX * mouseControlRef.current.sensitivity

        cameraRef.current.height = Math.max(
          2,
          Math.min(
            15,
            cameraRef.current.height +
              deltaY * mouseControlRef.current.heightSensitivity
          )
        )

        mouseControlRef.current.lastMouseX = e.clientX
        mouseControlRef.current.lastMouseY = e.clientY
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    let wheelTimeout: number | null = null
    const handleWheel = (e: WheelEvent) => {
      if (wheelTimeout !== null) {
        clearTimeout(wheelTimeout)
      }

      wheelTimeout = window.setTimeout(() => {
        cameraRef.current.distance = Math.max(
          5,
          Math.min(20, cameraRef.current.distance + e.deltaY * 0.01)
        )
        wheelTimeout = null
      }, 10)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("wheel", handleWheel, { passive: true })

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("contextmenu", handleContextMenu)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("contextmenu", handleContextMenu)
      if (wheelTimeout !== null) {
        clearTimeout(wheelTimeout)
      }
    }
  }, [])

  const PlayerModel = useMemo(() => {
    return (
      <>
        {/* Mushroom stem */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
          <meshStandardMaterial color='#f5f5dc' />
        </mesh>

        {/* Mushroom cap*/}
        <mesh
          castShadow
          position={[0, 0.9, 0]}
          rotation={[Math.PI / 2, Math.PI, 0]}
        >
          <sphereGeometry args={[0.6, 16, 16, 0, Math.PI]} />
          <meshStandardMaterial color='#ff4d4d' flatShading={false} />
        </mesh>

        {/* Mushroom spots */}
        <mesh position={[0.25, 1.33, 0.3]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color='#ffffff' />
        </mesh>
        <mesh position={[-0.2, 1.38, 0.25]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color='#ffffff' />
        </mesh>
        <mesh position={[0.15, 1.4, -0.25]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color='#ffffff' />
        </mesh>
        <mesh position={[-0.3, 1.35, -0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color='#ffffff' />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.15, 0.5, 0.25]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color='#000000' />
        </mesh>
        <mesh position={[-0.15, 0.5, 0.25]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color='#000000' />
        </mesh>
      </>
    )
  }, [])

  return (
    <group
      position={[position[0], position[1], position[2]]}
      rotation-y={rotation}
    >
      {PlayerModel}
    </group>
  )
}

function lerp(start: number, end: number, amount: number): number {
  return (1 - amount) * start + amount * end
}
// Add linear interpolation helper function
