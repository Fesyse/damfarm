import { Position } from "../types";

export const calculateRotatedBoundaries = (
	position: Position,
	width: number,
	depth: number,
	rotationY: number
): { minX: number; maxX: number; minZ: number; maxZ: number } => {
	const [centerX, , centerZ] = position;
	const halfWidth = width / 2;
	const halfDepth = depth / 2;

	const corners = [
		[centerX - halfWidth, centerZ - halfDepth],
		[centerX + halfWidth, centerZ - halfDepth],
		[centerX + halfWidth, centerZ + halfDepth],
		[centerX - halfWidth, centerZ + halfDepth],
	];

	const rotatedCorners = corners.map(([x, z]) => {
		const translatedX = x - centerX;
		const translatedZ = z - centerZ;

		const rotatedX =
			translatedX * Math.cos(rotationY) - translatedZ * Math.sin(rotationY);
		const rotatedZ =
			translatedX * Math.sin(rotationY) + translatedZ * Math.cos(rotationY);

		return [rotatedX + centerX, rotatedZ + centerZ];
	});

	const xValues = rotatedCorners.map(([x]) => x);
	const zValues = rotatedCorners.map(([, z]) => z);

	return {
		minX: Math.min(...xValues),
		maxX: Math.max(...xValues),
		minZ: Math.min(...zValues),
		maxZ: Math.max(...zValues),
	};
};
