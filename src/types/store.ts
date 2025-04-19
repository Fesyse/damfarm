export type ResoursesType = {
  carrot: number
  potato: number
  wheat: number
  corn: number
  tomato: number
  strawberry: number
}

export type PlotsType = {
  id: number
  plant: string | null
  stage: number
  watered: boolean
  plantedAt: number | null
  lastWateredAt: number | null
}

type SeedType = {
  inInventory: number
  stock: number
}

export type SeedsType = {
  carrotsSeed: SeedType
  potatoesSeed: SeedType
  wheatSeed: SeedType
  cornSeed: SeedType
  tomatoesSeed: SeedType
  strawberriesSeed: SeedType
}

export type ToolsType = {
  wateringCan: boolean
  shovel: boolean
}

export type StocksType = {
  TechNova: number
  OilCorp: number
  GreenFuture: number
  GameVerse: number
  MediPlus: number
}

export type FishType = {
  carp: number
  tuna: number
  pike_perch: number
  cod: number
  mackerel: number
  herring: number
  perch: number
  pike: number
  bream: number
}

export type ProductsType = {
  eggs: number
  milk: number
  wool: number
  meat: number
}

export type AnimalType = {
  id: number
  type: "cow" | "chicken" | "sheep" | "pig" | "rabbit" | "horse"

  health: number
  hunger: number
  happiness: number

  isStroked: boolean

  product: keyof ProductsType
  productAmount: number
}

export type ShopItem = {
  name: string
  icon: string
  price: number
  stock: number
  type: "seed" | "tool"
  id: keyof SeedsType | "wateringCan" | "shovel"
}

type AnimalError = string | undefined

export interface GameState {
  days: number
  setNextDay: () => void

  moneys: number
  setMoney: (moneys: number) => void

  tools: ToolsType
  setTool: (name: keyof ToolsType, value: boolean) => void

  resources: ResoursesType
  setResource: (name: keyof ResoursesType, value: number) => void

  shopItems: ShopItem[]
  setShopItems: (shopItems: ShopItem[]) => void

  plots: PlotsType[]
  setPlots: (plots: PlotsType[]) => void

  seeds: SeedsType
  setSeeds: (seeds: SeedsType) => void

  fishes: FishType
  setFishes: (name: keyof FishType, value: number) => void

  products: ProductsType
  setProducts: (name: keyof ProductsType, value: number) => void

  stocks: StocksType
  setStocks: (name: keyof StocksType, value: number) => void

  seasons: number
  setSeason: () => number

  is_paid_news: boolean
  setIsPaidNews: (is_paid_news: boolean) => void

  animals: AnimalType[]
  strokeAnimal: (id: number) => AnimalError
  setAnimals: (animals: AnimalType[]) => void
  addNewAnimal: (animal: AnimalType) => void
  buyAnimal: (animal: AnimalType["type"]) => AnimalError
  collectProducts: (id: number) => void
  feedAnimal: (id: number) => AnimalError
}
