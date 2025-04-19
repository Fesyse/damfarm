"use client";
import { Loading } from "@/components/ui/loading";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
const FarmGame = dynamic(
	() => import("@/components/farm-game").then((mod) => mod.FarmGame),
	{
		ssr: false,
		loading: () => null,
	}
);

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<AnimatePresence mode="wait">
				{isLoading && (
					<motion.div
						key={"loading"}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Loading />
					</motion.div>
				)}
			</AnimatePresence>
			<Suspense fallback={null}>
				<motion.div
					key={"farm-game"}
					initial={{ visibility: "hidden" }}
					animate={{ visibility: isLoading ? "hidden" : "visible" }}
				>
					<FarmGame />
				</motion.div>
			</Suspense>
		</>
	);
}
