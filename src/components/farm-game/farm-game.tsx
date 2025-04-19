"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Sky } from "@react-three/drei"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Sun, Menu, X, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Position, InteractionPoint } from "./types"
import { GameWorld } from "./world"
import { Player } from "./player"
import {
  FishingDialog,
  GreenhouseDialog,
  HouseDialog,
  KioskDialog,
  MailDialog,
  StocksDialog,
} from "./dialog"

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
