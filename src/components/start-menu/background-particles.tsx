"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackgroundParticles() {
	const [particles, setParticles] = useState<
		Array<{ id: number; x: number; y: number; size: number; delay: number }>
	>([]);

	useEffect(() => {
		const newParticles = Array.from({ length: 30 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 4 + 1,
			delay: Math.random() * 5,
		}));

		setParticles(newParticles);
	}, []);

	return (
		<div className="absolute inset-0 overflow-hidden z-0">
			{particles.map((particle) => (
				<motion.div
					key={particle.id}
					className="absolute rounded-full bg-white opacity-70"
					style={{
						left: `${particle.x}%`,
						top: `${particle.y}%`,
						width: `${particle.size}px`,
						height: `${particle.size}px`,
					}}
					animate={{
						y: [0, -100, -200],
						opacity: [0, 0.7, 0],
						scale: [0, 1, 0.5],
					}}
					transition={{
						duration: 10 + Math.random() * 10,
						repeat: Number.POSITIVE_INFINITY,
						delay: particle.delay,
						ease: "linear",
					}}
				/>
			))}
		</div>
	);
}
