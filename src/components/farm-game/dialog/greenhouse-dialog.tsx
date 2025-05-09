"use client"

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SEASONS } from "@/constants/seasons"
import { useGameStore } from "@/store/game-store"
import { ResoursesType } from "@/types/store"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useState } from "react"
import { toast } from "sonner"

export interface Plant {
  key: string
  name: string
  emoji: string
  growthTime: number // в днях
  basePrice: number
  yield: number
  seedType: string
}

// Season-based growth modifiers
export const SEASON_MODIFIERS = {
  spring: 1.1,
  summer: 1.2,
  autumn: 0.7,
  winter: 0.4,
}

// Map season index to season key for modifiers
export const SEASON_MAP: Record<number, keyof typeof SEASON_MODIFIERS> = {
  0: "spring",
  1: "summer",
  2: "autumn",
  3: "winter",
}

export const WATERING_BOOST = 1.2 // 20% growth boost when watered

export const PLANTS: Plant[] = [
  {
    key: "carrot",
    name: "Морковь",
    emoji: "🥕",
    growthTime: 3,
    basePrice: 10,
    yield: 1,
    seedType: "carrotsSeed",
  },
  {
    key: "potato",
    name: "Картофель",
    emoji: "🥔",
    growthTime: 4,
    basePrice: 15,
    yield: 1,
    seedType: "potatoesSeed",
  },
  {
    key: "wheat",
    name: "Пшеница",
    emoji: "🌾",
    growthTime: 2,
    basePrice: 8,
    yield: 1,
    seedType: "wheatSeed",
  },
  {
    key: "corn",
    name: "Кукуруза",
    emoji: "🌽",
    growthTime: 5,
    basePrice: 20,
    yield: 1,
    seedType: "cornSeed",
  },
]

const PLOT_PRICE = 800
const PLOT_SELL_PRICE = Math.floor(PLOT_PRICE * 0.6)

type SeedKey =
  | "carrotsSeed"
  | "potatoesSeed"
  | "wheatSeed"
  | "cornSeed"
  | "tomatoesSeed"
  | "strawberriesSeed"

