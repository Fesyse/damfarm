import { Bush } from "./bush";
import { Tree } from "./tree";

export function TreeWithBush({ position, scale = 1 }) {
	const bushOffset = [(Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2];

	return (
		<>
			<Tree position={position} scale={scale} />
			<Bush
				position={[position[0] + bushOffset[0], 0, position[2] + bushOffset[2]]}
				scale={0.6 + Math.random() * 0.4}
			/>
		</>
	);
}
