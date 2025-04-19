import { InteractionPoint } from "../types"

// Calculate position in front of a building facing the center
const calculateInteractionPoint = (
  x: number,
  z: number,
  distanceFromBuilding: number
): [number, number, number] => {
  // Calculate angle from building to center
  const angle = Math.atan2(-x, -z)

  // Calculate position in front of the building using the angle
  const interactionX = x + Math.sin(angle) * distanceFromBuilding
  const interactionZ = z + Math.cos(angle) * distanceFromBuilding

  return [interactionX, 0, interactionZ]
}

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
    // Calculate position in front of kiosk based on center-facing rotation
    position: calculateInteractionPoint(5, 15, 2),
    key: "E",
    action: "посетить Киоск",
  },
  {
    type: "house",
    position: [0, 0, -7],
    key: "E",
    action: "войти в Дом",
  },
  {
    type: "stocks",
    // Updated position for stock exchange
    position: calculateInteractionPoint(15, -8, 2),
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
  {
    type: "barn",
    // Updated position for barn
    position: calculateInteractionPoint(15, 8, 3),
    key: "E",
    action: "ухаживать за животными",
  },
]
