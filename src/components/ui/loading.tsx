"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Progress } from "./progress";

export function Loading({ className }: { className?: string }) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const startTime = Date.now();
		const duration = 600;

		const timer = setInterval(() => {
			const elapsedTime = Date.now() - startTime;
			const newProgress = Math.min((elapsedTime / duration) * 100, 100);

			setProgress(newProgress);

			if (newProgress >= 100) {
				clearInterval(timer);
			}
		}, 16);

		return () => clearInterval(timer);
	}, []);

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 to-sky-500",
				className
			)}
		>
			{/* Облака */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute h-16 w-24 left-10 top-10 bg-white/80 rounded-full before:content-[''] before:absolute before:bottom-0 before:h-12 before:w-12 before:-left-4 before:bg-white/80 before:rounded-full after:content-[''] after:absolute after:bottom-0 after:h-14 after:w-14 after:-right-3 after:bg-white/80 after:rounded-full animate-float-slow" />
				<div className="absolute h-16 w-24 right-20 top-20 bg-white/80 rounded-full before:content-[''] before:absolute before:bottom-0 before:h-12 before:w-12 before:-left-4 before:bg-white/80 before:rounded-full after:content-[''] after:absolute after:bottom-0 after:h-14 after:w-14 after:-right-3 after:bg-white/80 after:rounded-full animate-float-medium" />
				<div className="absolute h-16 w-24 left-1/4 bottom-1/4 bg-white/80 rounded-full before:content-[''] before:absolute before:bottom-0 before:h-12 before:w-12 before:-left-4 before:bg-white/80 before:rounded-full after:content-[''] after:absolute after:bottom-0 after:h-14 after:w-14 after:-right-3 after:bg-white/80 after:rounded-full animate-float-fast" />
				<div className="absolute h-16 w-24 right-1/3 bottom-1/3 bg-white/80 rounded-full before:content-[''] before:absolute before:bottom-0 before:h-12 before:w-12 before:-left-4 before:bg-white/80 before:rounded-full after:content-[''] after:absolute after:bottom-0 after:h-14 after:w-14 after:-right-3 after:bg-white/80 after:rounded-full animate-float-medium" />
			</div>

			{/* Логотип и прогресс бар */}
			<div className="relative z-10 flex flex-col items-center gap-8 px-4">
				<div className="relative flex flex-col items-center animate-bounce-slow">
					<h1 className="text-6xl font-black text-white tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
						Dam<span className="text-green-400">Farm</span>
					</h1>
					<div className="text-lg font-medium text-white/90 -mt-1 tracking-widest drop-shadow-md">
						Симулятор фермы
					</div>
				</div>

				{/* Прогресс бар */}
				<div className="w-full max-w-md">
					<div className="relative">
						<Progress
							value={progress}
							className="h-4 w-full bg-white/20 [&>div]:bg-white"
						/>
						<div className="absolute left-0 right-0 -bottom-6 text-center text-sm font-medium text-white drop-shadow">
							Загрузка...
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
