import { InteractionPoint } from "../types"

// Define interaction points outside to avoid recreating in every render
export const INTERACTION_POINTS: InteractionPoint[] = [
  {
    type: "greenhouse",
    position: [-10, 0, 6.5],
    key: "E",
    action: "войти в Теплицу",
  },
  {
    type: "kiosk",
    position: [10, 0, 10],
    key: "E",
    action: "посетить Киоск",
  },
  {
    type: "house",
    position: [0, 0, -10],
    key: "E",
    action: "войти в Дом",
  },
  {
    type: "stocks",
    position: [10, 0, -10],
    key: "E",
    action: "торговать акциями",
  },
  {
    type: "fishing",
    position: [-18, 0, 17],
    key: "E",
    action: "начать рыбалку",
  },
  {
    type: "mail",
    position: [2, 0, -12],
    key: "M",
    action: "проверить почту",
  },
]
