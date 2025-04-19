"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SEASONS } from "@/constants/seasons"
import { useGameStore } from "@/store/game-store"
import { Environment } from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react"
import {
  BarnDialog,
  FishingDialog,
  GreenhouseDialog,
  HouseDialog,
  KioskDialog,
  MailDialog,
  StocksDialog,
} from "./dialog"

import { Fish } from "@/types/fish"
import { Sky } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import type { CanvasProps } from "@react-three/fiber"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleHelp,
  Coins,
  Menu,
  Sun,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Player } from "./player"
import { Position } from "./types"
import { InteractionPoint } from "./types/interaction-point"
import { GameWorld } from "./world/game-world"

// Mobile device detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

function SkyController({
  isNight,
  onTransitionComplete,
}: {
  isNight: boolean
  onTransitionComplete: () => void
}) {
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([
    100, 20, 100,
  ])
  const [turbidity, setTurbidity] = useState(10)
  const [rayleigh, setRayleigh] = useState(2)
  const [mieCoefficient, setMieCoefficient] = useState(0.005)
  const [mieDirectionalG, setMieDirectionalG] = useState(0.8)
  const [animationCompleted, setAnimationCompleted] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const prevIsNightRef = useRef(isNight)

  useEffect(() => {
    if (prevIsNightRef.current !== isNight) {
      setShouldAnimate(true)
      setAnimationCompleted(false)
    }

    prevIsNightRef.current = isNight
  }, [isNight])

  useEffect(() => {
    if (!shouldAnimate) return

    let animationId = 0
    let progress = 0
    const duration = 3 // seconds
    const fps = 60
    const totalFrames = duration * fps

    // Day position values
    const dayPosition: [number, number, number] = [100, 20, 100]
    const dayTurbidity = 10
    const dayRayleigh = 2
    const dayMieCoefficient = 0.005
    const dayMieDirectionalG = 0.8

    // Night position values - use higher sun position for a blue night sky instead of black
    const nightPosition: [number, number, number] = [100, -5, 100]
    const nightTurbidity = 20
    const nightRayleigh = 4 // Higher rayleigh for bluer night
    const nightMieCoefficient = 0.003
    const nightMieDirectionalG = 0.7

    const startPosition = isNight ? dayPosition : nightPosition
    const endPosition = isNight ? nightPosition : dayPosition

    const startTurbidity = isNight ? dayTurbidity : nightTurbidity
    const endTurbidity = isNight ? nightTurbidity : dayTurbidity

    const startRayleigh = isNight ? dayRayleigh : nightRayleigh
    const endRayleigh = isNight ? nightRayleigh : dayRayleigh

    const startMieCoefficient = isNight
      ? dayMieCoefficient
      : nightMieCoefficient
    const endMieCoefficient = isNight ? nightMieCoefficient : dayMieCoefficient

    const startMieDirectionalG = isNight
      ? dayMieDirectionalG
      : nightMieDirectionalG
    const endMieDirectionalG = isNight
      ? nightMieDirectionalG
      : dayMieDirectionalG

    const animate = () => {
      progress += 1 / totalFrames

      if (progress >= 1) {
        progress = 1
        cancelAnimationFrame(animationId)

        // Only call onTransitionComplete once and reset animation flag
        if (!animationCompleted) {
          setAnimationCompleted(true)
          setShouldAnimate(false)
          onTransitionComplete()
        }
      }

      // Apply easing (smooth transition)
      const eased = easeInOutCubic(progress)

      // Interpolate values
      const newX =
        startPosition[0] + (endPosition[0] - startPosition[0]) * eased
      const newY =
        startPosition[1] + (endPosition[1] - startPosition[1]) * eased
      const newZ =
        startPosition[2] + (endPosition[2] - startPosition[2]) * eased

      const newTurbidity =
        startTurbidity + (endTurbidity - startTurbidity) * eased
      const newRayleigh = startRayleigh + (endRayleigh - startRayleigh) * eased
      const newMieCoefficient =
        startMieCoefficient + (endMieCoefficient - startMieCoefficient) * eased
      const newMieDirectionalG =
        startMieDirectionalG +
        (endMieDirectionalG - startMieDirectionalG) * eased

      setSunPosition([newX, newY, newZ])
      setTurbidity(newTurbidity)
      setRayleigh(newRayleigh)
      setMieCoefficient(newMieCoefficient)
      setMieDirectionalG(newMieDirectionalG)

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isNight, onTransitionComplete, animationCompleted, shouldAnimate])

  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }

  return (
    <Sky
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={mieDirectionalG}
    />
  )
}

