"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { FISH_NAME } from "@/constants/fishes";
import { getRandomFishByChance } from "@/lib/get-random-fish";
import { useGameStore } from "@/store/game-store";
import { Fish } from "@/types/fish";
import { FishType } from "@/types/store";
import { FishIcon, Shrimp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type GameState = "idle" | "fishing" | "hooking" | "catching";

type FishingDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCatch: (fish: Fish) => void;
};

const fishRarity = {
	common: "обычная",
	uncommon: "необычная",
	rare: "редкая",
	epic: "эпическая",
	legendary: "легендарная",
};

export function FishingDialog({
	open,
	onOpenChange,
	onCatch,
}: FishingDialogProps) {
	const gameStore = useGameStore((state) => state);

	const [gameState, setGameState] = useState<GameState>("idle");
	const [progress, setProgress] = useState(0);
	const [caughtFish, setCaughtFish] = useState<Fish[]>([]);
	const [hookPosition, setHookPosition] = useState(50);
	const [fishPosition, setFishPosition] = useState(50);
	const [bobberOffset, setBobberOffset] = useState(0);
	const [isBiting, setIsBiting] = useState(false);
	const [biteTimeout, setBiteTimeout] = useState<NodeJS.Timeout | null>(null);
	const [hookProgress, setHookProgress] = useState(0);
	const [hookTarget, setHookTarget] = useState(50);
	const [holdProgress, setHoldProgress] = useState(0);
	const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
	const [catchTimeout, setCatchTimeout] = useState<NodeJS.Timeout | null>(null);
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [hasStartedCatching, setHasStartedCatching] = useState(false);
	const [isMounted, setIsMounted] = useState(true);

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	useEffect(() => {
		if (open) {
			setGameState("idle");
			setProgress(0);
			setCaughtFish([]);
			setHookPosition(50);
			setFishPosition(50);
			setBobberOffset(0);
			setIsBiting(false);
			setHookProgress(0);
			setHookTarget(50);
			setHoldProgress(0);
			setIsMouseDown(false);
			setHasStartedCatching(false);
			if (biteTimeout) clearTimeout(biteTimeout);
			if (holdTimer) clearInterval(holdTimer);
			if (catchTimeout) clearTimeout(catchTimeout);
		}
	}, [open]);

	useEffect(() => {
		if (gameState === "fishing") {
			const bobberTimer = setInterval(() => {
				setBobberOffset((prev) => {
					const newOffset = prev + (Math.random() * 2 - 1);
					return Math.max(-5, Math.min(5, newOffset));
				});
			}, 100);

			const biteTimer = setInterval(() => {
				if (Math.random() < 0.1) {
					setIsBiting(true);
					const timeout = setTimeout(() => {
						setIsBiting(false);
					}, 1000);
					setBiteTimeout(timeout);
				}
			}, 500);

			return () => {
				clearInterval(bobberTimer);
				clearInterval(biteTimer);
				if (biteTimeout) clearTimeout(biteTimeout);
			};
		}
	}, [gameState]);

	useEffect(() => {
		if (gameState === "hooking") {
			const timer = setInterval(() => {
				setHookProgress((prev) => {
					if (prev >= 100) {
						clearInterval(timer);
						setGameState("idle");
						return 100;
					}
					return prev + 2;
				});
			}, 50);

			return () => clearInterval(timer);
		}
	}, [gameState]);

	useEffect(() => {
		if (gameState === "catching") {
			console.log("Catching state started");
			const timeout = setTimeout(() => {
				if (!hasStartedCatching && isMounted) {
					setGameState("idle");
					toast.error("Упс, рыбка уплыла! Попробуйте еще раз.");
				}
			}, 5000);
			setCatchTimeout(timeout);

			const timer = setInterval(() => {
				if (isMounted) {
					setFishPosition((prev) => {
						const newPosition = prev + (Math.random() * 10 - 5);
						return Math.max(10, Math.min(90, newPosition));
					});
				}
			}, 100);

			return () => {
				clearInterval(timer);
				if (catchTimeout) {
					clearTimeout(catchTimeout);
				}
			};
		}
	}, [gameState, hasStartedCatching, isMounted]);

	const handleStartFishing = () => {
		setGameState("fishing");
		setProgress(0);
		setIsBiting(false);
		setHookProgress(0);
		setHookTarget(50);
	};

	const handleClick = () => {
		if (gameState === "fishing" && isBiting) {
			setGameState("hooking");
			setIsBiting(false);
			if (biteTimeout) clearTimeout(biteTimeout);
			setHookTarget(Math.random() * 100);
		}
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (gameState === "catching") {
			setIsMouseDown(true);
			setHasStartedCatching(true);
			if (catchTimeout) {
				clearTimeout(catchTimeout);
				setCatchTimeout(null);
			}
			handleMoveHook(e);
		}
	};

	const handleMouseUp = () => {
		setIsMouseDown(false);
		if (holdTimer) {
			clearInterval(holdTimer);
			setHoldTimer(null);
		}
		setHoldProgress(0);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (gameState === "catching" && isMouseDown) {
			handleMoveHook(e);
		}
	};

	const handleMoveHook = (e: React.MouseEvent<HTMLDivElement>) => {
		if (gameState !== "catching") return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const position = (x / rect.width) * 100;
		setHookPosition(Math.max(0, Math.min(100, position)));

		if (Math.abs(hookPosition - fishPosition) < 10) {
			if (!holdTimer && isMounted) {
				const timer = setInterval(() => {
					if (!isMounted) {
						clearInterval(timer);
						return;
					}

					setHoldProgress((prev) => {
						const newProgress = prev + 100 / 30;
						if (newProgress >= 100) {
							if (holdTimer) clearInterval(holdTimer);
							if (catchTimeout) clearTimeout(catchTimeout);

							const randomFish = getRandomFishByChance();
							if (isMounted) {
								setCaughtFish((prev) => [...prev, randomFish]);
								setGameState("idle");
								onCatch(randomFish);
								gameStore.setFishes(randomFish.name as keyof FishType, 1);
							}
							return 100;
						}
						return newProgress;
					});
				}, 100);
				setHoldTimer(timer);
			}
		} else {
			if (holdTimer) {
				clearInterval(holdTimer);
				setHoldTimer(null);
			}
			setHoldProgress(0);
		}
	};

	useEffect(() => {
		return () => {
			if (holdTimer) clearInterval(holdTimer);
			if (catchTimeout) clearTimeout(catchTimeout);
			if (biteTimeout) clearTimeout(biteTimeout);
		};
	}, [holdTimer, catchTimeout, biteTimeout]);

	return (
		<div className="space-y-4 p-4">
			<div className="text-center mb-4">
				{gameState === "idle" && (
					<p className="text-muted-foreground">
						Нажмите &quot;Начать рыбалку&quot; чтобы начать
					</p>
				)}
				{gameState === "fishing" && (
					<p className="text-muted-foreground">
						{isBiting ? "Поклевка! Нажмите чтобы подсечь!" : "Ждем поклевку..."}
					</p>
				)}
				{gameState === "hooking" && (
					<p className="text-muted-foreground">
						Подсекайте! Нажмите когда полоска достигнет цели!
					</p>
				)}
				{gameState === "catching" && (
					<p className="text-muted-foreground">
						Двигайте мышкой чтобы поймать рыбу!
					</p>
				)}
			</div>

			{gameState === "hooking" && (
				<div className="space-y-2">
					<div className="h-2 w-full bg-secondary rounded-full overflow-hidden relative">
						<div
							className="absolute top-0 left-0 h-full bg-primary transition-all duration-50"
							style={{ width: `${hookProgress}%` }}
						/>
						<div
							className="absolute top-0 w-1 h-full bg-red-500"
							style={{ left: `${hookTarget}%` }}
						/>
					</div>
					<Button
						className="w-full"
						onClick={() => {
							if (Math.abs(hookProgress - hookTarget) < 10) {
								setGameState("catching");
								// Устанавливаем начальную позицию рыбы
								setFishPosition(Math.random() * 100);
							} else {
								setGameState("idle");
								toast.error("Рыба сорвалась! Попробуйте еще раз!");
							}
						}}
					>
						Подсечь!
					</Button>
				</div>
			)}

			<div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
				<Progress value={progress} className="h-full" />
			</div>

			<div
				className="relative h-48 bg-blue-200/50 rounded-lg cursor-pointer border-2 border-blue-300"
				onMouseMove={handleMouseMove}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onClick={() => {
					if (gameState === "fishing" && isBiting) {
						handleClick();
					}
				}}
			>
				{gameState === "fishing" && (
					<Shrimp
						className="absolute top-1/2 left-1/2 w-8 h-8"
						style={{
							transform: `translate(-50%, ${bobberOffset}px)`,
							transition: "transform 0.1s ease-out",
						}}
					/>
				)}
				{gameState === "catching" && (
					<>
						<div
							className="absolute top-4 w-2 h-12"
							style={{
								left: `${hookPosition}%`,
								transform: "translateX(-50%)",
							}}
						>
							<Icons.Hook />
						</div>
						<div
							className="absolute bottom-4 w-12 h-12 flex items-center justify-center"
							style={{
								left: `${fishPosition}%`,
								transform: "translateX(-50%)",
							}}
						>
							<FishIcon className="w-8 h-8 text-blue-600" />
						</div>
						{holdProgress > 0 && (
							<div className="absolute bottom-16 left-0 right-0 px-4">
								<div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
									<div
										className="h-full bg-green-500 transition-all duration-100"
										style={{ width: `${holdProgress}%` }}
									/>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<div className="flex justify-between">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Закрыть
				</Button>
				<Button onClick={handleStartFishing} disabled={gameState !== "idle"}>
					{gameState === "idle" ? "Начать рыбалку" : "Рыбачим..."}
				</Button>
			</div>

			{caughtFish.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-lg font-medium text-center">Пойманные рыбы:</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{caughtFish.map((fish, index) => (
							<div
								key={`${fish.name}-${index}`}
								className={`text-center p-3 rounded-lg space-y-1 border ${
									{
										common: "bg-gray-100 border-gray-300",
										uncommon: "bg-green-100 border-green-300",
										rare: "bg-blue-100 border-blue-300",
										epic: "bg-purple-100 border-purple-300",
										legendary: "bg-yellow-100 border-yellow-400",
									}[fish.rarity]
								}`}
							>
								<p className="text-base font-semibold">
									{FISH_NAME[fish.name as keyof typeof FISH_NAME]}
								</p>
								<p className="text-xl">{fish.icon}</p>
								<p
									className={`text-xs font-medium ${
										{
											common: "text-gray-600",
											uncommon: "text-green-700",
											rare: "text-blue-700",
											epic: "text-purple-700",
											legendary: "text-yellow-700",
										}[fish.rarity]
									}`}
								>
									Редкость: {fishRarity[fish.rarity]}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
