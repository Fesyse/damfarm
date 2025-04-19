export type BuildingBoundary = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  type: string
  // Add doorPosition to create an entry point where collision is disabled
  doorPosition?: {
    x: number
    z: number
    radius: number
  }
}
