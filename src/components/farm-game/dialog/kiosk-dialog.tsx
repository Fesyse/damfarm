"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getPricesForAnimalsProducts,
  getPricesForFishes,
  getPricesForPlants,
} from "@/data/json-data"
import { useGameStore } from "@/store/game-store"
import type {
  FishType,
  ProductsType,
  ResoursesType,
  ShopItem,
} from "@/types/store"
import {
  Apple,
  Coins,
  Fish,
  Leaf,
  PackageOpen,
  ShoppingCart,
} from "lucide-react"
import { toast } from "sonner"

export function KioskDialog() {
  const {
    moneys,
    setMoney,
    seeds,
    setSeeds,
    tools,
    setTool,
    shopItems,
    ...gameStore
  } = useGameStore(state => state)
  const handleBuy = (itemToBuy: ShopItem) => {
    if (moneys < itemToBuy.price) {
      toast.error("Недостаточно монет", {
        description: (
          <span className='text-foreground'>
            Для покупки {itemToBuy.name} нужно {itemToBuy.price} монет
          </span>
        ),
      })
      return
    }

    if (
      itemToBuy.type === "tool" &&
      tools[itemToBuy.id as keyof typeof tools]
    ) {
      toast.error("У вас уже есть этот инструмент", {
        description: (
          <span className='text-foreground'>{itemToBuy.name} уже куплен</span>
        ),
      })
      return
    }

    setMoney(-itemToBuy.price)

    if (itemToBuy.type === "seed") {
      setSeeds({
        ...seeds,
        [itemToBuy.id]: {
          inInventory:
            (seeds[itemToBuy.id as keyof typeof seeds]?.inInventory || 0) + 1,
          stock: (seeds[itemToBuy.id as keyof typeof seeds]?.stock || 0) - 1,
        },
      })
      gameStore.setShopItems(
        shopItems.map(item => ({
          ...item,
          stock: item.id === itemToBuy.id ? item.stock - 1 : item.stock,
        }))
      )
      toast.success(`Вы купили ${itemToBuy.name}`, {
        description: (
          <span className='text-foreground'>Вы купили {itemToBuy.name}</span>
        ),
      })
    } else if (itemToBuy.type === "tool") {
      setTool(itemToBuy.id as keyof typeof tools, true)
      gameStore.setShopItems(
        shopItems.map(item => ({
          ...item,
          stock: item.id === itemToBuy.id ? item.stock - 1 : item.stock,
        }))
      )
      toast.success(`Вы купили ${itemToBuy.name}`)
    }
  }

  const handleSell = (
    item: { name: string; key: string; price: number },
    type: "products" | "plants" | "fish"
  ) => {
    if (type === "products") {
      gameStore.setProducts(item.key as keyof ProductsType, -1)

      setMoney(item.price)
    } else if (type === "plants") {
      gameStore.setResource(item.key as keyof ResoursesType, -1)
      setMoney(item.price)
    } else if (type === "fish") {
      gameStore.setFishes(item.key as keyof FishType, -1)
      setMoney(item.price)
    }
  }

  return (
    <>
      <DialogHeader className='pb-4'>
        <DialogTitle className='text-2xl'>Киоск</DialogTitle>
        <DialogDescription>
          Покупайте и продавайте товары для вашей любимой фермы
        </DialogDescription>
      </DialogHeader>

      <div className='flex justify-between items-center mb-6 bg-muted/50 p-3 rounded-lg'>
        <div className='font-medium text-lg flex items-center gap-2'>
          <Coins className='h-5 w-5 text-yellow-500' />
          Ваш баланс:
        </div>
        <Badge
          variant='outline'
          className='px-4 py-1.5 text-lg font-bold bg-background'
        >
          {moneys}
        </Badge>
      </div>
      <Tabs defaultValue='buy' className='w-full mb-4'>
        <TabsList className='grid grid-cols-2 mb-4'>
          <TabsTrigger value='buy' className='flex items-center gap-2'>
            <ShoppingCart className='h-4 w-4' />
            Купить
          </TabsTrigger>
          <TabsTrigger value='sell' className='flex items-center gap-2'>
            <PackageOpen className='h-4 w-4' />
            Продать
          </TabsTrigger>
        </TabsList>

        <TabsContent value='buy' className='flex justify-center'>
          <ScrollArea className='border rounded-md overflow-hidden max-md:w-[300px]'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2'>Товар</th>
                  <th className='text-right p-2'>Цена</th>
                  <th className='text-right p-2'>В наличии</th>
                  <th className='text-right p-2'>Действия</th>
                </tr>
              </thead>
              <tbody>
                {shopItems.map((item, i) => (
                  <tr key={i} className='border-b'>
                    <td className='p-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xl'>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className='text-right p-2'>{item.price}</td>
                    <td className='text-right p-2 text-foreground/60'>
                      {item.type === "seed"
                        ? item.stock
                        : item.type === "tool" &&
                          tools[item.id as keyof typeof tools]
                        ? "Куплено"
                        : "1"}
                    </td>
                    <td className='text-right p-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleBuy(item)}
                        disabled={
                          moneys < item.price ||
                          (item.type === "seed" && item.stock <= 0) ||
                          (item.type === "tool" &&
                            tools[item.id as keyof typeof tools])
                        }
                      >
                        {item.type === "seed" && item.stock <= 0
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
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </TabsContent>
        <TabsContent value='sell'>
          <Tabs defaultValue='products' className='w-full'>
            <TabsList className='w-full mb-4 bg-muted/30'>
              <TabsTrigger value='products' className='flex items-center gap-1'>
                <Apple className='h-3.5 w-3.5' />
                Продукты
              </TabsTrigger>
              <TabsTrigger value='plants' className='flex items-center gap-1'>
                <Leaf className='h-3.5 w-3.5' />
                Растения
              </TabsTrigger>
              <TabsTrigger value='fish' className='flex items-center gap-1'>
                <Fish className='h-3.5 w-3.5' />
                Рыба
              </TabsTrigger>
            </TabsList>

            <TabsContent value='products' className='space-y-4'>
              <InventoryGrid
                name='products'
                items={getPricesForAnimalsProducts()}
                onAction={handleSell}
              />
            </TabsContent>

            <TabsContent value='plants' className='space-y-4'>
              <InventoryGrid
                items={getPricesForPlants(gameStore.days)}
                name='plants'
                onAction={handleSell}
              />
            </TabsContent>

            <TabsContent value='fish' className='space-y-4'>
              <InventoryGrid
                items={getPricesForFishes(gameStore.days)}
                name='fish'
                onAction={handleSell}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </>
  )
}

function InventoryGrid({
  items,
  onAction,
  name,
}: {
  items: { name: string; icon: string; price: number; key: string }[]
  onAction: (
    item: { name: string; key: string; price: number },
    type: "products" | "plants" | "fish"
  ) => void
  name: "products" | "plants" | "fish"
}) {
  if (items.length === 0) {
    return (
      <div className='text-center p-8 border rounded-lg bg-muted/20'>
        <p className='text-muted-foreground'>У вас нет товаров для продажи</p>
      </div>
    )
  }
  const gameStore = useGameStore(state => state)

  return (
    <div className='grid grid-cols-2 gap-4'>
      {items.map(({ name: itemName, price, icon, key }, i) => {
        const myItemsCount =
          gameStore.resources[key as keyof typeof gameStore.resources] ??
          gameStore.products[key as keyof typeof gameStore.products] ??
          gameStore.fishes[key as keyof typeof gameStore.fishes]

        return (
          <div
            key={i}
            className='border rounded-lg p-4 bg-background flex flex-col h-full'
          >
            <div className='flex items-center gap-3 mb-3 justify-between w-full'>
              <span className='font-medium'>
                {icon} {itemName}
              </span>
              <span className='text-muted-foreground text-xs'>
                У меня: {myItemsCount}
              </span>
            </div>
            <div className='flex justify-between items-center mt-auto'>
              <div className='space-y-1'>
                <div className='font-semibold flex gap-1 items-center'>
                  <Coins className='h-4 w-4 text-yellow-500' />

                  {price}
                </div>
              </div>
              <Button
                size='sm'
                variant='outline'
                disabled={myItemsCount <= 0}
                onClick={() => onAction({ key, name: itemName, price }, name)}
              >
                Продать
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
