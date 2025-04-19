type ResoursesType = {
  carrot: number
  potato: number
  wheat: number
  corn: number
  tomato: number
  strawberry: number
}

type SeedsType = {
  carrotsSeed: number
  potatoesSeed: number
  wheatSeed: number
  cornSeed: number
  tomatoesSeed: number
  strawberriesSeed: number
}

export type StocksType = {
  TechNova: number
  OilCorp: number
  GreenFuture: number
  GameVerse: number
  MediPlus: number
}

export interface GameState {
  days: number
  setNextDay: () => void

  moneys: number
  setMoney: (moneys: number) => void

  resources: ResoursesType
  setResource: (name: keyof ResoursesType, value: number) => void

  seeds: SeedsType
  setSeed: (name: keyof SeedsType, value: number) => void

  stocks: StocksType
  setStocks: (name: keyof StocksType, value: number) => void

  seasons: number
  setSeason: () => number

  isPaidNews: boolean
  setIsPaidNews: (isPaidNews: boolean) => void
}
