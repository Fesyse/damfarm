export type BuildingBoundary = {
	minX: number;
	maxX: number;
	minZ: number;
	maxZ: number;
	type: string;
	doorPosition?: {
		x: number;
		z: number;
		radius: number;
	};
};
