import { SEASONS } from "@/constants/seasons"
import { GameState, ProductsType, SeedsType, ToolsType } from "@/types/store"
import { create } from "zustand"

export const useGameStore = create<GameState>()((set, get) => ({
  days: 1,
  setNextDay: () => {
    set(state => ({
      seasons: (state.days + 1) % 7 == 0 ? state.setSeason() : state.seasons,
      days: state.days + 1,
    }))
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
    carrotsSeed: 0,
    potatoesSeed: 0,
    wheatSeed: 0,
    cornSeed: 0,
    tomatoesSeed: 0,
    strawberriesSeed: 0,
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

  animals: [
    {
      id: 0,
      type: "cow",
      name: "Bessie",
      price: 2000,
      health: 100,
      hunger: 50,
      happiness: 70,
      isStroked: false,
      isFed: false,
      product: "milk",
      productAmount: 10,
      amountCollected: 0,
    },
  ],
  setAnimals: animals => {
    set(() => ({
      animals,
    }))
  },
  addNewAnimal: animal => {
    set(state => ({ animals: [...state.animals, animal] }))
  },
  strokeAnimal: (id: number) => {
    let changed = false
    set(state => ({
      animals: state.animals.map(animal => {
        const isNewAnimal = animal.id === id && !animal.isStroked
        if (isNewAnimal) changed = true

        return isNewAnimal
          ? { ...animal, happiness: animal.happiness + 10, isStroked: true }
          : animal
      }),
    }))
    return changed
  },
}))
