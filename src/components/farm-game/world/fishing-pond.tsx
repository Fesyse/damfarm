"use client";

import { useMemo } from "react";

export function FishingPond() {
	return (
		<group rotation={[0, Math.PI / 1.5, 0]}>
			{/* Water surface with realistic color and slight movement */}
			<mesh
				position={[0, 0.05, 0]}
				rotation={[-Math.PI / 2, 0, 0]}
				receiveShadow
			>
				<circleGeometry args={[5, 32]} />
				<meshStandardMaterial
					color="#1e88e5"
					transparent={true}
					opacity={0.8}
					roughness={0.1}
					metalness={0.2}
				/>
			</mesh>

			<mesh position={[0, 0, 0]} receiveShadow>
				<ringGeometry args={[4.8, 5.2, 32]} />
				<meshStandardMaterial color="#795548" />
			</mesh>

			{[0, 1, 2, 3, 4, 5].map((i) => {
				const angle = (i / 6) * Math.PI * 2;
				const x = Math.cos(angle) * 5.2;
				const z = Math.sin(angle) * 5.2;
				const scale = useMemo(() => 0.3 + Math.random() * 0.4, []);

				return (
					<mesh key={`rock-${i}`} position={[x, 0.2, z]} castShadow>
						<dodecahedronGeometry args={[scale, 0]} />
						<meshStandardMaterial color="#777777" roughness={0.8} />
					</mesh>
				);
			})}

			{/* Fishing dock */}
			<group position={[0, 0.1, 5]}>
				{/* Dock platform */}
				<mesh position={[0, 0.15, -1.5]} castShadow receiveShadow>
					<boxGeometry args={[3, 0.2, 3]} />
					<meshStandardMaterial color="#8B4513" />
				</mesh>

				{/* Dock supports */}
				<mesh position={[-1.2, -0.15, -0.5]} castShadow>
					<cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
					<meshStandardMaterial color="#5D4037" />
				</mesh>
				<mesh position={[1.2, -0.15, -0.5]} castShadow>
					<cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
					<meshStandardMaterial color="#5D4037" />
				</mesh>
				<mesh position={[-1.2, -0.15, -2.5]} castShadow>
					<cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
					<meshStandardMaterial color="#5D4037" />
				</mesh>
				<mesh position={[1.2, -0.15, -2.5]} castShadow>
					<cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
					<meshStandardMaterial color="#5D4037" />
				</mesh>
			</group>

			{/* Fishing rod leaning on the dock */}
			<group position={[1.2, 0.6, 4]}>
				<mesh rotation={[0, 0, Math.PI / 4]} castShadow>
					<cylinderGeometry args={[0.03, 0.01, 3, 8]} />
					<meshStandardMaterial color="#8B4513" />
				</mesh>
				{/* Fishing line */}
				<mesh position={[1.5, -1.5, 0]} castShadow>
					<sphereGeometry args={[0.05, 8, 8]} />
					<meshStandardMaterial color="#ff5722" />
				</mesh>
			</group>

			{[0, 1, 2].map((i) => {
				const x = -2 + i * 2;
				const z = useMemo(() => -1 + Math.random() * 2, []);

				return (
					<group key={`lily-${i}`} position={[x, 0.1, z]}>
						<mesh rotation={[-Math.PI / 2, 0, 0]}>
							<circleGeometry args={[0.4, 16]} />
							<meshStandardMaterial color="#4CAF50" />
						</mesh>
						<mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
							<circleGeometry args={[0.15, 16]} />
							<meshStandardMaterial color="#E91E63" />
						</mesh>
					</group>
				);
			})}
		</group>
	);
}
