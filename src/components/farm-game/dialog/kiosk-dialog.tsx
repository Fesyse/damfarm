"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  ShoppingCart,
  PackageOpen,
  Shovel,
  SproutIcon as Seedling,
  Package,
  Apple,
  Leaf,
  Fish,
} from "lucide-react";
import { getPricesForPlants } from "@/data/json-data";
import { useGameStore } from "@/store/game-store";
import { useToast } from "@/components/ui/use-toast";
import { SeedsType } from "@/types/store";

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
	const tools = gameStore.tools
	const setTool = gameStore.setTool

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

  // Sell items categorized
  const productInventory = [
    { name: "Морковь", icon: "🥕", quantity: 8, sellPrice: 7 },
    { name: "Картофель", icon: "🥔", quantity: 12, sellPrice: 10 },
    { name: "Пшеница", icon: "🌾", quantity: 20, sellPrice: 3 },
    { name: "Кукуруза", icon: "🌽", quantity: 5, sellPrice: 12 },
  ];

  const plantInventory = [
    { name: "Саженец яблони", icon: "🌱", quantity: 3, sellPrice: 25 },
    { name: "Куст малины", icon: "🌿", quantity: 4, sellPrice: 20 },
    { name: "Цветок розы", icon: "🌹", quantity: 6, sellPrice: 15 },
    { name: "Кактус", icon: "🌵", quantity: 2, sellPrice: 18 },
  ];

  const fishInventory = [
    { name: "Карп", icon: "🐟", quantity: 5, sellPrice: 30 },
    { name: "Форель", icon: "🐠", quantity: 3, sellPrice: 45 },
    { name: "Окунь", icon: "🐡", quantity: 7, sellPrice: 25 },
    { name: "Сом", icon: "🦈", quantity: 1, sellPrice: 60 },
  ];


  const handleSell = (item) => {
    if (item.quantity > 0) {
      // setBalance(balance + item.sellPrice);
      // Here you would update the inventory
    }
  };

  return (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle className="text-2xl">Киоск</DialogTitle>
        <DialogDescription>
          Покупайте и продавайте товары для вашей фермы
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
                items={productInventory}
                onAction={handleSell}
              />
            </TabsContent>

            <TabsContent value="plants" className="space-y-4">
              <InventoryGrid
                items={getPricesForPlants(gameStore.days)}
                name="Растения"
                onAction={handleSell}
              />
            </TabsContent>

            <TabsContent value="fish" className="space-y-4">
              <InventoryGrid
                items={fishInventory}
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

// Component for Buy tables
function ItemTable({ items, onAction, actionLabel }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Товар</th>
            <th className="text-center p-3 font-medium">Цена</th>
            <th className="text-center p-3 font-medium">В наличии</th>
            <th className="text-right p-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className={`border-b ${i % 2 === 0 ? "bg-muted/20" : ""}`}
            >
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </td>
              <td className="text-center p-3">
                <Badge variant="secondary" className="font-semibold">
                  {item.price}
                </Badge>
              </td>
              <td className="text-center p-3">{item.stock}</td>
              <td className="text-right p-3">
                <Button
                  size="sm"
                  onClick={() => onAction(item)}
                  disabled={item.stock <= 0}
                  className="w-24"
                >
                  {actionLabel}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Component for Sell items in a grid
function InventoryGrid({ items, onAction, name }) {
  const gameStore = useGameStore((state) => state);
  if(name === "products"){

  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">У вас нет товаров для продажи</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 bg-background flex flex-col h-full"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="font-medium">{item.name}</span>
          </div>
          <div className="flex justify-between items-center mt-auto">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                Количество: {}
              </div>
              <div className="font-semibold flex gap-1 items-center">
                <Coins className="h-4 w-4 text-yellow-500" />

                {item.price}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction(item)}
              disabled={item.quantity <= 0}
            >
              Продать
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
// 	DialogDescription,
// 	DialogHeader,
// 	DialogTitle,
// } from "@/components/ui/dialog";
// import { Coins } from "lucide-react";

// export function KioskDialog() {



// 	return (
// 		<>
// 			<DialogHeader>
// 				<DialogTitle>Киоск</DialogTitle>
// 				<DialogDescription>
// 					Покупайте семена и инструменты для вашей фермы
// 				</DialogDescription>
// 			</DialogHeader>
// 			<div className="grid grid-cols-1 gap-4">
// 				<div className="flex justify-between items-center">
// 					<div className="font-medium">Ваш баланс:</div>
// 					<Badge
// 						variant="outline"
// 						className="flex items-center gap-2 px-3 py-1"
// 					>
// 						<Coins className="h-4 w-4 text-yellow-500" />
// 						<span className="text-lg font-bold">{moneys}</span>
// 					</Badge>
// 				</div>


// 			</div>
// 		</>
// 	);
// }
