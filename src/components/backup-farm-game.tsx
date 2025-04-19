"use client"

import {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useRef,
  useCallback,
} from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Environment, Sky, Text, Billboard } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Coins, Sun, Menu, X, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Add type definitions at the top of the file
type Position = [number, number, number]
type Rotation = [number, number, number]
type Fence = {
  position: Position
  rotation: Rotation
  length: number
  width: number
}

type InteractionPoint = {
  type: string
  position: Position
  key: string
  action: string
}

// Define fences data outside of component to avoid recreation on each render
const WORLD_FENCES: Fence[] = [
  { position: [0, 0, -40], rotation: [0, 0, 0], length: 80, width: 0.5 },
  { position: [0, 0, 40], rotation: [0, 0, 0], length: 80, width: 0.5 },
  {
    position: [-40, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    length: 80,
    width: 0.5,
  },
  {
    position: [40, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    length: 80,
    width: 0.5,
  },
]

// Pre-calculate fence boundaries for faster collision detection
const FENCE_BOUNDARIES = WORLD_FENCES.map(fence => {
  const [fenceX, , fenceZ] = fence.position
  const [, fenceRotY] = fence.rotation

  const isHorizontal = fenceRotY === 0
  return {
    minX: isHorizontal ? fenceX - fence.length / 2 : fenceX - fence.width / 2,
    maxX: isHorizontal ? fenceX + fence.length / 2 : fenceX + fence.width / 2,
    minZ: isHorizontal ? fenceZ - fence.width / 2 : fenceZ - fence.length / 2,
    maxZ: isHorizontal ? fenceZ + fence.width / 2 : fenceZ + fence.length / 2,
  }
})

// Define interaction points outside to avoid recreating in every render
const INTERACTION_POINTS: InteractionPoint[] = [
  {
    type: "greenhouse",
    position: [-10, 0, 6.5],
    key: "E",
    action: "войти в Теплицу",
  },
  {
    type: "kiosk",
    position: [10, 0, 10],
    key: "E",
    action: "посетить Киоск",
  },
  {
    type: "house",
    position: [0, 0, -10],
    key: "E",
    action: "войти в Дом",
  },
  {
    type: "stocks",
    position: [10, 0, -10],
    key: "E",
    action: "торговать акциями",
  },
  {
    type: "fishing",
    position: [-18, 0, 17],
    key: "E",
    action: "начать рыбалку",
  },
  {
    type: "mail",
    position: [2, 0, -12],
    key: "M",
    action: "проверить почту",
  },
]

// Define additional type for building collision boundaries
type BuildingBoundary = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  type: string
  // Add doorPosition to create an entry point where collision is disabled
  doorPosition?: {
    x: number
    z: number
    radius: number
  }
}

// Helper function to calculate rotated boundaries
const calculateRotatedBoundaries = (
  position: [number, number, number],
  width: number,
  depth: number,
  rotationY: number
): { minX: number; maxX: number; minZ: number; maxZ: number } => {
  const [centerX, , centerZ] = position
  const halfWidth = width / 2
  const halfDepth = depth / 2

  // Define the four corners of the building before rotation
  const corners = [
    [centerX - halfWidth, centerZ - halfDepth], // front left
    [centerX + halfWidth, centerZ - halfDepth], // front right
    [centerX + halfWidth, centerZ + halfDepth], // back right
    [centerX - halfWidth, centerZ + halfDepth], // back left
  ]

  // Rotate each corner around the center
  const rotatedCorners = corners.map(([x, z]) => {
    // Translate to origin
    const translatedX = x - centerX
    const translatedZ = z - centerZ

    // Apply rotation
    const rotatedX =
      translatedX * Math.cos(rotationY) - translatedZ * Math.sin(rotationY)
    const rotatedZ =
      translatedX * Math.sin(rotationY) + translatedZ * Math.cos(rotationY)

    // Translate back
    return [rotatedX + centerX, rotatedZ + centerZ]
  })

  // Find min and max for X and Z from rotated corners
  const xValues = rotatedCorners.map(([x]) => x)
  const zValues = rotatedCorners.map(([, z]) => z)

  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minZ: Math.min(...zValues),
    maxZ: Math.max(...zValues),
  }
}

// Define building boundaries for collision detection
const BUILDING_BOUNDARIES: BuildingBoundary[] = [
  // Greenhouse (rotated by Math.PI/6)
  {
    ...calculateRotatedBoundaries([-15, 0, 0], 8, 9, Math.PI / 6),
    type: "greenhouse",
    doorPosition: {
      x: -13.9, // Position of door adjusted for rotation
      z: 3.5, // Position of door adjusted for rotation
      radius: 1.5, // Area around door where collision is disabled
    },
  },
  // Kiosk (rotated by -Math.PI/6)
  {
    ...calculateRotatedBoundaries([10, 0, 10], 3.6, 5, -Math.PI / 6),
    type: "kiosk",
    doorPosition: {
      x: 10, // Front of kiosk is open
      z: 12, // Front of kiosk is open
      radius: 2, // Wider area for counter interaction
    },
  },
  // House (no rotation)
  {
    ...calculateRotatedBoundaries([0, 0, -10], 6, 6, 0),
    type: "house",
    doorPosition: {
      x: 0, // Door is at front center
      z: -7, // Door Z position
      radius: 1.2, // Area around door where collision is disabled
    },
  },
  // Stock Exchange (rotated by Math.PI/4)
  {
    ...calculateRotatedBoundaries([15, 0, -15], 6, 6, Math.PI / 4),
    type: "stocks",
    doorPosition: {
      x: 13.7, // Door position adjusted for rotation
      z: -16.7, // Door position adjusted for rotation
      radius: 1.2, // Area around door where collision is disabled
    },
  },
  // Mailbox (smaller object)
  {
    ...calculateRotatedBoundaries([2, 0, -12], 1, 2, 0),
    type: "mail",
    doorPosition: {
      x: 2.2, // Mail slot location
      z: -12, // Mail slot location
      radius: 0.8, // Area around mailbox where collision is disabled for interaction
    },
  },
  // Fishing Pond (circular, using approximation for collision)
  {
    minX: -25, // Left boundary of pond
    maxX: -15, // Right boundary of pond
    minZ: 15, // Near boundary of pond
    maxZ: 25, // Far boundary of pond
    type: "fishing",
    doorPosition: {
      x: -15.5, // Center position for interaction
      z: 17.6, // Edge of pond where dock is
      radius: 2, // Area for interaction
    },
  },
]

