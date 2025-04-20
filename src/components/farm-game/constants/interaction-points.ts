import { InteractionPoint } from "../types";

const calculateInteractionPoint = (
	x: number,
	z: number,
	distanceFromBuilding: number
): [number, number, number] => {
	const angle = Math.atan2(-x, -z);

	const interactionX = x + Math.sin(angle) * distanceFromBuilding;
	const interactionZ = z + Math.cos(angle) * distanceFromBuilding;

	return [interactionX, 0, interactionZ];
};

export const INTERACTION_POINTS: InteractionPoint[] = [
	{
		type: "greenhouse",
		position: [-10, 0, 6.5],
		key: "E",
		action: "войти в Теплицу",
	},
	{
		type: "kiosk",
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
		position: calculateInteractionPoint(15, 8, 3),
		key: "E",
		action: "ухаживать за животными",
	},
];
