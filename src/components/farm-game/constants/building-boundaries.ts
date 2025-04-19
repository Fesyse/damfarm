import { BuildingBoundary } from "../types"
import { calculateRotatedBoundaries } from "../utils"

// Define building boundaries for collision detection
export const BUILDING_BOUNDARIES: BuildingBoundary[] = [
  // Greenhouse (rotated by Math.PI/6)
  {
    ...calculateRotatedBoundaries([-15, 0, 0], 8, 9, Math.PI / 6),
    type: "greenhouse",
    doorPosition: {
      x: -13.9, // Position of door adjusted for rotation
      z: 3.5, // Position of door adjusted for rotation
      radius: 1.5, // Area around door where collision is disabled
    },
  },
  // Kiosk (rotation calculated to face center)
  {
    ...calculateRotatedBoundaries(
      [5, 0, 15],
      3.6,
      5,
      Math.atan2(-5, -15) // rotation to face center
    ),
    type: "kiosk",
    doorPosition: {
      x: 5, // Front of kiosk is open
      z: 17, // Front of kiosk is open
      radius: 2, // Wider area for counter interaction
    },
  },
  // House (no rotation)
  {
    ...calculateRotatedBoundaries([0, 0, -10], 6, 6, 0),
    type: "house",
    doorPosition: {
      x: 0, // Door is at front center
      z: -7, // Door Z position
      radius: 1.2, // Area around door where collision is disabled
    },
  },
  // Stock Exchange (rotated by Math.PI/4)
  {
    ...calculateRotatedBoundaries(
      [15, 0, -8],
      6,
      6,
      Math.atan2(-15, 8) // updated rotation to face center based on new position
    ),
    type: "stocks",
    doorPosition: {
      x: 13.7, // Door position adjusted for rotation
      z: -6, // Updated door position
      radius: 1.2, // Area around door where collision is disabled
    },
  },
  // Mailbox (smaller object)
  {
    ...calculateRotatedBoundaries([2, 0, -12], 1, 2, 0),
    type: "mail",
    doorPosition: {
      x: 2.2, // Mail slot location
      z: -12, // Mail slot location
      radius: 0.8, // Area around mailbox where collision is disabled for interaction
    },
  },
  // Fishing Pond (circular, using approximation for collision)
  {
    minX: -25, // Left boundary of pond
    maxX: -15, // Right boundary of pond
    minZ: 15, // Near boundary of pond
    maxZ: 25, // Far boundary of pond
    type: "fishing",
    doorPosition: {
      x: -15.5, // Center position for interaction
      z: 17.6, // Edge of pond where dock is
      radius: 2, // Area for interaction
    },
  },
  // Barn (rotation calculated to face center)
  {
    ...calculateRotatedBoundaries(
      [15, 0, 8],
      8,
      10,
      Math.atan2(-15, -8) // updated rotation to face center based on new position
    ),
    type: "barn",
    doorPosition: {
      x: 15, // Updated door position
      z: 12, // Updated door position
      radius: 1.5, // Area around door where collision is disabled
    },
  },
]
