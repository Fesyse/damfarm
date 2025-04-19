import { WORLD_FENCES } from "./world-fences"

export const FENCE_BOUNDARIES = WORLD_FENCES.map(fence => {
  const [fenceX, , fenceZ] = fence.position
  const [, fenceRotY] = fence.rotation

  const isHorizontal = fenceRotY === 0
  return {
    minX: isHorizontal ? fenceX - fence.length / 2 : fenceX - fence.width / 2,
    maxX: isHorizontal ? fenceX + fence.length / 2 : fenceX + fence.width / 2,
    minZ: isHorizontal ? fenceZ - fence.width / 2 : fenceZ - fence.length / 2,
    maxZ: isHorizontal ? fenceZ + fence.width / 2 : fenceZ + fence.length / 2,
  }
})
