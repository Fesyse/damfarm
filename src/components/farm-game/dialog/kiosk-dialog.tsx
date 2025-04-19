"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
	getPricesForAnimalsProducts,
	getPricesForFishes,
	getPricesForPlants,
} from "@/data/json-data";
import { useGameStore } from "@/store/game-store";
import {
	FishType,
	ProductsType,
	ResoursesType,
	SeedsType,
} from "@/types/store";
import {
	Apple,
	Coins,
	Fish,
	Leaf,
	PackageOpen,
	ShoppingCart,
} from "lucide-react";

interface ShopItem {
	name: string;
	icon: string;
	price: number;
	stock: number;
	type: "seed" | "tool";
	id: keyof SeedsType | "wateringCan" | "shovel";
}

export function KioskDialog() {
	const gameStore = useGameStore((state) => state);
	const { toast } = useToast();
	const moneys = gameStore.moneys;
	const setMoney = gameStore.setMoney;
	const seeds = gameStore.seeds;
	const setSeeds = gameStore.setSeeds;
	const tools = gameStore.tools;
	const setTool = gameStore.setTool;

	const items: ShopItem[] = [
		{
			name: "Семена моркови",
			icon: "🥕",
			price: 10,
			stock: 8,
			type: "seed",
			id: "carrotsSeed",
		},
		{
			name: "Семена картофеля",
			icon: "🥔",
			price: 15,
			stock: 8,
			type: "seed",
			id: "potatoesSeed",
		},
		{
			name: "Семена пшеницы",
			icon: "🌾",
			price: 5,
			stock: 8,
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
			price: 1000,
			stock: 1,
			type: "tool",
			id: "wateringCan",
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
				[item.id]: {
					inInventory:
						(seeds[item.id as keyof typeof seeds]?.inInventory || 0) + 1,
					stock: (seeds[item.id as keyof typeof seeds]?.stock || 0) - 1,
				},
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

	const handleSell = (
		item: { name: string; key: string; price: number },
		type: "products" | "plants" | "fish"
	) => {
		if (type === "products") {
			gameStore.setProducts(
				item.key as keyof ProductsType,
				(gameStore.products[item.key as keyof typeof gameStore.products] || 0) -
					1
			);

			setMoney(item.price);
		} else if (type === "plants") {
			gameStore.setResource(
				item.key as keyof ResoursesType,
				(gameStore.resources[item.key as keyof typeof gameStore.resources] ||
					0) - 1
			);
			setMoney(item.price);
		} else if (type === "fish") {
			gameStore.setFishes(
				item.key as keyof FishType,
				(gameStore.fishes[item.key as keyof typeof gameStore.fishes] || 0) - 1
			);
			setMoney(item.price);
		}
	};

	return (
		<>
			<DialogHeader className="pb-4">
				<DialogTitle className="text-2xl">Киоск</DialogTitle>
				<DialogDescription>
					Покупайте и продавайте товары для вашей любимой фермы
				</DialogDescription>
			</DialogHeader>

			<div className="flex justify-between items-center mb-6 bg-muted/50 p-3 rounded-lg">
				<div className="font-medium text-lg flex items-center gap-2">
					<Coins className="h-5 w-5 text-yellow-500" />
					Ваш баланс:
				</div>
				<Badge
					variant="outline"
					className="px-4 py-1.5 text-lg font-bold bg-background"
				>
					{gameStore.moneys}
				</Badge>
			</div>

			<Tabs defaultValue="buy" className="w-full">
				<TabsList className="grid grid-cols-2 mb-4">
					<TabsTrigger value="buy" className="flex items-center gap-2">
						<ShoppingCart className="h-4 w-4" />
						Купить
					</TabsTrigger>
					<TabsTrigger value="sell" className="flex items-center gap-2">
						<PackageOpen className="h-4 w-4" />
						Продать
					</TabsTrigger>
				</TabsList>

				<TabsContent value="buy">
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
										<td className="text-right p-2 text-foreground/60">
											{item.type === "seed"
												? seeds[item.id as keyof typeof seeds]?.stock
												: item.type === "tool" &&
												  tools[item.id as keyof typeof tools]
												? "Куплено"
												: "1"}
										</td>
										<td className="text-right p-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleBuy(item)}
												disabled={
													moneys < item.price ||
													(item.type === "seed" &&
														seeds[item.id as keyof typeof seeds]?.stock <= 0) ||
													(item.type === "tool" &&
														tools[item.id as keyof typeof tools])
												}
											>
												{item.type === "seed" &&
												seeds[item.id as keyof typeof seeds]?.stock <= 0
													? "Распродано"
													: item.type === "tool" &&
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
				</TabsContent>
				<TabsContent value="sell">
					<Tabs defaultValue="products" className="w-full">
						<TabsList className="w-full mb-4 bg-muted/30">
							<TabsTrigger value="products" className="flex items-center gap-1">
								<Apple className="h-3.5 w-3.5" />
								Продукты
							</TabsTrigger>
							<TabsTrigger value="plants" className="flex items-center gap-1">
								<Leaf className="h-3.5 w-3.5" />
								Растения
							</TabsTrigger>
							<TabsTrigger value="fish" className="flex items-center gap-1">
								<Fish className="h-3.5 w-3.5" />
								Рыба
							</TabsTrigger>
						</TabsList>

						<TabsContent value="products" className="space-y-4">
							<InventoryGrid
								name="products"
								items={getPricesForAnimalsProducts()}
								onAction={handleSell}
							/>
						</TabsContent>

						<TabsContent value="plants" className="space-y-4">
							<InventoryGrid
								items={getPricesForPlants(gameStore.days)}
								name="plants"
								onAction={handleSell}
							/>
						</TabsContent>

						<TabsContent value="fish" className="space-y-4">
							<InventoryGrid
								items={getPricesForFishes(gameStore.days)}
								name="fish"
								onAction={handleSell}
							/>
						</TabsContent>
					</Tabs>
				</TabsContent>
			</Tabs>
		</>
	);
}

function InventoryGrid({
	items,
	onAction,
	name,
}: {
	items: { name: string; icon: string; price: number; key: string }[];
	onAction: (
		item: { name: string; key: string; price: number },
		type: "products" | "plants" | "fish"
	) => void;
	name: "products" | "plants" | "fish";
}) {
	if (items.length === 0) {
		return (
			<div className="text-center p-8 border rounded-lg bg-muted/20">
				<p className="text-muted-foreground">У вас нет товаров для продажи</p>
			</div>
		);
	}
	const gameStore = useGameStore((state) => state);

	return (
		<div className="grid grid-cols-2 gap-4">
			{items.map(({ name: itemName, price, key }, i) => {
				const myItemsCount =
					gameStore.resources[key as keyof typeof gameStore.resources] ??
					gameStore.products[key as keyof typeof gameStore.products] ??
					gameStore.fishes[key as keyof typeof gameStore.fishes];

				return (
					<div
						key={i}
						className="border rounded-lg p-4 bg-background flex flex-col h-full"
					>
						<div className="flex items-center gap-3 mb-3 justify-between w-full">
							<span className="font-medium">{itemName}</span>
							<span className="text-muted-foreground text-xs">
								У меня: {myItemsCount}
							</span>
						</div>
						<div className="flex justify-between items-center mt-auto">
							<div className="space-y-1">
								<div className="font-semibold flex gap-1 items-center">
									<Coins className="h-4 w-4 text-yellow-500" />

									{price}
								</div>
							</div>
							<Button
								size="sm"
								variant="outline"
								disabled={myItemsCount <= 0}
								onClick={() => onAction({ key, name: itemName, price }, name)}
							>
								Продать
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
