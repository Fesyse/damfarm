import {
  animalFeedResource,
  animalFeedResourceAmount,
} from "@/components/farm-game/dialog"
import { animalProduct } from "@/constants/animals"
import { SEASONS } from "@/constants/seasons"
import {
  PLANTS,
  SEASON_MODIFIERS,
  SEASON_MAP,
  WATERING_BOOST,
} from "@/components/farm-game/dialog/greenhouse-dialog"
import {
  AnimalType,
  GameState,
  ProductsType,
  SeedsType,
  ShopItem,
  ToolsType,
} from "@/types/store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import {
  getAnimalsPrices,
  getAnimalsProductsIncomeAmount,
} from "@/data/json-data"

const resourceName = {
  wheat: "пшеницы",
  carrot: "моркови",
  potato: "картофеля",
  corn: "кукурузы",
  tomato: "помидоров",
  strawberry: "клубнике",
}

const defaultShopItems: ShopItem[] = [
  {
    name: "Семена моркови",
    icon: "🥕",
    price: 20,
    stock: 6,
    type: "seed",
    id: "carrotsSeed",
  },
  {
    name: "Семена картофеля",
    icon: "🥔",
    price: 25,
    stock: 6,
    type: "seed",
    id: "potatoesSeed",
  },
  {
    name: "Семена пшеницы",
    icon: "🌾",
    price: 15,
    stock: 6,
    type: "seed",
    id: "wheatSeed",
  },
  {
    name: "Семена кукурузы",
    icon: "🌽",
    price: 35,
    stock: 6,
    type: "seed",
    id: "cornSeed",
  },
  {
    name: "Лейка",
    icon: "💧",
    price: 500,
    stock: 1,
    type: "tool",
    id: "wateringCan",
  },
]

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      days: 1,
      setNextDay: () => {
        set(state => {
          const newAnimals = state.animals.map(animal => {
            const newAnimal: AnimalType = {
              ...animal,
              isStroked: false,
            }
            newAnimal.happiness -= Math.floor(Math.random() * 15 + 10)
            newAnimal.hunger -= Math.floor(Math.random() * 15 + 10)
            newAnimal.health -= Math.floor(Math.random() * 15 + 10)

            newAnimal.happiness = Math.max(
              0,
              Math.min(newAnimal.happiness, 100)
            )
            newAnimal.hunger = Math.max(0, Math.min(newAnimal.hunger, 100))
            newAnimal.health = Math.max(0, Math.min(newAnimal.health, 100))

            if (
              newAnimal.happiness > 50 &&
              newAnimal.hunger > 50 &&
              newAnimal.health > 50
            ) {
              newAnimal.productAmount =
                getAnimalsProductsIncomeAmount().find(
                  animal => animal.type === newAnimal.type
                )!.income + animal.productAmount
            }

            return newAnimal
          })

          const newShopItems = defaultShopItems.map((item, i) => {
            if (defaultShopItems[i].type === "tool") {
              return {
                ...item,
                stock:
                  item.stock -
                  (state.tools[item.id as keyof ToolsType] ? 1 : 0),
              }
            }
            return item
          })

          const updatedPlots = state.plots.map(plot => {
            if (!plot.plant || !plot.plantedAt) return plot

            const plant = PLANTS.find(p => p.seedType === plot.plant)
            if (!plant) return plot

            const seasonKey = SEASON_MAP[state.seasons] || "summer"
            const seasonModifier = SEASON_MODIFIERS[seasonKey]

            const isWatered = !!(
              plot.lastWateredAt && state.days - plot.lastWateredAt < 1
            )
            const wateringModifier = isWatered ? WATERING_BOOST : 1

            const rawDaysPassed = state.days + 1 - plot.plantedAt
            const effectiveDaysPassed =
              rawDaysPassed * seasonModifier * wateringModifier

            let newStage = 0

            if (rawDaysPassed > 0) {
              if (effectiveDaysPassed >= plant.growthTime) {
                newStage = 3 // Готово к сбору
              } else if (effectiveDaysPassed >= plant.growthTime * 0.66) {
                newStage = 2 // Цветение
              } else if (effectiveDaysPassed >= plant.growthTime * 0.33) {
                newStage = 1 // Росток
              } else {
                newStage = Math.min(
                  1,
                  Math.floor(rawDaysPassed / (plant.growthTime * 0.33))
                )
              }
            }

            return {
              ...plot,
              stage: newStage,
              watered: isWatered,
            }
          })

          return {
            shopItems: newShopItems,
            animals: newAnimals,
            plots: updatedPlots,
            seasons:
              (state.days + 1) % 7 == 0 ? state.setSeason() : state.seasons,
            days: state.days + 1,
          }
        })
      },

      moneys: 100,
      setMoney: moneys =>
        set(state => ({
          moneys: state.moneys + moneys,
        })),

      tools: {
        wateringCan: false,
        shovel: false,
      },
      setTool: (name: keyof ToolsType, value: boolean) => {
        set(state => ({
          tools: {
            ...state.tools,
            [name]: value,
          },
        }))
      },

      shopItems: defaultShopItems,
      setShopItems: (shopItems: ShopItem[]) => {
        set(() => ({ shopItems }))
      },

      resources: {
        carrot: 0,
        potato: 0,
        wheat: 0,
        corn: 0,
        tomato: 0,
        strawberry: 0,
      },
      setResource: (name, value) => {
        set(state => {
          return {
            resources: {
              ...state.resources,
              [name]: state.resources[name] + value,
            },
          }
        })
      },
      plots: [
        {
          id: 1,
          plant: null,
          stage: 0,
          watered: false,
          plantedAt: null,
          lastWateredAt: null,
        },
        {
          id: 2,
          plant: null,
          stage: 0,
          watered: false,
          plantedAt: null,
          lastWateredAt: null,
        },
        {
          id: 3,
          plant: null,
          stage: 0,
          watered: false,
          plantedAt: null,
          lastWateredAt: null,
        },
      ],
      setPlots: plots => {
        set(state => ({
          ...state,
          plots: [...plots],
        }))
      },

      seeds: {
        carrotsSeed: {
          inInventory: 0,
          stock: 8,
        },
        potatoesSeed: {
          inInventory: 0,
          stock: 8,
        },
        wheatSeed: {
          inInventory: 0,
          stock: 8,
        },
        cornSeed: {
          inInventory: 0,
          stock: 8,
        },
        tomatoesSeed: {
          inInventory: 0,
          stock: 8,
        },
        strawberriesSeed: {
          inInventory: 0,
          stock: 8,
        },
      },
      setSeeds: (seeds: SeedsType) => {
        set(state => ({
          ...state,
          seeds: { ...seeds },
        }))
      },

      fishes: {
        carp: 0,
        tuna: 0,
        pike_perch: 0,
        cod: 0,
        mackerel: 0,
        herring: 0,
        perch: 0,
        pike: 0,
        bream: 0,
      },

      setFishes: (name, value) => {
        set(state => ({
          fishes: {
            ...state.fishes,
            [name]: state.fishes[name] + value,
          },
        }))
      },
      products: {
        eggs: 0,
        milk: 0,
        wool: 0,
        meat: 0,
      },
      setProducts: (name: keyof ProductsType, value: number) => {
        set(state => ({
          products: { ...state.products, [name]: state.products[name] + value },
        }))
      },

      stocks: {
        TechNova: 0,
        OilCorp: 0,
        GreenFuture: 0,
        GameVerse: 0,
        MediPlus: 0,
      },
      setStocks: (name, value) => {
        set(state => ({
          stocks: {
            ...state.stocks,
            [name]: state.stocks[name] + value,
          },
        }))
      },

      seasons: 0,
      setSeason: () => {
        return SEASONS.length - 1 === get().seasons ? 0 : get().seasons + 1
      },

      is_paid_news: false,
      setIsPaidNews: is_paid_news =>
        set(() => ({
          is_paid_news,
        })),

      animals: [],
      setAnimals: animals => {
        set(() => ({
          animals,
        }))
      },
      addNewAnimal: animal => {
        set(state => ({ animals: [...state.animals, animal] }))
      },
      strokeAnimal: (id: number) => {
        let error
        set(state => ({
          animals: state.animals.map(animal => {
            const isNewAnimal = animal.id === id

            if (isNewAnimal && animal.happiness >= 100) {
              error = "Животное уже счастливое!"
              return animal
            }
            if (isNewAnimal && animal.isStroked) {
              error = "Вы уже погладили это животное сегодня!"
              return animal
            }

            return isNewAnimal
              ? { ...animal, happiness: animal.happiness + 10, isStroked: true }
              : animal
          }),
        }))

        return error
      },
      feedAnimal: (id: number) => {
        let error
        set(state => ({
          animals: state.animals.map(animal => {
            const isNewAnimal = animal.id === id

            const resource = animalFeedResource[animal.type]
            const resourceAmount = animalFeedResourceAmount[animal.type]

            if (isNewAnimal && state.resources[resource] < resourceAmount) {
              error = `Недостаточно ${resourceName[resource]}`
            }
            if (isNewAnimal && animal.hunger >= 100) {
              error = "Животное уже сытое!"
              return animal
            }

            if (isNewAnimal && state.resources[resource] >= resourceAmount) {
              error = "Вы покормили животное!"
              return {
                ...animal,
                hunger: animal.hunger + 25,
                happiness: animal.happiness + 10,
              }
            }

            return animal
          }),
        }))

        return error
      },
      collectProducts: (id: number) => {
        set(state => {
          const collectedProducts: {
            milk: number
            eggs: number
            wool: number
            meat: number
          } = state.products

          return {
            animals: state.animals.map(animal => {
              const isNewAnimal = animal.id === id
              if (isNewAnimal && animal.productAmount > 0) {
                collectedProducts[animal.product] += animal.productAmount
                return { ...animal, productAmount: 0 }
              }

              return animal
            }),
            products: collectedProducts,
          }
        })
      },
      buyAnimal: animal => {
        let error
        set(state => {
          const price = getAnimalsPrices()[animal]
          if (state.moneys < price) {
            error = "Недостаточно монет"
            return {}
          }

          const newAnimal: AnimalType = {
            id: state.animals.length,
            type: animal,
            health: 100,
            hunger: 100,
            happiness: 100,
            isStroked: false,
            product: animalProduct[animal],
            productAmount: 0,
          }

          return {
            moneys: state.moneys - price,
            animals: [...state.animals, newAnimal],
          }
        })

        return error
      },
    }),
    {
      name: "damfarm-game-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
