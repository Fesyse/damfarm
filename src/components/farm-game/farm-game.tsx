"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEASONS } from "@/constants/seasons";
import { useGameStore } from "@/store/game-store";
import { Environment } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BarnDialog,
  FishingDialog,
  GreenhouseDialog,
  HouseDialog,
  KioskDialog,
  MailDialog,
  StocksDialog,
} from "./dialog";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Fish } from "@/types/fish";
import { Sky } from "@react-three/drei";
import type { CanvasProps } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import {
  CircleHelp,
  Coins,
  Flower,
  Menu,
  Snowflake,
  Sun,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Player } from "./player";
import { Position } from "./types";
import { InteractionPoint } from "./types/interaction-point";
import { GameWorld } from "./world/game-world";

function SkyController({
  isNight,
  onTransitionComplete,
}: {
  isNight: boolean;
  onTransitionComplete: () => void;
}) {
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([
    100, 20, 100,
  ]);
  const [turbidity, setTurbidity] = useState(10);
  const [rayleigh, setRayleigh] = useState(2);
  const [mieCoefficient, setMieCoefficient] = useState(0.005);
  const [mieDirectionalG, setMieDirectionalG] = useState(0.8);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevIsNightRef = useRef(isNight);

  useEffect(() => {
    if (prevIsNightRef.current !== isNight) {
      setShouldAnimate(true);
      setAnimationCompleted(false);
    }

    prevIsNightRef.current = isNight;
  }, [isNight]);

  useEffect(() => {
    if (!shouldAnimate) return;

    let animationId = 0;
    let progress = 0;
    const duration = 3; // seconds
    const fps = 60;
    const totalFrames = duration * fps;

    // Day position values
    const dayPosition: [number, number, number] = [100, 20, 100];
    const dayTurbidity = 10;
    const dayRayleigh = 2;
    const dayMieCoefficient = 0.005;
    const dayMieDirectionalG = 0.8;

    // Night position values - use higher sun position for a blue night sky instead of black
    const nightPosition: [number, number, number] = [100, -5, 100];
    const nightTurbidity = 20;
    const nightRayleigh = 4; // Higher rayleigh for bluer night
    const nightMieCoefficient = 0.003;
    const nightMieDirectionalG = 0.7;

    const startPosition = isNight ? dayPosition : nightPosition;
    const endPosition = isNight ? nightPosition : dayPosition;

    const startTurbidity = isNight ? dayTurbidity : nightTurbidity;
    const endTurbidity = isNight ? nightTurbidity : dayTurbidity;

    const startRayleigh = isNight ? dayRayleigh : nightRayleigh;
    const endRayleigh = isNight ? nightRayleigh : dayRayleigh;

    const startMieCoefficient = isNight
      ? dayMieCoefficient
      : nightMieCoefficient;
    const endMieCoefficient = isNight ? nightMieCoefficient : dayMieCoefficient;

    const startMieDirectionalG = isNight
      ? dayMieDirectionalG
      : nightMieDirectionalG;
    const endMieDirectionalG = isNight
      ? nightMieDirectionalG
      : dayMieDirectionalG;

    const animate = () => {
      progress += 1 / totalFrames;

      if (progress >= 1) {
        progress = 1;
        cancelAnimationFrame(animationId);

        // Only call onTransitionComplete once and reset animation flag
        if (!animationCompleted) {
          setAnimationCompleted(true);
          setShouldAnimate(false);
          onTransitionComplete();
        }
      }

      // Apply easing (smooth transition)
      const eased = easeInOutCubic(progress);

      // Interpolate values
      const newX =
        startPosition[0] + (endPosition[0] - startPosition[0]) * eased;
      const newY =
        startPosition[1] + (endPosition[1] - startPosition[1]) * eased;
      const newZ =
        startPosition[2] + (endPosition[2] - startPosition[2]) * eased;

      const newTurbidity =
        startTurbidity + (endTurbidity - startTurbidity) * eased;
      const newRayleigh = startRayleigh + (endRayleigh - startRayleigh) * eased;
      const newMieCoefficient =
        startMieCoefficient + (endMieCoefficient - startMieCoefficient) * eased;
      const newMieDirectionalG =
        startMieDirectionalG +
        (endMieDirectionalG - startMieDirectionalG) * eased;

      setSunPosition([newX, newY, newZ]);
      setTurbidity(newTurbidity);
      setRayleigh(newRayleigh);
      setMieCoefficient(newMieCoefficient);
      setMieDirectionalG(newMieDirectionalG);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isNight, onTransitionComplete, animationCompleted, shouldAnimate]);

  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  return (
    <Sky
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={mieDirectionalG}
    />
  );
}

export function FarmGame() {
  const gameStore = useGameStore((state) => state);

  const [showUI, setShowUI] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<Position>([0, 0, 0]);
  const [nearInteraction, setNearInteraction] =
    useState<InteractionPoint | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Fish[]>([]);
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Day/Night transition states
  const [isNight, setIsNight] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedDayAdvance, setCompletedDayAdvance] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  const hasMounted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      hasMounted.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
  );

  useEffect(() => {
    audioRef.current = new Audio("/audio/01.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && hasInteracted) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, hasInteracted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      if (nearInteraction) {
        if (
          (e.code === "KeyE" && nearInteraction.key === "E") ||
          (e.code === "KeyM" && nearInteraction.key === "M")
        ) {
          setDialogType(nearInteraction.type);
          setShowDialog(true);
        }
      }

      if (e.code === "KeyM") {
        setDialogType("mail");
        setShowDialog(true);
      }
      if (e.code === "KeyH") {
        setShowInstructions((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nearInteraction]);

  const getInventoryCount = useCallback(() => inventory.length, [inventory]);

  const handleFishCatch = useCallback(
    (fish: Fish) => {
      setInventory((prev) => [...prev, fish]);
      toast({
        title: "Рыба поймана!",
        description: `Вы поймали ${fish.name}!`,
      });
    },
    [toast]
  );

  const handleTransitionComplete = useCallback(() => {
    if (!hasMounted.current) return;

    setIsTransitioning(false);

    if (!isNight && !completedDayAdvance && isSleeping) {
      gameStore.setNextDay();
      setCompletedDayAdvance(true);
    }

    if (!isNight) {
      setIsSleeping(false);
    }
  }, [isNight, gameStore, completedDayAdvance, isSleeping]);

  const handleSleep = useCallback(() => {
    if (!isTransitioning && !isSleeping) {
      setIsSleeping(true);
      setIsTransitioning(true);
      setCompletedDayAdvance(false);
      setIsNight(true);

      setTimeout(() => {
        setIsNight(false);
      }, 3000);
    }
  }, [isTransitioning, isSleeping]);

  return (
    <div className="w-full h-screen relative">
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

      {/* UI Toggle Button */}
      <button
        className="absolute top-4 right-4 z-50 bg-white/80 p-2 rounded-full shadow-lg"
        onClick={() => setShowMainMenu(true)}
      >
        {showMainMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sound Toggle Button */}
      <button
        onClick={() => {
          setHasInteracted(true);
          setIsMuted(!isMuted);
        }}
        className="absolute top-4 left-4 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2 rounded-xl shadow-lg z-50 border border-white/20 hover:from-white/80 hover:to-white/50 transition-all duration-200"
      >
        {isMuted ? (
          <VolumeX size={16} className="text-gray-700" />
        ) : (
          <Volume2 size={16} className="text-gray-700" />
        )}
      </button>

      {/* Game Instructions Toggle Button */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="absolute top-4 left-16 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2 rounded-xl shadow-lg z-50 border border-white/20 hover:from-white/80 hover:to-white/50 transition-all duration-200"
      >
        <CircleHelp size={16} className="text-gray-700" />
      </button>

      {/* Player Position */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-lg z-40 flex items-center gap-2">
        <User size={16} />
        <span>
          X: {playerPosition[0].toFixed(1)}, Z: {playerPosition[2].toFixed(1)}
        </span>
      </div>

      {/* Game UI */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-4 z-40"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-4  max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xl px-3 py-1 rounded-lg">
                  {SEASONS[gameStore.seasons] === "winter" ? (
                    <Snowflake className="h-7 w-7 text-blue-800" />
                  ) : SEASONS[gameStore.seasons] === "spring" ? (
                    <Flower className="h-7 w-7 text-yellow-900" />
                  ) : (
                    <Sun className="h-7 w-7 text-yellow-400" />
                  )}
                  <span className="font-medium">
                    {SEASONS[gameStore.seasons]} - День {gameStore.days}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold">{gameStore.moneys}</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUI((prev) => !prev)}
                >
                  Показать продукты
                </Button>
              </div>
            </div>
            {showUI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/*  РАСТЕНИЯ */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">🌱 Растения</h2>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Object.entries(gameStore.resources).map(
                      ([plant, count], i) => (
                        <Card key={i} className="bg-white/90">
                          <CardContent className="p-3 text-center flex flex-col items-center justify-center">
                            <div className="text-2xl mb-1">
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
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {plant}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>

                {/*  РЫБА */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">🐟 Рыба</h2>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Object.entries(gameStore.fishes).map(
                      ([fish, count], i) => {
                        return (
                          <Card key={i} className={`bg-white/90 border-2 `}>
                            <CardContent className="p-3 text-center flex flex-col items-center justify-center">
                              <div className="text-2xl mb-1">{"🐟"}</div>
                              <div className="text-lg font-bold">{count}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {fish}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>

                {/*  ПРОДУКТЫ АМБАРА */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">🌱 Продукты</h2>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Object.entries(gameStore.products).map(
                      ([product, count], i) => {
                        return (
                          <Card key={i} className={`bg-white/90 border-2 `}>
                            <CardContent className="p-3 text-center flex flex-col items-center justify-center">
                              <div className="text-2xl mb-1">
                                {
                                  {
                                    eggs: "🥚",
                                    milk: "🥛",
                                    wool: "🧶",
                                  }[product]
                                }
                              </div>
                              <div className="text-lg font-bold">{count}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {product}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main Menu */}
      <AnimatePresence>
        {showMainMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Ферма 3D</h2>

              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => setShowMainMenu(false)}
                >
                  Продолжить
                </Button>
                <Button className="w-full" variant="outline">
                  Сохранить игру
                </Button>
                <Button className="w-full" variant="outline">
                  Загрузить игру
                </Button>
                <Button className="w-full" variant="outline">
                  Настройки
                </Button>
                <Button className="w-full" variant="destructive">
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
        onOpenChange={(open) => {
          // Предотвращаем автоматическое закрытие диалога рыбалки
          if (!open && dialogType === "fishing") {
            return;
          }
          setShowDialog(open);
          if (!open) {
            setDialogType(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
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

      {/* Game Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 left-4 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md p-2.5 rounded-xl shadow-lg z-50 max-w-[220px] text-xs border border-white/20"
          >
            <div className="font-medium mb-2 flex justify-between items-center border-b border-white/20 pb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-gray-700">
                Управление
              </span>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-0.5 rounded-full hover:bg-white/50"
              >
                <X size={12} />
              </button>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <p className="flex items-center gap-1.5">
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700">
                    WASD
                  </span>
                  <span className="text-gray-600">движение</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700">
                    E
                  </span>
                  <span className="text-gray-600">действие</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700">
                    M
                  </span>
                  <span className="text-gray-600">почта</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700">
                    ПКМ
                  </span>
                  <span className="text-gray-600">камера</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700">
                    ↑↓
                  </span>
                  <span className="text-gray-600">высота</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="bg-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700">
                    ESC
                  </span>
                  <span className="text-gray-600">меню</span>
                </p>
              </div>
              <p className="text-[9px] text-gray-500 text-center mt-2 border-t border-white/20 pt-1.5">
                Нажмите <span className="font-medium">H</span> чтобы скрыть
                подсказки
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Prompt */}
      <AnimatePresence mode="wait">
        {nearInteraction && (
          <motion.div
            key={"interaction"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md px-3 py-2 rounded-sm shadow-lg z-40 border border-white/20"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/50 px-2 py-1 rounded text-[11px] font-bold text-gray-700">
                {nearInteraction.key}
              </span>
              <span className="text-[11px] text-gray-600">
                {nearInteraction.action}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  );
}
