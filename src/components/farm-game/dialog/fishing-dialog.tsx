"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Fish } from "@/types/fish";
import { FishIcon, Shrimp } from "lucide-react";
import { useEffect, useState } from "react";

// Типы рыб
const FISH_TYPES: Fish[] = [
	{ id: "1", name: "Карась", icon: "🐟", rarity: "common", value: 10 },
	{ id: "2", name: "Щука", icon: "🐠", rarity: "uncommon", value: 25 },
	{ id: "3", name: "Сом", icon: "🐡", rarity: "rare", value: 50 },
	{ id: "4", name: "Форель", icon: "🐋", rarity: "epic", value: 100 },
	{
		id: "5",
		name: "Золотая рыбка",
		icon: "🐉",
		rarity: "legendary",
		value: 500,
	},
];

// Состояния игры
type GameState = "idle" | "fishing" | "hooking" | "catching";

// Пропсы компонента
interface FishingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCatch: (fish: Fish) => void;
}

export function FishingDialog({
	open,
	onOpenChange,
	onCatch,
}: FishingDialogProps) {
	const { toast } = useToast();
	const [gameState, setGameState] = useState<GameState>("idle");
	const [progress, setProgress] = useState(0);
	const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
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
			setCaughtFish(null);
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
			// Анимация поплавка
			const bobberTimer = setInterval(() => {
				setBobberOffset((prev) => {
					const newOffset = prev + (Math.random() * 2 - 1);
					return Math.max(-5, Math.min(5, newOffset));
				});
			}, 100);

			// Случайная поклевка
			const biteTimer = setInterval(() => {
				if (Math.random() < 0.1) {
					// 10% шанс поклевки
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
			// Таймер на поимку рыбы
			const timeout = setTimeout(() => {
				if (!hasStartedCatching && isMounted) {
					setGameState("idle");
					toast({
						title: "Упс!",
						description: "Рыба уплыла! Попробуйте еще раз.",
					});
				}
			}, 5000);
			setCatchTimeout(timeout);

			// Движение рыбы
			const timer = setInterval(() => {
				if (isMounted) {
					setFishPosition((prev) => {
						const newPosition = prev + (Math.random() * 10 - 5);
						// Ограничиваем движение рыбы в пределах 10-90%
						return Math.max(10, Math.min(90, newPosition));
					});
				}
			}, 100);

			return () => {
				clearInterval(timer);
				if (catchTimeout && !hasStartedCatching) {
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
			// Устанавливаем случайную цель для подсечки
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

		// Проверяем, близко ли крючок к рыбе
		if (Math.abs(hookPosition - fishPosition) < 10) {
			// Если таймер еще не запущен, запускаем его
			if (!holdTimer) {
				const timer = setInterval(() => {
					if (isMounted) {
						setHoldProgress((prev) => {
							if (prev >= 100) {
								clearInterval(timer);
								if (catchTimeout) clearTimeout(catchTimeout);
								const randomFish =
									FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
								setCaughtFish(randomFish);
								onCatch(randomFish);
								setGameState("idle");
								toast({
									title: "Успех!",
									description: `Вы поймали ${randomFish.name}!`,
								});
								return 100;
							}
							return prev + 100 / 30; // 3 секунды = 30 интервалов по 100мс
						});
					}
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

	return (
		<div className="space-y-4 p-4">
			<div className="text-center mb-4">
				{gameState === "idle" && (
					<p className="text-muted-foreground">
						Нажмите "Начать рыбалку" чтобы начать
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
								toast({
									title: "Рыба сорвалась!",
									description: "Попробуйте еще раз!",
								});
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
				onClick={(e) => {
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

			{caughtFish && (
				<div className="text-center p-4 bg-blue-50 rounded-lg">
					<p className="text-lg font-semibold">
						Поймана рыба: {caughtFish.name}
					</p>
					<p className="text-2xl my-2">{caughtFish.icon}</p>
					<p className="text-sm text-muted-foreground">
						Значение: {caughtFish.value} монет
					</p>
				</div>
			)}
		</div>
	);
}
