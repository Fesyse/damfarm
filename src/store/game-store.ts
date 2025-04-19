import {
  animalFeedResource,
  animalFeedResourceAmount,
} from "@/components/farm-game/dialog"
import { animalPrices, animalProduct } from "@/constants/animals"
import { SEASONS } from "@/constants/seasons"
import {
  AnimalType,
  GameState,
  ProductsType,
  SeedsType,
  ToolsType,
} from "@/types/store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const resourceName = {
  wheat: "пшеницы",
  carrot: "моркови",
  potato: "картофеля",
  corn: "кукурузы",
  tomato: "помидоров",
  strawberry: "клубнике",
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      days: 1,
      setNextDay: () => {
        set(state => {
          const newAnimals = state.animals.map(animal => {
            const newAnimal = { ...animal }
            // Randomly update animal's happiness, hunger, and health
            newAnimal.happiness -= Math.floor(Math.random() * 15 + 10) // Random change between 10 and 25
            newAnimal.hunger -= Math.floor(Math.random() * 15 + 10) // Random change between 10 and 25
            newAnimal.health -= Math.floor(Math.random() * 15 + 10) // Random change between 10 and 25

            // Ensure values are within bounds
            newAnimal.happiness = Math.max(
              0,
              Math.min(newAnimal.happiness, 100)
            )
            newAnimal.hunger = Math.max(0, Math.min(newAnimal.hunger, 100))
            newAnimal.health = Math.max(0, Math.min(newAnimal.health, 100))

            // Randomly update product amount based on animal's state
            if (
              newAnimal.happiness > 50 &&
              newAnimal.hunger < 50 &&
              newAnimal.health > 50
            ) {
              newAnimal.productAmount += Math.floor(Math.random() * 5) // Increase product amount if animal is happy, not hungry, and healthy
            } else {
              newAnimal.productAmount -= Math.floor(Math.random() * 5) // Decrease product amount if animal is unhappy, hungry, or unhealthy
            }

            // Ensure product amount is not negative
            newAnimal.productAmount = Math.max(0, newAnimal.productAmount)

            return newAnimal
          })

          return {
            animals: newAnimals,
            seasons:
              (state.days + 1) % 7 == 0 ? state.setSeason() : state.seasons,
            days: state.days + 1,
          }
        })
      },

      moneys: 2500,
      setMoney: moneys =>
        set(state => ({
          moneys: state.moneys + moneys,
        })),

      // tools
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

      // resources
      resources: {
        carrot: 0,
        potato: 0,
        wheat: 0,
        corn: 0,
        tomato: 0,
        strawberry: 0,
      },
      setResource: (name, value) => {
        set(state => ({
          resources: {
            ...state.resources,
            [name]: value,
          },
        }))
      },

      // seeds
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
        set(() => ({
          seeds,
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
            [name]: value,
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
        set(state => ({ products: { ...state.products, [name]: value } }))
      },
      // stocks
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
            if (isNewAnimal && animal.isFed) {
              error = "Вы уже кормили это животное сегодня!"
              return animal
            }

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
              return { ...animal, hunger: animal.hunger + 10, isFed: true }
            }

            return animal
          }),
        }))

        return error
      },
      collectProducts: (id: number) => {
        let error
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

        return error
      },
      buyAnimal: animal => {
        let error
        set(state => {
          const price = animalPrices[animal]
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
            isFed: false,
            product: animalProduct[animal],
            productAmount: 10,
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
