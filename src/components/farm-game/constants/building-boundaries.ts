import { BuildingBoundary } from "../types"
import { calculateRotatedBoundaries } from "../utils"

export const BUILDING_BOUNDARIES: BuildingBoundary[] = [
  // Greenhouses
  {
    ...calculateRotatedBoundaries([-20, 0, 0], 12, 5, 0),
    type: "greenhouse",
    doorPosition: {
      x: -15,
      z: 2.5,
      radius: 1.2,
    },
  },
  // Kiosk
  {
    ...calculateRotatedBoundaries([5, 0, 15], 3.6, 5, Math.atan2(-5, -15)),
    type: "kiosk",
    doorPosition: {
      x: 5,
      z: 17,
      radius: 2,
    },
  },
  // House
  {
    ...calculateRotatedBoundaries([0, 0, -10], 6, 6, 0),
    type: "house",
    doorPosition: {
      x: 0,
      z: -7,
      radius: 1.2,
    },
  },
  // Stock Exchange
  {
    ...calculateRotatedBoundaries([15, 0, -8], 6, 6, Math.atan2(-15, 8)),
    type: "stocks",
    doorPosition: {
      x: 13.7,
      z: -6,
      radius: 1.2,
    },
  },
  // Mailbox
  {
    ...calculateRotatedBoundaries([2, 0, -12], 1, 2, 0),
    type: "mail",
    doorPosition: {
      x: 2.2,
      z: -12,
      radius: 0.8,
    },
  },
  // Fishing Pond
  {
    minX: -25,
    maxX: -15,
    minZ: 15,
    maxZ: 25,
    type: "fishing",
    doorPosition: {
      x: -15.5,
      z: 17.6,
      radius: 2,
    },
  },
  // Barn
  {
    ...calculateRotatedBoundaries([15, 0, 8], 8, 10, Math.atan2(-15, -8)),
    type: "barn",
    doorPosition: {
      x: 15,
      z: 12,
      radius: 1.5,
    },
  },
]
