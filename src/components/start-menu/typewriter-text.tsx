"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
	text: string;
}

export default function TypewriterText({ text }: TypewriterTextProps) {
	const [displayedText, setDisplayedText] = useState("");
	const controls = useAnimationControls();

	useEffect(() => {
		setDisplayedText("");
		let currentIndex = 0;

		const interval = setInterval(() => {
			if (currentIndex <= text.length) {
				setDisplayedText(text.substring(0, currentIndex));
				currentIndex++;
			} else {
				clearInterval(interval);
				controls.start({ opacity: 1 });
			}
		}, 40); // Скорость печати текста

		return () => clearInterval(interval);
	}, [text, controls]);

	return (
		<div className="relative w-full">
			<motion.div
				initial={{ opacity: 0.7 }}
				animate={controls}
				className="relative"
			>
				{displayedText}
				<motion.span
					animate={{ opacity: [1, 0, 1] }}
					transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
					className={
						displayedText.length === text.length ? "hidden" : "inline-block"
					}
				>
					|
				</motion.span>
			</motion.div>

			{/* Text shadow/glow effect */}
			<motion.div
				className="absolute inset-0 blur-sm opacity-50 text-white"
				animate={{ opacity: [0.3, 0.6, 0.3] }}
				transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
			>
				{displayedText}
			</motion.div>
		</div>
	);
}
