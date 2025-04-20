import { Fish } from "@/types/fish"

export const FISHES: Fish[] = [
  { id: "1", name: "carp", icon: "🐟", rarity: "common", chance: 0.4 },
  { id: "2", name: "tuna", icon: "🐉", rarity: "legendary", chance: 0.02 },
  { id: "3", name: "pike_perch", icon: "🐡", rarity: "rare", chance: 0.15 },
  { id: "4", name: "cod", icon: "🐡", rarity: "rare", chance: 0.15 },
  { id: "5", name: "mackerel", icon: "🐋", rarity: "uncommon", chance: 0.25 },
  { id: "6", name: "herring", icon: "🐟", rarity: "common", chance: 0.4 },
  { id: "7", name: "perch", icon: "🐠", rarity: "epic", chance: 0.07 },
  { id: "8", name: "pike", icon: "🐠", rarity: "epic", chance: 0.07 },
  { id: "9", name: "bream", icon: "🐋", rarity: "uncommon", chance: 0.25 },
]

export const FISH_NAME = {
  carp: "Карась",
  tuna: "Тунец",
  pike_perch: "Щука",
  cod: "Сельдь",
  mackerel: "Макрель",
  herring: "Скумбрия",
  perch: "Сельдь",
  pike: "Щука",
  bream: "Брест",
}
