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
import {
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
} from "../ui/dialog"
import { Toast } from "../ui/toast"
import { useToast } from "../ui/use-toast"
import { Player } from "./player"
import { Position } from "./types"
import { InteractionPoint } from "./types/interaction-point"
import { GameWorld } from "./world/game-world"

export function FarmGame() {
  const gameStore = useGameStore(state => state)

  const [showUI, setShowUI] = useState(true)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [playerPosition, setPlayerPosition] = useState<Position>([0, 0, 0])
  const [nearInteraction, setNearInteraction] =
    useState<InteractionPoint | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogType, setDialogType] = useState<string | null>(null)
  // const [plantCounts] = useState({
  //   carrot: 12,
  //   potato: 8,
  //   wheat: 15,
  //   corn: 10,
  //   tomato: 5,
  //   strawberry: 7,
  // });
  const [inventory, setInventory] = useState<Fish[]>([])
  const { toast } = useToast()
  const [showInstructions, setShowInstructions] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Optimize the 3D rendering settings
  const canvasProps = useMemo(
    () => ({
      shadows: true, // Fixed: Changed from object to boolean
      dpr: [1, 2], // Dynamic pixel ratio based on device
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
        audioRef.current.play().catch(() => {
          // Игнорируем ошибку автовоспроизведения
        })
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

  // For fishing dialog only, inventory is used but the linter doesn't recognize it
  // We can use this function to make the relationship explicit
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

  return (
    <div className='w-full h-screen relative'>
      <Canvas {...canvasProps}>
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

      {/* Sound Toggle Button */}
      <button
        onClick={() => {
          setHasInteracted(true)
          setIsMuted(!isMuted)
        }}
        className='absolute top-4 left-4 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2 rounded-xl shadow-lg z-50 border border-white/20 hover:from-white/80 hover:to-white/50 transition-all duration-200'
      >
        {isMuted ? (
          <VolumeX size={16} className='text-gray-700' />
        ) : (
          <Volume2 size={16} className='text-gray-700' />
        )}
      </button>

      {/* Game Instructions Toggle Button */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className='absolute top-4 left-16 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2 rounded-xl shadow-lg z-50 border border-white/20 hover:from-white/80 hover:to-white/50 transition-all duration-200'
      >
        <CircleHelp size={16} className='text-gray-700' />
      </button>

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
                    <span className='font-medium'>
                      {SEASONS[gameStore.seasons]} - День {gameStore.days}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <Badge
                    variant='outline'
                    className='flex items-center gap-2 px-3 py-1'
                  >
                    <Coins className='h-4 w-4 text-yellow-500' />
                    <span className='text-lg font-bold'>
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
                      <CardContent className='p-3 text-center flex flex-col items-center justify-center'>
                        <div className='text-2xl mb-1'>
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
                        <div className='text-lg font-bold'>{count}</div>
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
        <DialogContent className='sm:max-w-[600px]'>
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
          {dialogType === "house" && <HouseDialog />}
          {dialogType === "barn" && <BarnDialog />}
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute top-14 left-4 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2.5 rounded-xl shadow-lg z-50 max-w-[220px] text-xs border border-white/20'
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
              <p className='text-[9px] text-gray-500 text-center mt-2 border-t border-white/20 pt-1.5'>
                Нажмите <span className='font-medium'>H</span> чтобы скрыть
                подсказки
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Prompt */}
      <AnimatePresence mode='wait'>
        {nearInteraction && (
          <motion.div
            key={"interaction"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md px-3 py-2 rounded-sm shadow-lg z-40 border border-white/20'
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
