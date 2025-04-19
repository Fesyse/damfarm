"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { Position } from "../types"
import { FENCE_BOUNDARIES, BUILDING_BOUNDARIES } from "../constants"

interface PlayerProps {
  setPlayerPosition: (pos: Position) => void
}

export function Player({ setPlayerPosition }: PlayerProps) {
  const [position, setPosition] = useState<Position>([0, 0, 0])
  const [rotation, setRotation] = useState(0)
  // Store position in a ref for smoother transitions
  const positionRef = useRef<Position>([0, 0, 0])
  // Lower base speed to make movement less jerky
  const baseSpeed = 0.15
  // Add velocity reference for smooth movement
  const velocityRef = useRef<Position>([0, 0, 0])
  // Add smoothing factor for player movement (between 0 and 1, lower = smoother but more input lag)
  const smoothingFactor = 0.15
  const { camera } = useThree()
  const cameraRef = useRef({
    distance: 10,
    height: 5,
    angle: 0,
    targetHeight: 1,
    needsUpdate: false,
  })

  // Keys state tracking with useRef instead of state for better performance
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

  // Add state for mouse control
  const mouseControlRef = useRef({
    isRightMouseDown: false,
    lastMouseX: 0,
    lastMouseY: 0,
    sensitivity: 0.003,
    heightSensitivity: 0.01,
  })

  // Pre-calculate and memoize building door positions for collision optimization
  const buildingDoors = useMemo(() => {
    return BUILDING_BOUNDARIES.filter(building => building.doorPosition).map(
      building => ({
        x: building.doorPosition?.x || 0,
        z: building.doorPosition?.z || 0,
        radius: building.doorPosition?.radius || 0,
      })
    )
  }, [])

  // Optimized collision detection function using pre-calculated boundaries
  const checkCollision = useCallback(
    (newX: number, newZ: number): boolean => {
      const playerRadius = 0.5

      // Use spatial quadrants to optimize collision detection
      // First check fence boundaries (faster check, as there are fewer fences)
      for (let i = 0; i < FENCE_BOUNDARIES.length; i++) {
        const fence = FENCE_BOUNDARIES[i]
        if (
          newX + playerRadius > fence.minX &&
          newX - playerRadius < fence.maxX &&
          newZ + playerRadius > fence.minZ &&
          newZ - playerRadius < fence.maxZ
        ) {
          return true
        }
      }

      // Then check building boundaries if no fence collision
      for (let i = 0; i < BUILDING_BOUNDARIES.length; i++) {
        const building = BUILDING_BOUNDARIES[i]

        // Quick AABB collision check first for performance
        if (
          newX + playerRadius > building.minX &&
          newX - playerRadius < building.maxX &&
          newZ + playerRadius > building.minZ &&
          newZ - playerRadius < building.maxZ
        ) {
          // If colliding, check if player is near any door
          for (let j = 0; j < buildingDoors.length; j++) {
            const door = buildingDoors[j]
            const dx = newX - door.x
            const dz = newZ - door.z
            // Use squared distance for better performance (avoids square root)
            const distanceSquared = dx * dx + dz * dz

            // If player is close to a door, don't apply collision
            if (distanceSquared < door.radius * door.radius) {
              return false
            }
          }

          // Not near a door, so collision is true
          return true
        }
      }

      return false
    },
    [buildingDoors]
  )

  // Use useFrame hook for more efficient rendering
  useFrame((_, delta) => {
    // Cap delta time to prevent large jumps
    const clampedDelta = Math.min(delta * 1000, 100)

    // Use consistent timestep for speed calculation to avoid jitter
    const speedFactor = clampedDelta / 16.67
    const speed = baseSpeed * speedFactor

    let targetMoveX = 0
    let targetMoveZ = 0

    // Calculate forward and right vectors based on camera angle
    const angle = cameraRef.current.angle
    const forward = {
      x: Math.sin(angle),
      z: Math.cos(angle),
    }

    const right = {
      x: Math.sin(angle + Math.PI / 2),
      z: Math.cos(angle + Math.PI / 2),
    }

    // Apply movement vectors independently to allow diagonal movement
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

    // Normalize diagonal movement to maintain consistent speed
    if (targetMoveX !== 0 && targetMoveZ !== 0) {
      const magnitude = Math.sqrt(
        targetMoveX * targetMoveX + targetMoveZ * targetMoveZ
      )
      targetMoveX = (targetMoveX / magnitude) * speed
      targetMoveZ = (targetMoveZ / magnitude) * speed
    }

    // Smooth camera angle changes based on delta time
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

      if (!checkCollision(newX, newZ)) {
        // Set player rotation to face direction of movement
        const moveAngle = Math.atan2(targetMoveX, targetMoveZ)
        setRotation(moveAngle)

        // Use velocity for smooth acceleration/deceleration
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

        // Apply smoothed velocity to position
        const smoothX = currentPos[0] + velocityRef.current[0]
        const smoothZ = currentPos[2] + velocityRef.current[2]

        // Update position with smooth transition
        const newPosition: Position = [smoothX, currentPos[1], smoothZ]
        setPosition(newPosition)

        // Immediately update the ref to ensure camera follows smoothly
        positionRef.current = newPosition
      } else {
        // If collision, gradually reduce velocity to zero
        velocityRef.current[0] = lerp(velocityRef.current[0], 0, 0.5)
        velocityRef.current[2] = lerp(velocityRef.current[2], 0, 0.5)
      }
    } else {
      // No movement keys pressed, decelerate gradually
      velocityRef.current[0] = lerp(velocityRef.current[0], 0, 0.2)
      velocityRef.current[2] = lerp(velocityRef.current[2], 0, 0.2)

      // Apply deceleration
      if (
        Math.abs(velocityRef.current[0]) > 0.001 ||
        Math.abs(velocityRef.current[2]) > 0.001
      ) {
        const currentPos = positionRef.current
        const smoothX = currentPos[0] + velocityRef.current[0]
        const smoothZ = currentPos[2] + velocityRef.current[2]

        // Update position with deceleration
        const newPosition: Position = [smoothX, currentPos[1], smoothZ]
        setPosition(newPosition)
        positionRef.current = newPosition
      }
    }

    // Update camera position
    const currentPosition = positionRef.current
    const { distance, height, targetHeight } = cameraRef.current

    // Calculate camera position
    const cameraX = currentPosition[0] + Math.sin(angle) * distance
    const cameraZ = currentPosition[2] + Math.cos(angle) * distance

    camera.position.set(cameraX, currentPosition[1] + height, cameraZ)
    camera.lookAt(
      currentPosition[0],
      currentPosition[1] + targetHeight,
      currentPosition[2]
    )
  })

  // Update player position separately from camera position
  useEffect(() => {
    setPlayerPosition(position)
  }, [position, setPlayerPosition])

  // Handle keyboard input with proper types
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

    // Add mouse event handlers for camera control
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        // Right mouse button
        mouseControlRef.current.isRightMouseDown = true
        mouseControlRef.current.lastMouseX = e.clientX
        mouseControlRef.current.lastMouseY = e.clientY
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        // Right mouse button
        mouseControlRef.current.isRightMouseDown = false
      }
    }

    // Throttle mouse move function for better performance
    let lastMoveTime = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      // Only process mouse moves every 16ms (approx 60fps) for better performance
      if (now - lastMoveTime < 16 && !mouseControlRef.current.isRightMouseDown)
        return
      lastMoveTime = now

      if (mouseControlRef.current.isRightMouseDown) {
        const deltaX = e.clientX - mouseControlRef.current.lastMouseX
        const deltaY = e.clientY - mouseControlRef.current.lastMouseY

        // Horizontal movement controls camera angle (rotation)
        cameraRef.current.angle -= deltaX * mouseControlRef.current.sensitivity

        // Vertical movement controls camera height
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

    // Prevent context menu on right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Debounced wheel handler to improve performance during rapid scrolling
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
    window.addEventListener("wheel", handleWheel, { passive: true }) // Add passive flag for better scroll performance

    // Add mouse event listeners
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

  // Optimize 3D model with memoization
  const PlayerModel = useMemo(() => {
    return (
      <>
        {/* Mushroom stem */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.8, 16]} />
          <meshStandardMaterial color='#f5f5dc' />
        </mesh>

        {/* Mushroom cap - rounded */}
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

// Add linear interpolation helper function
function lerp(start: number, end: number, amount: number): number {
  return (1 - amount) * start + amount * end
}
