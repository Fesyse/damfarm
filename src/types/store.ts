type ResoursesType = {
  carrot: number;
  potato: number;
  wheat: number;
  corn: number;
  tomato: number;
  strawberry: number;
};

type SeedsType = {
  carrotsSeed: number;
  potatoesSeed: number;
  wheatSeed: number;
  cornSeed: number;
  tomatoesSeed: number;
  strawberriesSeed: number;
};

export type StocksType = {
  TechNova: number;
  OilCorp: number;
  GreenFuture: number;
  GameVerse: number;
  MediPlus: number;
};

export type FishType = {
  carp: number;
  tuna: number;
  pike_perch: number;
  cod: number;
  mackerel: number;
  herring: number;
  perch: number;
  pike: number;
  bream: number;
};

export type ProductsType = {
  eggs: number;
  milk: number;
  wool: number;
};

export interface GameState {
  days: number;
  setNextDay: () => void;

  moneys: number;
  setMoney: (moneys: number) => void;

  resources: ResoursesType;
  setResource: (name: keyof ResoursesType, value: number) => void;

  seeds: SeedsType;
  setSeed: (name: keyof SeedsType, value: number) => void;

  fishes: FishType;
  setFishes: (name: keyof FishType, value: number) => void;

  products: ProductsType;
  setProducts: (name: keyof ProductsType, value: number) => void;

  stocks: StocksType;
  setStocks: (name: keyof StocksType, value: number) => void;

  seasons: number;
  setSeason: () => number;

  is_paid_news: boolean;
  setIsPaidNews: (is_paid_news: boolean) => void;
}
