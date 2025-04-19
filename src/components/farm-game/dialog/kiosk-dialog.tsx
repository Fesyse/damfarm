"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useGameStore } from "@/store/game-store";
import { SeedsType } from "@/types/store";
import { Coins } from "lucide-react";

interface ShopItem {
	name: string;
	icon: string;
	price: number;
	stock: number;
	type: "seed" | "tool";
	id: keyof SeedsType | "wateringCan" | "shovel";
}

export function KioskDialog() {
	const { toast } = useToast();
	const moneys = useGameStore((state) => state.moneys);
	const setMoney = useGameStore((state) => state.setMoney);
	const seeds = useGameStore((state) => state.seeds);
	const setSeeds = useGameStore((state) => state.setSeeds);
	const tools = useGameStore((state) => state.tools);
	const setTool = useGameStore((state) => state.setTool);

	const items: ShopItem[] = [
		{
			name: "Семена моркови",
			icon: "🥕",
			price: 10,
			stock: 15,
			type: "seed",
			id: "carrotsSeed",
		},
		{
			name: "Семена картофеля",
			icon: "🥔",
			price: 15,
			stock: 10,
			type: "seed",
			id: "potatoesSeed",
		},
		{
			name: "Семена пшеницы",
			icon: "🌾",
			price: 5,
			stock: 20,
			type: "seed",
			id: "wheatSeed",
		},
		{
			name: "Семена кукурузы",
			icon: "🌽",
			price: 20,
			stock: 8,
			type: "seed",
			id: "cornSeed",
		},
		{
			name: "Лейка",
			icon: "💧",
			price: 50,
			stock: 3,
			type: "tool",
			id: "wateringCan",
		},
		{
			name: "Лопата",
			icon: "🧹",
			price: 40,
			stock: 4,
			type: "tool",
			id: "shovel",
		},
	];

	const handleBuy = (item: ShopItem) => {
		if (moneys < item.price) {
			toast({
				title: "Недостаточно монет",
				description: `Для покупки ${item.name} нужно ${item.price} монет`,
			});
			return;
		}

		if (item.type === "tool" && tools[item.id as keyof typeof tools]) {
			toast({
				title: "У вас уже есть этот инструмент",
				description: `${item.name} уже куплен`,
			});
			return;
		}

		setMoney(-item.price);

		if (item.type === "seed") {
			setSeeds({
				...seeds,
				[item.id]: (seeds[item.id as keyof typeof seeds] || 0) + 1,
			});
			toast({
				title: "Покупка успешна",
				description: `Вы купили ${item.name}`,
			});
		} else if (item.type === "tool") {
			setTool(item.id as keyof typeof tools, true);
			toast({
				title: "Покупка успешна",
				description: `Вы купили ${item.name}`,
			});
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Киоск</DialogTitle>
				<DialogDescription>
					Покупайте семена и инструменты для вашей фермы
				</DialogDescription>
			</DialogHeader>
			<div className="grid grid-cols-1 gap-4">
				<div className="flex justify-between items-center">
					<div className="font-medium">Ваш баланс:</div>
					<Badge
						variant="outline"
						className="flex items-center gap-2 px-3 py-1"
					>
						<Coins className="h-4 w-4 text-yellow-500" />
						<span className="text-lg font-bold">{moneys}</span>
					</Badge>
				</div>

				<div className="border rounded-md">
					<table className="w-full">
						<thead>
							<tr className="border-b">
								<th className="text-left p-2">Товар</th>
								<th className="text-right p-2">Цена</th>
								<th className="text-right p-2">В наличии</th>
								<th className="text-right p-2">Действия</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item, i) => (
								<tr key={i} className="border-b">
									<td className="p-2">
										<div className="flex items-center gap-2">
											<span className="text-xl">{item.icon}</span>
											<span>{item.name}</span>
										</div>
									</td>
									<td className="text-right p-2">{item.price}</td>
									<td className="text-right p-2">
										{item.type === "seed"
											? seeds[item.id as keyof typeof seeds]
											: tools[item.id as keyof typeof tools]
											? "Куплено"
											: item.stock}
									</td>
									<td className="text-right p-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleBuy(item)}
											disabled={
												moneys < item.price ||
												(item.type === "tool" &&
													tools[item.id as keyof typeof tools])
											}
										>
											{item.type === "tool" &&
											tools[item.id as keyof typeof tools]
												? "Куплено"
												: "Купить"}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
