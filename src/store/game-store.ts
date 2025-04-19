import { create } from "zustand";
import { GameState } from "@/@types/store";
import { SEASONS } from "@/constants/seasons";

export const useGameStore = create<GameState>()((set, get) => ({
  days: 1,
  setNextDay: () => {
    set((state) => ({
      seasons: (state.days + 1) % 7 == 0 ? state.setSeason() : state.seasons,
      days: state.days + 1,
    }));
  },

  moneys: 0,
  setMoney: (moneys) =>
    set(() => ({
      moneys,
    })),

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
    set((state) => ({
      resources: {
        ...state.resources,
        [name]: value,
      },
    }));
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
  setSeed: (name, value) => {
    set((state) => ({
      seeds: {
        ...state.seeds,
        [name]: value,
      },
    }));
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
    set((state) => ({
      stocks: {
        ...state.stocks,
        [name]: value,
      },
    }));
  },

  seasons: 0,
  setSeason: () => {
    return SEASONS.length - 1 === get().seasons ? 0 : get().seasons + 1;
  },
}));