export function GreenhouseDialog() {
  const {
    plots: gamePlots,
    setPlots,
    resources,
    setResource,
    days,
    seeds,
    setSeeds,
    tools,
    moneys,
    setMoney,
    seasons,
  } = useGameStore()

  const [selectedPlant, setSelectedPlant] = useState<string>("carrotsSeed")
  const [harvestAnimation, setHarvestAnimation] = useState<{
    emoji: string
    id: number
  } | null>(null)

  const handlePlant = useCallback(
    (plotId: number) => {
      if (!selectedPlant) return

      const plant = PLANTS.find(p => p.seedType === selectedPlant)
      if (!plant) return

      const seedKey = selectedPlant as SeedKey
      const seed = seeds[seedKey]
      if (!seed || seed.inInventory <= 0) {
        toast.error(`У вас нет семян ${plant.name}`)
        return
      }

      const newPlots = gamePlots.map(plot =>
        plot.id === plotId
          ? {
              ...plot,
              plant: selectedPlant,
              stage: 0,
              watered: false,
              plantedAt: days,
              lastWateredAt: null,
            }
          : plot
      )

      setPlots(newPlots)

      const newSeeds = { ...seeds }
      newSeeds[seedKey] = {
        ...newSeeds[seedKey],
        inInventory: newSeeds[seedKey].inInventory - 1,
      }
      setSeeds(newSeeds)
    },
    [gamePlots, selectedPlant, days, seeds, setPlots, setSeeds]
  )

  const handleWater = useCallback(
    (plotId: number) => {
      if (!tools.wateringCan) {
        toast.error("Купите лейку в киоске")
        return
      }

      const newPlots = gamePlots.map(plot =>
        plot.id === plotId
          ? { ...plot, watered: true, lastWateredAt: days }
          : plot
      )
      setPlots(newPlots)
    },
    [gamePlots, days, tools.wateringCan, setPlots]
  )

  const handleHarvest = useCallback(
    (plotId: number) => {
      const plot = gamePlots.find(p => p.id === plotId)
      if (!plot?.plant || plot.stage < 3) return

      const plant = PLANTS.find(p => p.seedType === plot.plant)
      if (!plant) return

      const newPlots = gamePlots.map(p =>
        p.id === plotId
          ? {
              ...p,
              plant: null,
              stage: 0,
              watered: false,
              plantedAt: null,
              lastWateredAt: null,
            }
          : p
      )

      setPlots(newPlots)
      setResource(plant.key as keyof ResoursesType, plant.yield)

      setHarvestAnimation({ emoji: plant.emoji, id: plotId })
      const timer = setTimeout(() => {
        setHarvestAnimation(null)
      }, 1000)

      return () => clearTimeout(timer)
    },
    [gamePlots, resources, setPlots, setResource]
  )

  const handleBuyPlot = useCallback(() => {
    if (moneys < PLOT_PRICE) {
      toast.error("У вас недостаточно монет для покупки новой грядки")
      return
    }

    setMoney(-PLOT_PRICE)

    const newPlot = {
      id: gamePlots[gamePlots.length - 1].id + 1,
      plant: null,
      stage: 0,
      watered: false,
      plantedAt: null,
      lastWateredAt: null,
    }

    const newPlots = [...gamePlots, newPlot]
    setPlots(newPlots)

    toast.success("Вы приобрели новую грядку!")
  }, [gamePlots, moneys, setMoney, setPlots])

  const handleSellPlot = useCallback(
    (plotId: number) => {
      if (gamePlots.length <= 1) {
        toast.error("Нельзя продать последнюю грядку")
        return
      }

      const plot = gamePlots.find(p => p.id === plotId)
      if (!plot) return

      if (plot.plant) {
        toast.error("Сначала соберите урожай")
        return
      }

      const newPlots = gamePlots.filter(p => p.id !== plotId)
      setPlots(newPlots)
      setMoney(PLOT_SELL_PRICE)
      toast.success("Грядка продана!")
    },
    [gamePlots, setMoney, setPlots]
  )

  return (
    <ScrollArea className='h-[600px]'>
      <div className='relative'>
        <div className='absolute right-4 top-4 flex items-center gap-2 text-sm'>
          <span className='font-medium'>💰</span>
          <span>{moneys}</span>
        </div>

        <div className='space-y-6'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-medium'>Теплица</DialogTitle>
            <DialogDescription className='text-sm text-gray-500'>
              Здесь вы можете выращивать растения в контролируемых условиях
            </DialogDescription>
          </DialogHeader>

          <div className='flex gap-4 p-3 bg-gray-50 rounded-lg text-sm'>
            <div className='flex items-center gap-1'>
              <span className='font-medium'>Сезон:</span>
              <span
                className={`
              ${SEASON_MAP[seasons] === "spring" && "text-green-500"}
              ${SEASON_MAP[seasons] === "summer" && "text-yellow-500"}
              ${SEASON_MAP[seasons] === "autumn" && "text-orange-500"}
              ${SEASON_MAP[seasons] === "winter" && "text-blue-500"}
            `}
              >
                {SEASONS[seasons]}
                {SEASON_MODIFIERS[SEASON_MAP[seasons]] > 1
                  ? ` (+${Math.round(
                      (SEASON_MODIFIERS[SEASON_MAP[seasons]] - 1) * 100
                    )}% к росту)`
                  : ` (${Math.round(
                      (SEASON_MODIFIERS[SEASON_MAP[seasons]] - 1) * 100
                    )}% к росту)`}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <span className='font-medium'>Полив:</span>
              <span className='text-blue-500'>
                +{Math.round((WATERING_BOOST - 1) * 100)}% к скорости роста
              </span>
            </div>
          </div>

          <div className='flex gap-2 flex-wrap'>
            {PLANTS.map(plant => {
              return (
                <button
                  key={plant.key}
                  onClick={() => setSelectedPlant(plant.seedType)}
                  className={`
										flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
										${
                      selectedPlant === plant.seedType
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
									`}
                >
                  <span className='text-lg'>{plant.emoji}</span>
                  <div className='flex flex-col items-start'>
                    <span className='text-sm'>{plant.name}</span>
                    <span className='text-xs opacity-75'>
                      {seeds[plant.seedType as keyof typeof seeds]
                        ?.inInventory ?? 0}{" "}
                      семян
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {gamePlots.map(plot => {
              return (
                <div
                  key={plot.id}
                  className={`
										relative p-4 rounded-xl transition-all
										${
                      plot.plant
                        ? "bg-gradient-to-b from-emerald-50 to-emerald-100"
                        : "bg-gray-50 border-2 border-dashed border-gray-200"
                    }
									`}
                >
                  <div className='absolute top-3 right-3 text-xs text-gray-400'>
                    #{plot.id}
                  </div>

                  {plot.plant ? (
                    <div className='flex flex-col items-center gap-3'>
                      <div className='relative'>
                        <div
                          className={`
														text-4xl transform transition-all duration-500
														${plot.stage === 0 ? "scale-50 opacity-50" : ""}
														${plot.stage === 1 ? "scale-75 opacity-75" : ""}
														${plot.stage === 2 ? "scale-90 opacity-90" : ""}
														${plot.stage === 3 ? "scale-100 opacity-100" : ""}
													`}
                        >
                          {PLANTS.find(p => p.seedType === plot.plant)?.emoji}
                        </div>
                        {plot.watered && (
                          <span className='absolute -top-2 -right-2 text-sm'>
                            💧
                          </span>
                        )}
                      </div>

                      <div className='w-full space-y-2'>
                        <div className='h-1 bg-gray-200 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-emerald-500 transition-all duration-500'
                            style={{ width: `${(plot.stage / 3) * 100}%` }}
                          />
                        </div>

                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleWater(plot.id)}
                            disabled={plot.watered}
                            className={`
															flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
															${
                                plot.watered
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }
														`}
                          >
                            {plot.watered ? "Полито" : "Полить"}
                          </button>
                          <button
                            onClick={() => handleHarvest(plot.id)}
                            disabled={plot.stage < 3}
                            className={`
															flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
															${
                                plot.stage < 3
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-emerald-500 text-white hover:bg-emerald-600"
                              }
														`}
                          >
                            {plot.stage < 3 ? "Растёт..." : "Собрать"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-4 py-4'>
                      <div className='text-3xl opacity-25'>🌱</div>
                      <button
                        onClick={() => handlePlant(plot.id)}
                        disabled={
                          !selectedPlant ||
                          !seeds[selectedPlant as keyof typeof seeds] ||
                          seeds[selectedPlant as keyof typeof seeds]
                            ?.inInventory <= 0
                        }
                        className='px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        Посадить{" "}
                        {PLANTS.find(p => p.seedType === selectedPlant)?.emoji}
                      </button>

                      {gamePlots.length > 1 && (
                        <button
                          onClick={() => handleSellPlot(plot.id)}
                          className='px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 transition-colors mt-1'
                        >
                          Продать ({PLOT_SELL_PRICE} монет)
                        </button>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {harvestAnimation && harvestAnimation.id === plot.id && (
                      <motion.div
                        initial={{ scale: 1, y: 0, opacity: 1 }}
                        animate={{ scale: 1.5, y: 100, opacity: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 1 }}
                        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none z-50'
                      >
                        {harvestAnimation.emoji}
                        <span className='text-2xl ml-1'>×1</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleBuyPlot}
            disabled={moneys < PLOT_PRICE}
            className={`
								w-full py-3 rounded-xl text-sm font-medium transition-colors
								${
                  moneys < PLOT_PRICE
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }
							`}
          >
            Добавить новую грядку ({PLOT_PRICE} монет)
          </button>
        </div>
      </div>
    </ScrollArea>
  )
}