// Replace the Player component with this updated version that includes camera controls
function Player({
  setPlayerPosition,
}: {
  setPlayerPosition: (pos: Position) => void
}) {
  const [position, setPosition] = useState<Position>([0, 1, 0])
  const [rotation, setRotation] = useState(0)
  // Store position in a ref for smoother transitions
  const positionRef = useRef<Position>([0, 1, 0])
  // Lower base speed to make movement less jerky
  const baseSpeed = 0.15
  const { camera } = useThree()
  const cameraRef = useRef({
    distance: 10,
    height: 5,
    angle: 0,
    targetHeight: 1,
    needsUpdate: false,
  })

  // Add state for mouse control
  const mouseControlRef = useRef({
    isRightMouseDown: false,
    lastMouseX: 0,
    lastMouseY: 0,
    sensitivity: 0.003,
    heightSensitivity: 0.01,
  })

  // Animation frame reference to avoid memory leaks
  const animationFrameId = useRef<number | null>(null)

  // Optimized collision detection function using pre-calculated boundaries
  const checkCollision = useCallback((newX: number, newZ: number): boolean => {
    const playerRadius = 0.5

    // First check fence boundaries (faster check, as there are fewer fences)
    const fenceCollision = FENCE_BOUNDARIES.some(
      fence =>
        newX + playerRadius > fence.minX &&
        newX - playerRadius < fence.maxX &&
        newZ + playerRadius > fence.minZ &&
        newZ - playerRadius < fence.maxZ
    )

    if (fenceCollision) return true

    // Then check building boundaries if no fence collision
    return BUILDING_BOUNDARIES.some(building => {
      // First check if player is near door - allow access if close to door
      if (building.doorPosition) {
        const dx = newX - building.doorPosition.x
        const dz = newZ - building.doorPosition.z
        const distanceToDoor = Math.sqrt(dx * dx + dz * dz)

        // If player is close to a door, don't apply collision
        if (distanceToDoor < building.doorPosition.radius) {
          return false
        }
      }

      // Apply normal collision check if not near door
      return (
        newX + playerRadius > building.minX &&
        newX - playerRadius < building.maxX &&
        newZ + playerRadius > building.minZ &&
        newZ - playerRadius < building.maxZ
      )
    })
  }, [])

  // Separate camera update function using requestAnimationFrame for smoother updates
  const updateCamera = useCallback(() => {
    const { angle, distance, height, targetHeight } = cameraRef.current
    const currentPosition = positionRef.current

    // Calculate camera position only when needed
    const cameraX = currentPosition[0] + Math.sin(angle) * distance
    const cameraZ = currentPosition[2] + Math.cos(angle) * distance

    camera.position.set(cameraX, currentPosition[1] + height, cameraZ)
    camera.lookAt(
      currentPosition[0],
      currentPosition[1] + targetHeight,
      currentPosition[2]
    )

    // Continue animation loop
    animationFrameId.current = requestAnimationFrame(updateCamera)
  }, [camera])

  // Start camera animation loop
  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(updateCamera)

    // Clean up animation frame on unmount
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [updateCamera])

  // Update player position separately from camera position
  useEffect(() => {
    setPlayerPosition(position)
    positionRef.current = position
  }, [position, setPlayerPosition])

  // Handle keyboard input with proper types
  useEffect(() => {
    const keys: Record<string, boolean> = {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false,
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in keys) {
        keys[e.code] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in keys) {
        keys[e.code] = false
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

    const handleMouseMove = (e: MouseEvent) => {
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

    // Throttled wheel handler to improve performance during rapid scrolling
    const handleWheel = (e: WheelEvent) => {
      cameraRef.current.distance = Math.max(
        5,
        Math.min(20, cameraRef.current.distance + e.deltaY * 0.01)
      )
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("wheel", handleWheel, { passive: true }) // Add passive flag for better scroll performance

    // Add mouse event listeners
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("contextmenu", handleContextMenu)

    // Use requestAnimationFrame for movement updates with delta time
    let lastTime = 0
    const movePlayer = (currentTime: number) => {
      // Calculate delta time for smooth movement regardless of frame rate
      const deltaTime = lastTime === 0 ? 16.67 : currentTime - lastTime
      lastTime = currentTime

      // Limit maximum delta to prevent large jumps after tab switching
      const clampedDelta = Math.min(deltaTime, 100)

      // Calculate speed based on delta time (60fps equivalent)
      const speed = baseSpeed * (clampedDelta / 16.67)

      let moveX = 0
      let moveZ = 0

      // Calculate forward and right vectors based on camera angle
      const forward = {
        x: Math.sin(cameraRef.current.angle),
        z: Math.cos(cameraRef.current.angle),
      }

      const right = {
        x: Math.sin(cameraRef.current.angle + Math.PI / 2),
        z: Math.cos(cameraRef.current.angle + Math.PI / 2),
      }

      // Apply movement vectors independently to allow diagonal movement
      if (keys.KeyW) {
        moveX -= forward.x * speed
        moveZ -= forward.z * speed
      }
      if (keys.KeyS) {
        moveX += forward.x * speed
        moveZ += forward.z * speed
      }
      if (keys.KeyA) {
        moveX -= right.x * speed
        moveZ -= right.z * speed
      }
      if (keys.KeyD) {
        moveX += right.x * speed
        moveZ += right.z * speed
      }

      // Normalize diagonal movement to maintain consistent speed
      if (moveX !== 0 && moveZ !== 0) {
        const magnitude = Math.sqrt(moveX * moveX + moveZ * moveZ)
        moveX = (moveX / magnitude) * speed
        moveZ = (moveZ / magnitude) * speed
      }

      // Smooth camera angle changes based on delta time
      if (keys.ArrowLeft)
        cameraRef.current.angle -= 0.05 * (clampedDelta / 16.67)
      if (keys.ArrowRight)
        cameraRef.current.angle += 0.05 * (clampedDelta / 16.67)

      if (keys.ArrowUp)
        cameraRef.current.height = Math.min(
          15,
          cameraRef.current.height + 0.2 * (clampedDelta / 16.67)
        )
      if (keys.ArrowDown)
        cameraRef.current.height = Math.max(
          2,
          cameraRef.current.height - 0.2 * (clampedDelta / 16.67)
        )

      if (moveX !== 0 || moveZ !== 0) {
        const currentPos = positionRef.current
        const newX = currentPos[0] + moveX
        const newZ = currentPos[2] + moveZ

        if (!checkCollision(newX, newZ)) {
          // Set player rotation to face direction of movement
          const angle = Math.atan2(moveX, moveZ)
          setRotation(angle)

          // Update position with smooth transition
          // Use the current position from ref for calculation to avoid animation lag
          setPosition([newX, currentPos[1], newZ])

          // Immediately update the ref to ensure camera follows smoothly
          positionRef.current = [newX, currentPos[1], newZ]
        }
      }

      movementFrameId = requestAnimationFrame(movePlayer)
    }

    let movementFrameId = requestAnimationFrame(movePlayer)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("contextmenu", handleContextMenu)
      cancelAnimationFrame(movementFrameId)
    }
  }, [checkCollision])

  return (
    <group
      position={[position[0], position[1], position[2]]}
      rotation-y={rotation}
    >
      {/* Player body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color='#1e88e5' />
      </mesh>

      {/* Player head */}
      <mesh castShadow position={[0, 1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color='#ffb74d' />
      </mesh>

      {/* Player eyes */}
      <mesh position={[0.15, 1.1, 0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color='#000000' />
      </mesh>
      <mesh position={[-0.15, 1.1, 0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color='#000000' />
      </mesh>

      {/* Player hat */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
        <meshStandardMaterial color='#4caf50' />
      </mesh>
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.3, 16]} />
        <meshStandardMaterial color='#4caf50' />
      </mesh>
    </group>
  )
}

// Add dummy dialog components to resolve errors
function FishingDialog() {
  const [isFishing, setIsFishing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [catchResult, setCatchResult] = useState<string | null>(null)

  const startFishing = () => {
    setIsFishing(true)
    setProgress(0)
    setCatchResult(null)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          const catches = [
            "Окунь",
            "Карп",
            "Щука",
            "Форель",
            "Старый ботинок",
            "Водоросли",
          ]
          setCatchResult(catches[Math.floor(Math.random() * catches.length)])
          setIsFishing(false)
          return 100
        }
        return prev + 5
      })
    }, 300)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Рыбалка</DialogTitle>
        <DialogDescription>
          Начните рыбалку и поймайте что-нибудь интересное!
        </DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        {!isFishing && !catchResult && (
          <Button className='w-full' onClick={startFishing}>
            Начать рыбалку
          </Button>
        )}

        {isFishing && (
          <div className='space-y-4'>
            <div className='text-center text-lg'>Рыбалка в процессе...</div>
            <Progress value={progress} className='h-2 mb-2' />
          </div>
        )}

        {catchResult && (
          <div className='space-y-4'>
            <div className='text-center text-xl font-bold'>
              Вы поймали: {catchResult}!
            </div>
            <Button className='w-full' onClick={startFishing}>
              Попробовать снова
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Ваш улов сегодня</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <table className='w-full'>
              <thead>
                <tr>
                  <th className='text-left'>Рыба</th>
                  <th className='text-right'>Количество</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Окунь</td>
                  <td className='text-right'>2</td>
                </tr>
                <tr>
                  <td>Карп</td>
                  <td className='text-right'>1</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StocksDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Биржа</DialogTitle>
        <DialogDescription>
          Торгуйте акциями и станьте богаче!
        </DialogDescription>
      </DialogHeader>
      <div>Торговля акциями...</div>
    </>
  )
}

function MailDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Почта</DialogTitle>
        <DialogDescription>Проверьте свою почту!</DialogDescription>
      </DialogHeader>
      <div>Почтовый ящик пуст.</div>
    </>
  )
}

// Rename BarnDialog to GreenhouseDialog and update its content
function GreenhouseDialog() {
  const plots = [
    { id: 1, plant: "carrot", stage: 2, watered: true },
    { id: 2, plant: "potato", stage: 1, watered: false },
    { id: 3, plant: "wheat", stage: 3, watered: true },
    { id: 4, plant: null, stage: 0, watered: false },
    { id: 5, plant: "corn", stage: 2, watered: true },
  ]
  const [selectedPlant, setSelectedPlant] = useState("carrot")

  return (
    <>
      <DialogHeader>
        <DialogTitle>Теплица - Управление растениями</DialogTitle>
        <DialogDescription>
          Здесь вы можете выращивать растения в контролируемых условиях
        </DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex gap-2 mb-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("carrot")}
            className={selectedPlant === "carrot" ? "ring-2 ring-primary" : ""}
          >
            🥕 Морковь
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("potato")}
            className={selectedPlant === "potato" ? "ring-2 ring-primary" : ""}
          >
            🥔 Картофель
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("wheat")}
            className={selectedPlant === "wheat" ? "ring-2 ring-primary" : ""}
          >
            🌾 Пшеница
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("corn")}
            className={selectedPlant === "corn" ? "ring-2 ring-primary" : ""}
          >
            🌽 Кукуруза
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {plots.map(plot => (
            <Card key={plot.id}>
              <CardHeader className='p-3 pb-0'>
                <CardTitle className='text-sm'>Грядка #{plot.id}</CardTitle>
              </CardHeader>
              <CardContent className='p-3'>
                {plot.plant ? (
                  <div className='flex items-center gap-3'>
                    <div className='text-3xl'>
                      {plot.plant === "carrot" && "🥕"}
                      {plot.plant === "potato" && "🥔"}
                      {plot.plant === "wheat" && "🌾"}
                      {plot.plant === "corn" && "🌽"}
                      {plot.plant === "tomato" && "🍅"}
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between mb-1'>
                        <span className='capitalize'>{plot.plant}</span>
                        <span>{plot.watered ? "💧" : ""}</span>
                      </div>
                      <Progress value={plot.stage * 33} className='h-2 mb-2' />
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant={plot.watered ? "outline" : "default"}
                        >
                          {plot.watered ? "Полито" : "Полить"}
                        </Button>
                        <Button size='sm' variant='destructive'>
                          Убрать
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <div className='text-center text-muted-foreground mb-2'>
                      Пустая грядка
                    </div>
                    <Button size='sm' className='w-full'>
                      Посадить{" "}
                      {selectedPlant === "carrot"
                        ? "🥕"
                        : selectedPlant === "potato"
                        ? "🥔"
                        : selectedPlant === "wheat"
                        ? "🌾"
                        : "🌽"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className='mt-4'>Добавить новую грядку (500 монет)</Button>
      </div>
    </>
  )
}

// Add a new HouseDialog component
function HouseDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Дом</DialogTitle>
        <DialogDescription>Ваше уютное жилище</DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Отдых</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <Button className='w-full'>Поспать (пропустить день)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Хранилище</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <div className='text-center mb-2'>
              Здесь вы можете хранить свои вещи
            </div>
            <Button className='w-full'>Открыть хранилище</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Украшение дома</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <Button className='w-full'>Изменить интерьер</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Fix the KioskDialog component to remove unused state
function KioskDialog() {
  const items = [
    { name: "Семена моркови", icon: "🥕", price: 10, stock: 15 },
    { name: "Семена картофеля", icon: "🥔", price: 15, stock: 10 },
    { name: "Семена пшеницы", icon: "🌾", price: 5, stock: 20 },
    { name: "Семена кукурузы", icon: "🌽", price: 20, stock: 8 },
    { name: "Удобрение", icon: "💩", price: 30, stock: 5 },
    { name: "Лейка", icon: "💧", price: 50, stock: 3 },
    { name: "Лопата", icon: "🧹", price: 40, stock: 4 },
  ]

  return (
    <>
      <DialogHeader>
        <DialogTitle>Киоск</DialogTitle>
        <DialogDescription>
          Покупайте семена и инструменты для вашей фермы
        </DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex justify-between items-center'>
          <div className='font-medium'>Ваш баланс:</div>
          <Badge
            variant='outline'
            className='flex items-center gap-2 px-3 py-1'
          >
            <Coins className='h-4 w-4 text-yellow-500' />
            <span className='text-lg font-bold'>1250</span>
          </Badge>
        </div>

        <div className='border rounded-md'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left p-2'>Товар</th>
                <th className='text-right p-2'>Цена</th>
                <th className='text-right p-2'>В наличии</th>
                <th className='text-right p-2'>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className='border-b'>
                  <td className='p-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xl'>{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className='text-right p-2'>{item.price}</td>
                  <td className='text-right p-2'>{item.stock}</td>
                  <td className='text-right p-2'>
                    <Button size='sm' variant='outline'>
                      Купить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// Update the FarmGame component to add camera controls help text
export function FarmGame() {
  const [showUI, setShowUI] = useState(true)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [playerPosition, setPlayerPosition] = useState<Position>([0, 0, 0])
  const [nearInteraction, setNearInteraction] =
    useState<InteractionPoint | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogType, setDialogType] = useState<string | null>(null)
  const [plantCounts] = useState({
    carrot: 12,
    potato: 8,
    wheat: 15,
    corn: 10,
    tomato: 5,
    strawberry: 7,
  })
  // Add state for showing instructions
  const [showInstructions, setShowInstructions] = useState(true)

  // Handle interaction key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (nearInteraction) {
        if (
          (e.code === "KeyE" && nearInteraction.key === "E") ||
          (e.code === "KeyM" && nearInteraction.key === "M")
        ) {
          setDialogType(nearInteraction.type)
          setShowDialog(true)
        }
      }

      // Hide instructions when H is pressed
      if (e.code === "KeyH") {
        setShowInstructions(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [nearInteraction])

  return (
    <div className='w-full h-screen relative'>
      <Canvas shadows>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset='sunset' />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <GameWorld
            setNearInteraction={setNearInteraction}
            playerPosition={playerPosition}
          />
          <Player setPlayerPosition={setPlayerPosition} />
        </Suspense>
      </Canvas>

      {/* UI Toggle Button */}
      <button
        className='absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-lg'
        onClick={() => setShowUI(!showUI)}
      >
        {showUI ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Interaction Prompt */}
      {nearInteraction && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg z-40'>
          <p className='font-bold'>
            Нажмите {nearInteraction.key} чтобы {nearInteraction.action}
          </p>
        </div>
      )}

      {/* Game Instructions */}
      {showInstructions && (
        <div className='absolute top-4 left-4 bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-lg z-50 max-w-xs'>
          <div className='font-bold mb-2 flex justify-between items-center'>
            <span>Как играть:</span>
            <span className='text-xs text-muted-foreground'>
              (Нажмите H чтобы скрыть)
            </span>
          </div>
          <div className='text-sm space-y-1'>
            <p>
              <b>Движение:</b> WASD
            </p>
            <p>
              <b>Взаимодействие:</b> E
            </p>
            <p>
              <b>Почта:</b> M
            </p>
            <p>
              <b>Камера:</b> Удерживайте правую кнопку мыши + движение
            </p>
            <p>
              <b>Высота камеры:</b> Стрелки ↑ ↓ или правая кнопка + вертикальное
              движение мыши
            </p>
            <p>
              <b>Зум:</b> Колесо мыши
            </p>
            <p>
              <b>Меню:</b> ESC
            </p>
          </div>
        </div>
      )}

      {/* Player Position */}
      <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-lg z-40 flex items-center gap-2'>
        <User size={16} />
        <span>
          X: {playerPosition[0].toFixed(1)}, Z: {playerPosition[2].toFixed(1)}
        </span>
      </div>

      {/* Game UI */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className='absolute bottom-0 left-0 right-0 p-4 z-40'
          >
            <div className='bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-4 max-w-6xl mx-auto'>
              <div className='flex justify-between items-center mb-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2 bg-white/80 px-3 py-1 rounded-lg'>
                    <Sun className='h-5 w-5 text-yellow-500' />
                    <span className='font-medium'>Лето - День 5</span>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2 px-3 py-1'
                  >
                    <Coins className='h-4 w-4 text-yellow-500' />
                    <span className='text-lg font-bold'>1250</span>
                  </Badge>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowMainMenu(true)}
                  >
                    Меню
                  </Button>
                </div>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
                {Object.entries(plantCounts).map(([plant, count], i) => (
                  <Card key={i} className='bg-white/90'>
                    <CardContent className='p-3 text-center flex flex-col items-center justify-center'>
                      <div className='text-2xl mb-1'>
                        {
                          {
                            carrot: "🥕",
                            potato: "🥔",
                            wheat: "🌾",
                            corn: "🌽",
                            tomato: "🍅",
                            strawberry: "🍓",
                          }[plant]
                        }
                      </div>
                      <div className='text-lg font-bold'>{count}</div>
                      <div className='text-xs text-muted-foreground capitalize'>
                        {plant}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Menu */}
      <AnimatePresence>
        {showMainMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/70 flex items-center justify-center z-50'
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='bg-white rounded-lg p-6 max-w-md w-full'
            >
              <h2 className='text-2xl font-bold mb-6 text-center'>Ферма 3D</h2>

              <div className='space-y-4'>
                <Button
                  className='w-full'
                  onClick={() => setShowMainMenu(false)}
                >
                  Продолжить
                </Button>
                <Button className='w-full' variant='outline'>
                  Сохранить игру
                </Button>
                <Button className='w-full' variant='outline'>
                  Загрузить игру
                </Button>
                <Button className='w-full' variant='outline'>
                  Настройки
                </Button>
                <Button className='w-full' variant='destructive'>
                  Выйти
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Dialogs */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='sm:max-w-[600px]'>
          {dialogType === "greenhouse" && <GreenhouseDialog />}
          {dialogType === "fishing" && <FishingDialog />}
          {dialogType === "stocks" && <StocksDialog />}
          {dialogType === "mail" && <MailDialog />}
          {dialogType === "kiosk" && <KioskDialog />}
          {dialogType === "house" && <HouseDialog />}
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Update the GameWorld component to include world boundaries
function GameWorld({
  setNearInteraction,
  playerPosition,
}: {
  setNearInteraction: (point: InteractionPoint | null) => void
  playerPosition: Position
}) {
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

// Create a new WorldBoundaries component
function WorldBoundaries() {
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

// Create a Fence component
function Fence({
  position,
  rotation,
  length,
}: {
  position: Position
  rotation: Rotation
  length: number
}) {
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

// Create a Mountains component
function Mountains({
  position,
  rotation = [0, 0, 0] as Rotation,
}: {
  position: Position
  rotation?: Rotation
}) {
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

function Buildings({
  setNearInteraction,
  playerPosition,
}: {
  setNearInteraction: (point: InteractionPoint | null) => void
  playerPosition: Position
}) {
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
      position: [10, 0, 10] as Position,
      door: [10, 0, 12] as Position,
    },
    stockExchange: {
      position: [15, 0, -15] as Position,
      door: [13.7, 0, -16.7] as Position,
    },
    fishingPond: {
      position: [-20, 0, 20] as Position,
      dock: [-15.5, 0, 17.6] as Position,
    },
    mailbox: {
      position: [2.1, 0, -6] as Position,
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

      {/* Kiosk */}
      <group position={locations.kiosk.position} rotation-y={-Math.PI / 6}>
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
    </group>
  )
}

// Create a Greenhouse component (3D model) with improved design
function Greenhouse() {
  return (
    <group>
      {/* Base with foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.2, 10.4]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>

      {/* Improved base with more realistic proportions */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 10]} />
        <meshStandardMaterial color='#FFFFFF' transparent opacity={0.6} />
      </mesh>

      {/* Greenhouse Roof - dome shaped with improved materials */}
      <mesh
        position={[0, 4, 0]}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
        castShadow
      >
        <cylinderGeometry args={[4, 4, 10, 32, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color='#FFFFFF'
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Side metal frame structures */}
      {[-3.95, 3.95].map((x, i) => (
        <mesh
          key={`greenhouse-roof-edge-${i}`}
          position={[x, 4.1, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.2, 10]} />
          <meshStandardMaterial
            color='#555555'
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Enhanced metal frame structure */}
      {/* Vertical supports */}
      {[-3.91, -2, 0, 2, 3.91].map((x, i, arr) => (
        <group key={`vs-${i}`}>
          <mesh position={[x, 2, -5]} castShadow>
            <boxGeometry
              args={[
                0.2 + (i === 0 || i === arr.length - 1 ? 0.01 : 0),
                4,
                0.2,
              ]}
            />
            <meshStandardMaterial
              color='#555555'
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[x, i !== 2 ? 2 : 3.5, 5]} castShadow>
            <boxGeometry args={[0.2, i !== 2 ? 4 : 1, 0.2]} />
            <meshStandardMaterial
              color='#555555'
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Horizontal supports */}
      {[-4.9, -2.5, 0, 2.5, 4.9].map((z, i, arr) => (
        <mesh
          key={`hs-${i}`}
          position={[
            0,
            4.1,
            z + (i === 0 ? -0.1 : i === arr.length - 1 ? 0.1 : 0),
          ]}
          castShadow
        >
          <boxGeometry args={[8, 0.2, 0.2]} />
          <meshStandardMaterial
            color='#555555'
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Improved Door with handle */}
      <mesh position={[0, 1.5, 5.01]} castShadow>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color='#4d2600' />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.5, 1.5, 5.07]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Plants inside with more variety */}
      <group position={[0, 0.5, 0]}>
        {/* Add three types of plants for visual variety */}
        {[-2.5, -1, 0.5, 2].map((x, i) => {
          // Treat this as component
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const radius = useMemo(() => 0.4 + Math.random() * 0.2, [])

          return (
            <group key={`plant-${i}`} position={[x, 0, -2]}>
              <mesh position={[0, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
                <meshStandardMaterial color='#8B4513' />
              </mesh>
              <mesh position={[0, 0.6, 0]} castShadow>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#2e8b57" : "#3cb371"}
                />
              </mesh>
            </group>
          )
        })}

        {/* Add a second row of plants */}
        {[-2, 0, 2].map((x, i) => {
          // Treat this as component
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const radius = useMemo(() => 0.4 + Math.random() * 0.2, [])

          return (
            <group key={`plant2-${i}`} position={[x, 0, -3.5]}>
              <mesh position={[0, 0.2, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
                <meshStandardMaterial color='#8B4513' />
              </mesh>
              <mesh position={[0, 0.6, 0]} castShadow>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#228b22" : "#32cd32"}
                />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* Add gardening tools inside */}
      <mesh position={[3, 0.5, -4]} rotation-y={Math.PI / 4} castShadow>
        <boxGeometry args={[0.1, 1.5, 0.1]} />
        <meshStandardMaterial color='#8B4513' />
      </mesh>
      <mesh position={[3, 1.3, -4]} rotation-y={Math.PI / 4} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color='#A52A2A' />
      </mesh>
    </group>
  )
}

// Create a StockExchange component with improved design
function StockExchange() {
  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.2, 8.4]} />
        <meshStandardMaterial color='#505050' />
      </mesh>

      {/* Building base with enhanced materials */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 8]} />
        <meshStandardMaterial color='#f0f0f0' metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Improved roof with detail */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[8.1, 0.5, 8.1]} />
        <meshStandardMaterial color='#616161' />
      </mesh>

      {/* Roof edge detail */}
      <mesh position={[0, 4.26, 0]} castShadow>
        <boxGeometry args={[8.4, 0.1, 8.4]} />
        <meshStandardMaterial color='#424242' />
      </mesh>

      {/* Windows with better materials */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={`window-front-${i}`} position={[x, 2, 4.1]} castShadow>
          <boxGeometry args={[2, 2, 0.15]} />
          <meshStandardMaterial
            color='#ADD8E6'
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={`window-back-${i}`} position={[x, 2, -4.1]} castShadow>
          <boxGeometry args={[2, 2, 0.2]} />
          <meshStandardMaterial
            color='#ADD8E6'
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((z, i) => (
        <mesh key={`window-right-${i}`} position={[4.1, 2, z]} castShadow>
          <boxGeometry args={[0.2, 2, 2]} />
          <meshStandardMaterial
            color='#ADD8E6'
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-3, 0, 3].map((z, i) =>
        i === 1 ? null : (
          <mesh key={`window-left-${i}`} position={[-4.1, 2, z]} castShadow>
            <boxGeometry args={[0.2, 2, 2]} />
            <meshStandardMaterial
              color='#ADD8E6'
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
        )
      )}

      {/* Right window frames */}
      {[-3, 0, 3].map((x, i) => (
        <group key={`frame-right-${i}`}>
          <mesh position={[x, 2, 4.075]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 3.05, 4.075]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 1, 4.075]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x - 1, 2, 4.075]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x + 1, 2, 4.075]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
        </group>
      ))}
      {/* Left window frames */}
      {[-3, 0, 3].map((x, i) => (
        <group key={`frame-left-${i}`}>
          <mesh position={[x, 2, -4.1]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 3.05, -4.1]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x, 1, -4.1]} castShadow>
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x - 1, 2, -4.1]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh position={[x + 1, 2, -4.1]} castShadow>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
        </group>
      ))}
      {/* Front window frames */}
      {[-3, 0, 3].map((z, i) =>
        i == 1 ? null : (
          <group key={`frame-front-${i}`}>
            <mesh
              position={[-4.1, 2, z]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[2.1, 0.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 3.05, z]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[2.1, 0.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 1, z]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[2.1, 0.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 2, z - 1]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.1, 2.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
            <mesh
              position={[-4.1, 2, z + 1]}
              rotation={[0, Math.PI / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.1, 2.1, 0.25]} />
              <meshStandardMaterial color='#444' />
            </mesh>
          </group>
        )
      )}
      {/* Back window frames */}
      {[-3, 0, 3].map((z, i) => (
        <group key={`frame-back-${i}`}>
          <mesh
            position={[4.1, 2, z]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 3.05, z]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 1, z]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[2.1, 0.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 2, z - 1]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
          <mesh
            position={[4.1, 2, z + 1]}
            rotation={[0, Math.PI / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color='#444' />
          </mesh>
        </group>
      ))}

      {/* Improved door with frame */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color='#4d2600' />
      </mesh>

      {/* Door frame */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2.2, 3.1, 0.1]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Door handle */}
      <mesh
        position={[-4.1, 1.5, 0.7]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
      >
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Create a House component with improved design
function House() {
  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.1, 6.4]} />
        <meshStandardMaterial color='#555' />
      </mesh>

      {/* Base with better texture */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[6, 3, 6]} />
        <meshStandardMaterial color='#f0f0f0' roughness={0.8} />
      </mesh>

      {/* Improved roof */}
      <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4.2, 2.2, 4]} />
        <meshStandardMaterial color='#8B4513' roughness={0.7} />
      </mesh>

      {/* Chimney */}
      <mesh position={[2, 4.5, 0]} castShadow>
        <boxGeometry args={[0.8, 2, 0.8]} />
        <meshStandardMaterial color='#B22222' roughness={0.9} />
      </mesh>

      {/* Chimney top */}
      <mesh position={[2, 5.6, 0]} castShadow>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color='#8B0000' />
      </mesh>

      {/* Enhanced door with frame */}
      <mesh position={[0, 1.5, 3.1]} castShadow>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial color='#4d2600' />
      </mesh>

      {/* Door frame */}
      <mesh position={[0, 1.5, 3.1]} castShadow>
        <boxGeometry args={[2.2, 3.1, 0.1]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.7, 1.5, 3.2]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color='#C0C0C0' metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Windows with frames */}
      {/* Left windows */}
      <mesh position={[3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>
      <mesh position={[3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Right windows */}
      <mesh position={[-3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[-3, 2, 1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>
      <mesh position={[-3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[-3, 2, -1]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Back window */}
      <mesh position={[0, 2, -3]} castShadow>
        <boxGeometry args={[1.5, 1.5, 0.2]} />
        <meshStandardMaterial color='#ADD8E6' metalness={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2, -3]} castShadow>
        <boxGeometry args={[1.6, 1.6, 0.05]} />
        <meshStandardMaterial color='#333' />
      </mesh>

      {/* Flower pots */}
      <group position={[-2, 0.3, 3.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
          <meshStandardMaterial color='#A0522D' />
        </mesh>
        {/* Flowers */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color='#FF6347' />
        </mesh>
      </group>
    </group>
  )
}

// Update the Mailbox component with improved design
function Mailbox({
  position = [0, 0, 0] as Position,
}: {
  position?: Position
}) {
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

// Create a Kiosk component with improved design
function Kiosk() {
  return (
    <group>
      {/* Concrete platform foundation */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[8, 0.4, 8]} />
        <meshStandardMaterial color='#9e9e9e' />
      </mesh>

      {/* Main structure */}
      <group position={[0, 2, 0]}>
        {/* Floor */}
        <mesh position={[0, -1.6, 0]} receiveShadow>
          <boxGeometry args={[6.9, 0.2, 6]} />
          <meshStandardMaterial color='#8d6e63' />
        </mesh>

        {/* Back wall */}
        <mesh position={[0, 0, -3.2]} castShadow>
          <boxGeometry args={[7, 3.6, 0.2]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Left wall */}
        <mesh position={[-3.4, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 3.6, 6.6]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Right wall */}
        <mesh position={[3.4, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 3.6, 6.6]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Front counter - only bottom half */}
        <mesh position={[0, -0.9, 3.2]} castShadow>
          <boxGeometry args={[7, 1.8, 0.3]} />
          <meshStandardMaterial color='#e0e0e0' />
        </mesh>

        {/* Counter top */}
        <mesh position={[0, 0.1, 3.2]} castShadow>
          <boxGeometry args={[6.9, 0.2, 0.5]} />
          <meshStandardMaterial color='#5d4037' />
        </mesh>

        {/* Interior back wall panel */}
        <mesh position={[0, 0, -3.1]} castShadow>
          <boxGeometry args={[6.7, 3.4, 0.1]} />
          <meshStandardMaterial color='#bbdefb' />
        </mesh>

        {/* Simple roof */}
        <mesh position={[0, 1.9, 0]} castShadow>
          <boxGeometry args={[7.4, 0.2, 7.4]} />
          <meshStandardMaterial color='#795548' />
        </mesh>
      </group>

      {/* Simple striped awning - front only, no overlap */}
      <group position={[0, 4, 1.6]}>
        {/* Awning base frame */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[7.8, 0.2, 3.8]} />
          <meshStandardMaterial color='#795548' />
        </mesh>

        {/* Colored awning stripes */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <mesh
            key={`awning-${i}`}
            position={[0, 0.11, -1.65 + i * 0.45]}
            castShadow
          >
            <boxGeometry args={[7.6, 0.1, 0.4]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#f44336" : "#ffffff"} />
          </mesh>
        ))}

        {/* Awning front trim */}
        <mesh position={[0, 0, 1.8]} castShadow>
          <boxGeometry args={[7.9, 0.3, 0.3]} />
          <meshStandardMaterial color='#5d4037' />
        </mesh>
      </group>

      {/* Simple shop sign */}
      <mesh position={[0, 4.8, 3.5]} castShadow>
        <boxGeometry args={[4.4, 1.2, 0.2]} />
        <meshStandardMaterial color='#4a148c' />
      </mesh>
      <mesh position={[0, 4.8, 3.6]} castShadow>
        <boxGeometry args={[4, 0.9, 0.1]} />
        <meshStandardMaterial color='#f9a825' />

        <Text position={[0, 0, 0.1]} fontSize={0.7} color='#f9a825'>
          DAMSHOP
        </Text>
      </mesh>

      {/* Cash register */}
      <group position={[2.2, 2.35, 3]} castShadow>
        <mesh>
          <boxGeometry args={[0.9, 0.5, 0.6]} />
          <meshStandardMaterial color='#455a64' />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.7, 0.2, 0.4]} />
          <meshStandardMaterial color='#263238' />
        </mesh>
      </group>

      {/* Interior shelving */}
      {/* Back shelf */}
      <mesh position={[0, 2.6, -2.4]} castShadow>
        <boxGeometry args={[6.5, 0.1, 1.2]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      <mesh position={[0, 1.2, -2.4]} castShadow>
        <boxGeometry args={[6.5, 0.1, 1.2]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      {/* Side shelves */}
      <mesh position={[-2.8, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[5, 0.1, 1]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      <mesh position={[2.8, 1.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[5, 0.1, 1]} />
        <meshStandardMaterial color='#a1887f' />
      </mesh>

      {/* Simple product displays - bigger */}
      {/* Seed packets on back shelf */}
      {[-2, 0, 2].map((x, i) => (
        <group key={`seed-${i}`} position={[x, 2.8, -2.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.6, 0.08]} />
            <meshStandardMaterial
              color={i === 0 ? "#f44336" : i === 1 ? "#4caf50" : "#2196f3"}
            />
          </mesh>
        </group>
      ))}

      {/* Baskets on lower shelf */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <group key={`basket-${i}`} position={[x, 1.4, -2.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.4, 0.6, 16]} />
            <meshStandardMaterial color='#d7ccc8' />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry
              args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]}
            />
            <meshStandardMaterial
              color={i === 0 ? "#795548" : i === 1 ? "#fdd835" : "#558b2f"}
            />
          </mesh>
        </group>
      ))}

      {/* Garden tools on side shelf */}
      <group position={[-2.8, 2.2, 0]}>
        <mesh rotation={[0.2, Math.PI / 2, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.4, 8]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        <mesh
          position={[0, 0, -1.2]}
          rotation={[0.2, 0, Math.PI / 2]}
          castShadow
        >
          <boxGeometry args={[0.6, 0.15, 0.6]} />
          <meshStandardMaterial color='#607d8b' />
        </mesh>
      </group>

      {/* Watering can */}
      <group position={[2.8, 2.2, 1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.8, 16]} />
          <meshStandardMaterial color='#42a5f5' />
        </mesh>
        <mesh
          position={[-0.5, 0.2, 0]}
          rotation={[0, 0, Math.PI / 10]}
          castShadow
        >
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
          <meshStandardMaterial color='#42a5f5' />
        </mesh>
      </group>

      {/* Simple decorative plant */}
      <group position={[-2, 2.35, 2.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
          <meshStandardMaterial color='#a1887f' />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color='#388e3c' />
        </mesh>
      </group>

      {/* Interior light - simple ceiling light */}
      <mesh position={[0, 3.6, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
        <meshStandardMaterial
          color='#f5f5f5'
          emissive='#f5f5f5'
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

// Create a Terrain component
function Terrain() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[80, 80, 64, 64]} />
      <meshStandardMaterial
        color='#43a047'
        wireframe={false}
        displacementMap={null}
        displacementScale={0}
      />
    </mesh>
  )
}

// Create a Ground component
function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color='#795548' />
    </mesh>
  )
}

// Create a FishingPond component
function FishingPond() {
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* Water surface with realistic color and slight movement */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial
          color='#1e88e5'
          transparent={true}
          opacity={0.8}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Pond edge */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <ringGeometry args={[4.8, 5.2, 32]} />
        <meshStandardMaterial color='#795548' />
      </mesh>

      {/* Decorative rocks around the pond */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = (i / 6) * Math.PI * 2
        const x = Math.cos(angle) * 5.2
        const z = Math.sin(angle) * 5.2
        // Treat this as component
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const scale = useMemo(() => 0.3 + Math.random() * 0.4, [])

        return (
          <mesh key={`rock-${i}`} position={[x, 0.2, z]} castShadow>
            <dodecahedronGeometry args={[scale, 0]} />
            <meshStandardMaterial color='#777777' roughness={0.8} />
          </mesh>
        )
      })}

      {/* Fishing dock */}
      <group position={[0, 0.1, 5]}>
        {/* Dock platform */}
        <mesh position={[0, 0.15, -1.5]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.2, 3]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>

        {/* Dock supports */}
        <mesh position={[-1.2, -0.15, -0.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
          <meshStandardMaterial color='#5D4037' />
        </mesh>
        <mesh position={[1.2, -0.15, -0.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
          <meshStandardMaterial color='#5D4037' />
        </mesh>
        <mesh position={[-1.2, -0.15, -2.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
          <meshStandardMaterial color='#5D4037' />
        </mesh>
        <mesh position={[1.2, -0.15, -2.5]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
          <meshStandardMaterial color='#5D4037' />
        </mesh>
      </group>

      {/* Fishing rod leaning on the dock */}
      <group position={[1.2, 0.6, 4]}>
        <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.03, 0.01, 3, 8]} />
          <meshStandardMaterial color='#8B4513' />
        </mesh>
        {/* Fishing line */}
        <mesh position={[1.5, -1.5, 0]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color='#ff5722' />
        </mesh>
      </group>

      {/* Water lilies for decoration */}
      {[0, 1, 2].map(i => {
        const x = -2 + i * 2
        // Treat this as component
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const z = useMemo(() => -1 + Math.random() * 2, [])

        return (
          <group key={`lily-${i}`} position={[x, 0.1, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.4, 16]} />
              <meshStandardMaterial color='#4CAF50' />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.15, 16]} />
              <meshStandardMaterial color='#E91E63' />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
