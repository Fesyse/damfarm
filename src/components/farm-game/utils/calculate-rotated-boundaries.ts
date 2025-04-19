import { Position } from "../types"

export const calculateRotatedBoundaries = (
  position: Position,
  width: number,
  depth: number,
  rotationY: number
): { minX: number; maxX: number; minZ: number; maxZ: number } => {
  const [centerX, , centerZ] = position
  const halfWidth = width / 2
  const halfDepth = depth / 2

  // Define the four corners of the building before rotation
  const corners = [
    [centerX - halfWidth, centerZ - halfDepth], // front left
    [centerX + halfWidth, centerZ - halfDepth], // front right
    [centerX + halfWidth, centerZ + halfDepth], // back right
    [centerX - halfWidth, centerZ + halfDepth], // back left
  ]

  // Rotate each corner around the center
  const rotatedCorners = corners.map(([x, z]) => {
    // Translate to origin
    const translatedX = x - centerX
    const translatedZ = z - centerZ

    // Apply rotation
    const rotatedX =
      translatedX * Math.cos(rotationY) - translatedZ * Math.sin(rotationY)
    const rotatedZ =
      translatedX * Math.sin(rotationY) + translatedZ * Math.cos(rotationY)

    // Translate back
    return [rotatedX + centerX, rotatedZ + centerZ]
  })

  // Find min and max for X and Z from rotated corners
  const xValues = rotatedCorners.map(([x]) => x)
  const zValues = rotatedCorners.map(([, z]) => z)

  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minZ: Math.min(...zValues),
    maxZ: Math.max(...zValues),
  }
}
