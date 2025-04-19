import { FISHES } from "@/constants/fishes";
import { Fish } from "@/types/fish";

export function getRandomFishByChance(): Fish {
  const totalWeight = FISHES.reduce((sum, fish) => sum + fish.chance, 0);
  const rand = Math.random() * totalWeight;
  let runningSum = 0;

  for (const fish of FISHES) {
    runningSum += fish.chance;
    if (rand <= runningSum) {
      return fish;
    }
  }

  return FISHES[0];
}
