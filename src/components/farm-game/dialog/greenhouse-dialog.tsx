"use client";

import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useGameStore } from "@/store/game-store";
import { useEffect, useState } from "react";

interface Plant {
	id: string;
	name: string;
	emoji: string;
	growthTime: number; // in seconds
	basePrice: number;
	yield: number;
}

interface Plot {
	id: number;
	plant: string | null;
	stage: number;
	watered: boolean;
	plantedAt: number | null;
}

const PLANTS: Plant[] = [
	{
		id: "carrot",
		name: "Морковь",
		emoji: "🥕",
		growthTime: 60,
		basePrice: 10,
		yield: 2,
	},
	{
		id: "potato",
		name: "Картофель",
		emoji: "🥔",
		growthTime: 90,
		basePrice: 15,
		yield: 2,
	},
	{
		id: "wheat",
		name: "Пшеница",
		emoji: "🌾",
		growthTime: 45,
		basePrice: 8,
		yield: 2,
	},
	{
		id: "corn",
		name: "Кукуруза",
		emoji: "🌽",
		growthTime: 120,
		basePrice: 20,
		yield: 2,
	},
];

const PLOT_PRICE = 500;

export function GreenhouseDialog({}) {
	const { toast } = useToast();
	const [selectedPlant, setSelectedPlant] = useState<string>("carrot");
	const [plots, setPlots] = useState<Plot[]>([
		{ id: 1, plant: null, stage: 0, watered: false, plantedAt: null },
		{ id: 2, plant: null, stage: 0, watered: false, plantedAt: null },
		{ id: 3, plant: null, stage: 0, watered: false, plantedAt: null },
	]);

	const moneys = useGameStore((state) => state.moneys);
	const setMoney = useGameStore((state) => state.setMoney);

	// Update plant growth every second
	useEffect(() => {
		const interval = setInterval(() => {
			setPlots((currentPlots) =>
				currentPlots.map((plot) => {
					if (!plot.plant || !plot.plantedAt) return plot;

					const plant = PLANTS.find((p) => p.id === plot.plant);
					if (!plant) return plot;

					const now = Date.now();
					const elapsed = (now - plot.plantedAt) / 1000;
					const newStage = Math.min(
						Math.floor((elapsed / plant.growthTime) * 3),
						3
					);

					return {
						...plot,
						stage: newStage,
						watered: false, // Reset watered status every tick
					};
				})
			);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handlePlant = (plotId: number) => {
		const plantPrice = PLANTS.find((p) => p.id === selectedPlant)!.basePrice;
		if (moneys < plantPrice) {
			toast({
				title: "Недостаточно монет",
				description: "У вас недостаточно монет для посадки этого растения",
			});
			return;
		}

		setPlots((currentPlots) =>
			currentPlots.map((plot) =>
				plot.id === plotId
					? {
							...plot,
							plant: selectedPlant,
							stage: 0,
							watered: false,
							plantedAt: Date.now(),
					  }
					: plot
			)
		);
		setMoney(-plantPrice);
	};

	const handleWater = (plotId: number) => {
		setPlots((currentPlots) =>
			currentPlots.map((plot) =>
				plot.id === plotId ? { ...plot, watered: true } : plot
			)
		);
	};

	const handleHarvest = (plotId: number) => {
		const plot = plots.find((p) => p.id === plotId);
		if (!plot || !plot.plant) return;

		const plant = PLANTS.find((p) => p.id === plot.plant);
		if (!plant) return;

		const harvestedAmount = plant.yield;
		setMoney(harvestedAmount * plant.basePrice);

		setPlots((currentPlots) =>
			currentPlots.map((p) =>
				p.id === plotId
					? { ...p, plant: null, stage: 0, watered: false, plantedAt: null }
					: p
			)
		);

		toast({
			title: "Урожай собран!",
			description: `Вы получили ${harvestedAmount} ${plant.name} на сумму ${
				harvestedAmount * plant.basePrice
			} монет`,
		});
	};

	const handleBuyPlot = () => {
		if (moneys < PLOT_PRICE) {
			toast({
				title: "Недостаточно монет",
				description: "У вас недостаточно монет для покупки новой грядки",
			});
			return;
		}

		setMoney(-PLOT_PRICE);
		setPlots((currentPlots) => [
			...currentPlots,
			{
				id: currentPlots.length + 1,
				plant: null,
				stage: 0,
				watered: false,
				plantedAt: null,
			},
		]);

		toast({
			title: "Новая грядка",
			description: "Вы приобрели новую грядку!",
		});
	};

	return (
		<div className="relative">
			<div className="absolute right-4 top-4 flex items-center gap-2 text-sm">
				<span className="font-medium">💰</span>
				<span>{moneys}</span>
			</div>

			<div className="space-y-6">
				<DialogHeader>
					<DialogTitle className="text-2xl font-medium">Теплица</DialogTitle>
					<DialogDescription className="text-sm text-gray-500">
						Здесь вы можете выращивать растения в контролируемых условиях
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-2 flex-wrap">
					{PLANTS.map((plant) => (
						<button
							key={plant.id}
							onClick={() => setSelectedPlant(plant.id)}
							className={`
										flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
										${
											selectedPlant === plant.id
												? "bg-black text-white"
												: "bg-gray-100 hover:bg-gray-200"
										}
									`}
						>
							<span className="text-lg">{plant.emoji}</span>
							<div className="flex flex-col items-start">
								<span className="text-sm">{plant.name}</span>
								<span className="text-xs opacity-75">
									{plant.basePrice} монет
								</span>
							</div>
						</button>
					))}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{plots.map((plot) => (
						<div
							key={plot.id}
							className={`
										relative p-4 rounded-xl transition-all
										${
											plot.plant
												? "bg-gradient-to-b from-emerald-50 to-emerald-100"
												: "bg-gray-50 border-2 border-dashed border-gray-200"
										}
									`}
						>
							<div className="absolute top-3 right-3 text-xs text-gray-400">
								#{plot.id}
							</div>

							{plot.plant ? (
								<div className="flex flex-col items-center gap-3">
									<div className="relative">
										<div
											className={`
														text-4xl transform transition-all duration-500
														${plot.stage === 0 ? "scale-50 opacity-50" : ""}
														${plot.stage === 1 ? "scale-75 opacity-75" : ""}
														${plot.stage === 2 ? "scale-90 opacity-90" : ""}
														${plot.stage === 3 ? "scale-100 opacity-100" : ""}
													`}
										>
											{PLANTS.find((p) => p.id === plot.plant)?.emoji}
										</div>
										{plot.watered && (
											<span className="absolute -top-2 -right-2 text-sm">
												💧
											</span>
										)}
									</div>

									<div className="w-full space-y-2">
										<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-emerald-500 transition-all duration-500"
												style={{ width: `${(plot.stage / 3) * 100}%` }}
											/>
										</div>

										<div className="flex gap-2">
											<button
												onClick={() => handleWater(plot.id)}
												disabled={plot.watered}
												className={`
															flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
															${
																plot.watered
																	? "bg-gray-100 text-gray-400"
																	: "bg-blue-500 text-white hover:bg-blue-600"
															}
														`}
											>
												{plot.watered ? "Полито" : "Полить"}
											</button>
											<button
												onClick={() => handleHarvest(plot.id)}
												disabled={plot.stage < 3}
												className={`
															flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
															${
																plot.stage < 3
																	? "bg-gray-100 text-gray-400"
																	: "bg-emerald-500 text-white hover:bg-emerald-600"
															}
														`}
											>
												{plot.stage < 3 ? "Растёт..." : "Собрать"}
											</button>
										</div>
									</div>
								</div>
							) : (
								<div className="flex flex-col items-center gap-4 py-4">
									<div className="text-3xl opacity-25">🌱</div>
									<button
										onClick={() => handlePlant(plot.id)}
										className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
									>
										Посадить {PLANTS.find((p) => p.id === selectedPlant)?.emoji}
									</button>
								</div>
							)}
						</div>
					))}
				</div>

				<button
					onClick={handleBuyPlot}
					disabled={moneys < PLOT_PRICE}
					className={`
								w-full py-3 rounded-xl text-sm font-medium transition-colors
								${
									moneys < PLOT_PRICE
										? "bg-gray-100 text-gray-400 cursor-not-allowed"
										: "bg-emerald-500 text-white hover:bg-emerald-600"
								}
							`}
				>
					Добавить новую грядку ({PLOT_PRICE} монет)
				</button>
			</div>
		</div>
	);
}
