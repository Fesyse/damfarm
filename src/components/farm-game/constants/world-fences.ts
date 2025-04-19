import { Fence } from "../types"

// Define fences data outside of component to avoid recreation on each render
export const WORLD_FENCES: Fence[] = [
  { position: [0, 0, -40], rotation: [0, 0, 0], length: 80, width: 0.5 },
  { position: [0, 0, 40], rotation: [0, 0, 0], length: 80, width: 0.5 },
  {
    position: [-40, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    length: 80,
    width: 0.5,
  },
  {
    position: [40, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    length: 80,
    width: 0.5,
  },
]
