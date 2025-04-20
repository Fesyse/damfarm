"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Position, Rotation } from "../types";

interface MountainsProps {
	position: Position;
	rotation?: Rotation;
}

export function Mountains({
	position,
	rotation = [0, 0, 0] as Rotation,
}: MountainsProps) {
	const groupRef = useRef<THREE.Group>(null);

	const mountainRanges = useMemo(() => {
		return [
			{
				count: 5,
				basePosition: [0, 0, -28],
				spreadX: 70,
				spreadZ: 10,
				minScale: 10,
				maxScale: 20,
				minHeight: 35,
				maxHeight: 60,
				color: "#78909C",
				segments: 6,
			},
			{
				count: 4,
				basePosition: [0, 0, -24],
				spreadX: 80,
				spreadZ: 15,
				minScale: 15,
				maxScale: 25,
				minHeight: 45,
				maxHeight: 70,
				color: "#607D8B",
				segments: 6,
			},
		];
	}, []);

	const mountainData = useMemo(() => {
		const data: {
			x: number;
			y: number;
			z: number;
			scale: number;
			height: number;
			color: string;
			segments: number;
			snowCap: boolean;
		}[] = [];

		mountainRanges.forEach((range) => {
			for (let i = 0; i < range.count; i++) {
				const height =
					range.minHeight + Math.random() * (range.maxHeight - range.minHeight);
				data.push({
					x: range.basePosition[0] + (Math.random() - 0.5) * range.spreadX,
					y: 0,
					z: range.basePosition[2] + (Math.random() - 0.5) * range.spreadZ,
					scale:
						range.minScale + Math.random() * (range.maxScale - range.minScale),
					height: height,
					color: range.color,
					segments: range.segments,
					snowCap: height > 50,
				});
			}
		});

		return data;
	}, [mountainRanges]);

	return (
		<group position={position} rotation={rotation} ref={groupRef}>
			{mountainData.map((mountain, i) => (
				<group key={i} position={[mountain.x, 0, mountain.z]}>
					<mesh position={[0, mountain.height / 2, 0]} castShadow>
						<coneGeometry
							args={[mountain.scale, mountain.height, mountain.segments]}
						/>
						<meshStandardMaterial
							color={mountain.color}
							flatShading
							roughness={0.7}
							metalness={0.1}
						/>
					</mesh>

					{mountain.snowCap && (
						<mesh
							position={[0, mountain.height - mountain.height * 0.15, 0]}
							castShadow
						>
							<coneGeometry
								args={[
									mountain.scale * 0.65,
									mountain.height * 0.3,
									mountain.segments,
								]}
							/>
							<meshStandardMaterial
								color="#FFFFFF"
								roughness={0.3}
								metalness={0.1}
							/>
						</mesh>
					)}
				</group>
			))}
		</group>
	);
}