export function FarmGame() {
  const gameStore = useGameStore(state => state)

  const [showUI, setShowUI] = useState(true)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [playerPosition, setPlayerPosition] = useState<Position>([0, 0, 0])
  const [isNight, setIsNight] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)
  const [completedDayAdvance, setCompletedDayAdvance] = useState(false)
  const [nearInteraction, setNearInteraction] = useState<
    InteractionPoint | undefined
  >(undefined)
  const [dialogType, setDialogType] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [inventory, setInventory] = useState<Fish[]>([])
  const { toast } = useToast()
  const hasMounted = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Mobile control state
  const isMobile = useIsMobile()
  const [showMobileControls, setShowMobileControls] = useState(true)
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number
    y: number
  } | null>(null)
  const [joystickActive, setJoystickActive] = useState(false)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const joystickAreaRef = useRef<HTMLDivElement>(null)
  const isPressing = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  // Keyboard movement simulation functions for mobile
  const simulateKeyDown = useCallback((key: string) => {
    const event = new KeyboardEvent("keydown", { code: key })
    window.dispatchEvent(event)
  }, [])

  const simulateKeyUp = useCallback((key: string) => {
    const event = new KeyboardEvent("keyup", { code: key })
    window.dispatchEvent(event)
  }, [])

  // Touch controls for mobile
  useEffect(() => {
    if (!isMobile) return

    const joystickArea = joystickAreaRef.current
    if (!joystickArea) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const rect = joystickArea.getBoundingClientRect()
      setTouchStartPos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
      setJoystickActive(true)
      setJoystickPos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickActive || !touchStartPos) return

      const touch = e.touches[0]
      const rect = joystickArea.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top

      // Calculate distance and angle from center
      const deltaX = touchX - touchStartPos.x
      const deltaY = touchY - touchStartPos.y
      const distance = Math.min(
        Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        50
      )
      const angle = Math.atan2(deltaY, deltaX)

      // Set joystick position with maximum radius constraint
      const limitedX = touchStartPos.x + distance * Math.cos(angle)
      const limitedY = touchStartPos.y + distance * Math.sin(angle)
      setJoystickPos({ x: limitedX, y: limitedY })

      // Handle movement based on joystick position
      const threshold = 10

      // Reset all directions first
      if (isPressing.current.up) {
        simulateKeyUp("KeyW")
        isPressing.current.up = false
      }
      if (isPressing.current.down) {
        simulateKeyUp("KeyS")
        isPressing.current.down = false
      }
      if (isPressing.current.left) {
        simulateKeyUp("KeyA")
        isPressing.current.left = false
      }
      if (isPressing.current.right) {
        simulateKeyUp("KeyD")
        isPressing.current.right = false
      }

      // Apply new directions
      if (deltaY < -threshold) {
        simulateKeyDown("KeyW")
        isPressing.current.up = true
      }
      if (deltaY > threshold) {
        simulateKeyDown("KeyS")
        isPressing.current.down = true
      }
      if (deltaX < -threshold) {
        simulateKeyDown("KeyA")
        isPressing.current.left = true
      }
      if (deltaX > threshold) {
        simulateKeyDown("KeyD")
        isPressing.current.right = true
      }
    }

    const handleTouchEnd = () => {
      setJoystickActive(false)
      setTouchStartPos(null)

      // Reset all pressed keys
      if (isPressing.current.up) {
        simulateKeyUp("KeyW")
        isPressing.current.up = false
      }
      if (isPressing.current.down) {
        simulateKeyUp("KeyS")
        isPressing.current.down = false
      }
      if (isPressing.current.left) {
        simulateKeyUp("KeyA")
        isPressing.current.left = false
      }
      if (isPressing.current.right) {
        simulateKeyUp("KeyD")
        isPressing.current.right = false
      }
    }

    joystickArea.addEventListener("touchstart", handleTouchStart)
    joystickArea.addEventListener("touchmove", handleTouchMove)
    joystickArea.addEventListener("touchend", handleTouchEnd)

    return () => {
      joystickArea.removeEventListener("touchstart", handleTouchStart)
      joystickArea.removeEventListener("touchmove", handleTouchMove)
      joystickArea.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, joystickActive, touchStartPos, simulateKeyDown, simulateKeyUp])

  useEffect(() => {
    const timer = setTimeout(() => {
      hasMounted.current = true
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Optimize the 3D rendering settings
  const canvasProps = useMemo<CanvasProps>(
    () => ({
      shadows: true,
      dpr: [1, 2] as [number, number],
      gl: {
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      },
      camera: { fov: 60, near: 0.1, far: 200 },
    }),
    []
  )

  useEffect(() => {
    audioRef.current = new Audio("/audio/01.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.3

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current && hasInteracted) {
      if (isMuted) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {})
      }
    }
  }, [isMuted, hasInteracted])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault()
      if (nearInteraction) {
        if (
          (e.code === "KeyE" && nearInteraction.key === "E") ||
          (e.code === "KeyM" && nearInteraction.key === "M")
        ) {
          setDialogType(nearInteraction.type)
          setShowDialog(true)
        }
      }

      if (e.code === "KeyM") {
        setDialogType("mail")
        setShowDialog(true)
      }
      if (e.code === "KeyH") {
        setShowInstructions(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [nearInteraction])

  const getInventoryCount = useCallback(() => inventory.length, [inventory])

  const handleFishCatch = useCallback(
    (fish: Fish) => {
      setInventory(prev => [...prev, fish])
      toast({
        title: "Рыба поймана!",
        description: `Вы поймали ${fish.name}!`,
      })
    },
    [toast]
  )

  const handleTransitionComplete = useCallback(() => {
    if (!hasMounted.current) return

    setIsTransitioning(false)

    if (!isNight && !completedDayAdvance && isSleeping) {
      gameStore.setNextDay()
      setCompletedDayAdvance(true)
    }

    if (!isNight) {
      setIsSleeping(false)
    }
  }, [isNight, gameStore, completedDayAdvance, isSleeping])

  const handleSleep = useCallback(() => {
    if (!isTransitioning && !isSleeping) {
      setIsSleeping(true)
      setIsTransitioning(true)
      setCompletedDayAdvance(false)
      setIsNight(true)

      setTimeout(() => {
        setIsNight(false)
      }, 3000)
    }
  }, [isTransitioning, isSleeping])

  const handleInteractionButtonClick = useCallback(() => {
    if (nearInteraction) {
      if (nearInteraction.key === "E" || nearInteraction.key === "M") {
        setDialogType(nearInteraction.type)
        setShowDialog(true)
      }
    }
  }, [nearInteraction])

  return (
    <div className='w-full h-screen relative'>
      <Canvas {...canvasProps}>
        <Suspense fallback={null}>
          <SkyController
            isNight={isNight}
            onTransitionComplete={handleTransitionComplete}
          />
          <Environment preset={isNight ? "night" : "sunset"} />
          <ambientLight intensity={isNight ? 0.3 : 0.5} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={isNight ? 0.4 : 1}
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

      {/* UI Toggle Button - Adjusted position for mobile */}
      <button
        className={`absolute ${
          isMobile ? "top-2 right-2" : "top-4 right-4"
        } z-50 bg-white/80 p-2 rounded-full shadow-lg`}
        onClick={() => setShowUI(!showUI)}
      >
        {showUI ? (
          <X size={isMobile ? 20 : 24} />
        ) : (
          <Menu size={isMobile ? 20 : 24} />
        )}
      </button>

      {/* Sound Toggle Button - Adjusted for mobile */}
      <button
        onClick={() => {
          setHasInteracted(true)
          setIsMuted(!isMuted)
        }}
        className={`absolute ${
          isMobile ? "top-2 left-2" : "top-4 left-4"
        } bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2 rounded-xl shadow-lg z-50 border border-white/20 hover:from-white/80 hover:to-white/50 transition-all duration-200`}
      >
        {isMuted ? (
          <VolumeX size={isMobile ? 14 : 16} className='text-gray-700' />
        ) : (
          <Volume2 size={isMobile ? 14 : 16} className='text-gray-700' />
        )}
      </button>

      {/* Game Instructions Toggle Button - Adjusted for mobile */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className={`absolute ${
          isMobile ? "top-2 left-12" : "top-4 left-16"
        } bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2 rounded-xl shadow-lg z-50 border border-white/20 hover:from-white/80 hover:to-white/50 transition-all duration-200`}
      >
        <CircleHelp size={isMobile ? 14 : 16} className='text-gray-700' />
      </button>

      {/* Player Position - Hidden on mobile to save space */}
      {!isMobile && (
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-lg z-40 flex items-center gap-2'>
          <User size={16} />
          <span>
            X: {playerPosition[0].toFixed(1)}, Z: {playerPosition[2].toFixed(1)}
          </span>
        </div>
      )}

      {/* Mobile touch controls */}
      {isMobile && showMobileControls && (
        <>
          {/* Virtual joystick for movement */}
          <div
            ref={joystickAreaRef}
            className='absolute bottom-32 left-6 w-32 h-32 bg-white/30 backdrop-blur-sm rounded-full z-50 touch-none'
          >
            {joystickActive && touchStartPos && (
              <div
                className='absolute w-16 h-16 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white/70'
                style={{
                  left: joystickPos.x,
                  top: joystickPos.y,
                }}
              />
            )}
            {!joystickActive && (
              <div className='absolute inset-0 flex items-center justify-center opacity-70'>
                <div className='grid grid-cols-3 grid-rows-3 w-full h-full'>
                  <div className='col-start-2 row-start-1 flex justify-center'>
                    <ArrowUp size={20} />
                  </div>
                  <div className='col-start-1 row-start-2 flex items-center'>
                    <ArrowLeft size={20} />
                  </div>
                  <div className='col-start-3 row-start-2 flex items-center justify-end'>
                    <ArrowRight size={20} />
                  </div>
                  <div className='col-start-2 row-start-3 flex justify-center'>
                    <ArrowDown size={20} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile action button - for interactions */}
          {nearInteraction && (
            <button
              onClick={handleInteractionButtonClick}
              className='absolute bottom-32 right-6 w-16 h-16 bg-white/70 backdrop-blur-md rounded-full z-50 flex items-center justify-center shadow-lg border-2 border-white/80 active:bg-white/90'
            >
              <span className='text-lg font-bold'>{nearInteraction.key}</span>
            </button>
          )}

          {/* Mobile toggle for controls visibility */}
          <button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className='absolute bottom-4 right-4 p-2 bg-white/70 backdrop-blur-sm rounded-lg z-50'
          >
            {showMobileControls ? "Hide Controls" : "Show Controls"}
          </button>
        </>
      )}

      {/* Game UI - Adjusted layout for mobile */}
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
                    <Sun
                      className={`${
                        isMobile ? "h-4 w-4" : "h-5 w-5"
                      } text-yellow-500`}
                    />
                    <span
                      className={`${
                        isMobile ? "text-sm" : "text-base"
                      } font-medium`}
                    >
                      {SEASONS[gameStore.seasons]} - День {gameStore.days}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2 px-3 py-1'
                  >
                    <Coins
                      className={`${
                        isMobile ? "h-3 w-3" : "h-4 w-4"
                      } text-yellow-500`}
                    />
                    <span
                      className={`${
                        isMobile ? "text-base" : "text-lg"
                      } font-bold`}
                    >
                      {gameStore.moneys}
                    </span>
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
                {Object.entries(gameStore.resources).map(
                  ([plant, count], i) => (
                    <Card key={i} className='bg-white/90'>
                      <CardContent
                        className={`p-3 text-center flex flex-col items-center justify-center ${
                          isMobile ? "py-2" : ""
                        }`}
                      >
                        <div
                          className={`${
                            isMobile ? "text-xl" : "text-2xl"
                          } mb-1`}
                        >
                          {
                            {
                              Марковка: "🥕",
                              Картошка: "🥔",
                              Пшеница: "🌾",
                              Кукуруза: "🌽",
                              Томаты: "🍅",
                              Клубника: "🍓",
                            }[plant]
                          }
                        </div>
                        <div
                          className={`${
                            isMobile ? "text-base" : "text-lg"
                          } font-bold`}
                        >
                          {count}
                        </div>
                        <div className='text-xs text-muted-foreground capitalize'>
                          {plant}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Menu - Adjusted for mobile */}
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
              className={`bg-white rounded-lg p-6 ${
                isMobile ? "max-w-[90%]" : "max-w-md"
              } w-full`}
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

      {/* Interaction Dialogs - Adjusted for mobile */}
      <Dialog
        open={showDialog}
        onOpenChange={open => {
          // Предотвращаем автоматическое закрытие диалога рыбалки
          if (!open && dialogType === "fishing") {
            return
          }
          setShowDialog(open)
          if (!open) {
            setDialogType(null)
          }
        }}
      >
        <DialogContent
          className={`${isMobile ? "w-[95%] p-4" : "sm:max-w-[600px]"}`}
        >
          {dialogType === "greenhouse" && <GreenhouseDialog />}
          {dialogType === "fishing" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Рыбалка{" "}
                  {getInventoryCount() > 0 ? `(${getInventoryCount()})` : ""}
                </DialogTitle>
              </DialogHeader>
              <FishingDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onCatch={handleFishCatch}
              />
            </>
          )}
          {dialogType === "stocks" && <StocksDialog />}
          {dialogType === "mail" && <MailDialog />}
          {dialogType === "kiosk" && <KioskDialog />}
          {dialogType === "house" && (
            <HouseDialog
              onSleep={handleSleep}
              isTransitioning={isTransitioning}
            />
          )}
          {dialogType === "barn" && <BarnDialog />}
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Instructions - Adjusted for mobile */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${
              isMobile ? "top-12 left-2" : "top-14 left-4"
            } bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2.5 rounded-xl shadow-lg z-50 ${
              isMobile ? "max-w-[200px]" : "max-w-[220px]"
            } text-xs border border-white/20`}
          >
            <div className='font-medium mb-2 flex justify-between items-center border-b border-white/20 pb-1.5'>
              <span className='text-[11px] uppercase tracking-wider text-gray-700'>
                Управление
              </span>
              <button
                onClick={() => setShowInstructions(false)}
                className='text-gray-500 hover:text-gray-700 transition-colors p-0.5 rounded-full hover:bg-white/50'
              >
                <X size={12} />
              </button>
            </div>
            <div className='space-y-1 text-[10px]'>
              <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
                <p className='flex items-center gap-1.5'>
                  <span className='bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700'>
                    WASD
                  </span>
                  <span className='text-gray-600'>движение</span>
                </p>
                <p className='flex items-center gap-1.5'>
                  <span className='bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700'>
                    E
                  </span>
                  <span className='text-gray-600'>действие</span>
                </p>
                <p className='flex items-center gap-1.5'>
                  <span className='bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700'>
                    M
                  </span>
                  <span className='text-gray-600'>почта</span>
                </p>
                <p className='flex items-center gap-1.5'>
                  <span className='bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700'>
                    ПКМ
                  </span>
                  <span className='text-gray-600'>камера</span>
                </p>
                <p className='flex items-center gap-1.5'>
                  <span className='bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700'>
                    ↑↓
                  </span>
                  <span className='text-gray-600'>высота</span>
                </p>
                <p className='flex items-center gap-1.5'>
                  <span className='bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700'>
                    ESC
                  </span>
                  <span className='text-gray-600'>меню</span>
                </p>
              </div>
              {isMobile && (
                <div className='mt-2 border-t border-white/20 pt-1.5'>
                  <p className='text-[9px] mb-1 font-medium text-gray-600'>
                    Для мобильных устройств:
                  </p>
                  <p className='text-[9px] text-gray-500'>
                    • Виртуальный джойстик для движения
                  </p>
                  <p className='text-[9px] text-gray-500'>
                    • Кнопка действия появляется при приближении к объектам
                  </p>
                </div>
              )}
              <p className='text-[9px] text-gray-500 text-center mt-2 border-t border-white/20 pt-1.5'>
                Нажмите <span className='font-medium'>H</span> чтобы скрыть
                подсказки
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Prompt - Adjusted for mobile */}
      <AnimatePresence mode='wait'>
        {nearInteraction && (
          <motion.div
            key={"interaction"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md px-3 py-2 rounded-sm shadow-lg z-40 border border-white/20 ${
              isMobile ? "text-sm" : ""
            }`}
          >
            <div className='flex items-center gap-2'>
              <span className='bg-white/50 px-2 py-1 rounded text-[11px] font-bold text-gray-700'>
                {nearInteraction.key}
              </span>
              <span className='text-[11px] text-gray-600'>
                {nearInteraction.action}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  )
}
