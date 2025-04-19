"use client"

import { useState } from "react"
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BarnDialog() {
  const animals = [
    {
      id: 1,
      type: "cow",
      name: "Бурёнка",
      health: 90,
      hunger: 70,
      happiness: 80,
      product: "milk",
      productAmount: 8,
      lastCollected: "Вчера",
    },
    {
      id: 2,
      type: "chicken",
      name: "Пеструшка",
      health: 95,
      hunger: 50,
      happiness: 90,
      product: "egg",
      productAmount: 12,
      lastCollected: "Сегодня",
    },
    {
      id: 3,
      type: "sheep",
      name: "Кудряшка",
      health: 85,
      hunger: 60,
      happiness: 70,
      product: "wool",
      productAmount: 0,
      lastCollected: "3 дня назад",
    },
    {
      id: 4,
      type: "pig",
      name: "Хрюша",
      health: 80,
      hunger: 30,
      happiness: 75,
      product: null,
      productAmount: 0,
      lastCollected: "-",
    },
  ]

  const animalEmoji = {
    cow: "🐄",
    chicken: "🐔",
    sheep: "🐑",
    pig: "🐖",
    rabbit: "🐇",
    horse: "🐎",
  }

  const productEmoji = {
    milk: "🥛",
    egg: "🥚",
    wool: "🧶",
  }

  const [availableAnimals] = useState([
    { type: "cow", price: 2000, description: "Дает молоко каждый день" },
    { type: "chicken", price: 500, description: "Несет яйца каждый день" },
    { type: "sheep", price: 1500, description: "Дает шерсть каждые 3 дня" },
    { type: "pig", price: 1200, description: "Быстро растет, дает мясо" },
    { type: "rabbit", price: 400, description: "Дает мясо и мех" },
    { type: "horse", price: 3000, description: "Ускоряет передвижение" },
  ])

  return (
    <>
      <DialogHeader>
        <DialogTitle>Амбар - Уход за животными</DialogTitle>
        <DialogDescription>
          Здесь вы можете ухаживать за вашими животными и собирать продукты
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue='animals' className='mt-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='animals'>Мои животные</TabsTrigger>
          <TabsTrigger value='market'>Купить животных</TabsTrigger>
        </TabsList>

        <TabsContent value='animals' className='space-y-4 mt-2'>
          {animals.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {animals.map(animal => (
                <Card key={animal.id}>
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex justify-between items-center'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <span className='text-2xl'>
                          {animalEmoji[animal.type]}
                        </span>
                        {animal.name}
                      </CardTitle>
                      <span className='text-sm text-muted-foreground'>
                        ID: {animal.id}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className='p-4 pt-0'>
                    <div className='space-y-3'>
                      <div>
                        <div className='flex justify-between mb-1 text-sm'>
                          <span>Здоровье</span>
                          <span>{animal.health}%</span>
                        </div>
                        <Progress value={animal.health} className='h-2' />
                      </div>

                      <div>
                        <div className='flex justify-between mb-1 text-sm'>
                          <span>Голод</span>
                          <span>{animal.hunger}%</span>
                        </div>
                        <Progress value={animal.hunger} className='h-2' />
                      </div>

                      <div>
                        <div className='flex justify-between mb-1 text-sm'>
                          <span>Счастье</span>
                          <span>{animal.happiness}%</span>
                        </div>
                        <Progress value={animal.happiness} className='h-2' />
                      </div>

                      {animal.product && (
                        <div className='flex justify-between items-center text-sm border-t pt-2 mt-2'>
                          <div className='flex items-center gap-1'>
                            <span>{productEmoji[animal.product]}</span>
                            <span>Продукт: {animal.productAmount}</span>
                          </div>
                          <span className='text-xs text-muted-foreground'>
                            Собрано: {animal.lastCollected}
                          </span>
                        </div>
                      )}

                      <div className='flex gap-2 pt-2'>
                        <Button size='sm' className='flex-1'>
                          {animal.hunger < 50 ? "Покормить" : "Погладить"}
                        </Button>
                        {animal.product && animal.productAmount > 0 && (
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex-1'
                          >
                            Собрать продукты
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <p className='mb-4'>У вас пока нет животных</p>
              <Button
                onClick={() => document.getElementById("market-tab")?.click()}
              >
                Купить животных
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value='market' className='mt-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {availableAnimals.map((animal, index) => (
              <Card key={index}>
                <CardHeader className='p-4 pb-2'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <span className='text-2xl'>{animalEmoji[animal.type]}</span>
                    <span className='capitalize'>{animal.type}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4 pt-0'>
                  <p className='text-sm text-muted-foreground mb-4'>
                    {animal.description}
                  </p>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold'>{animal.price} монет</span>
                    <Button size='sm'>Купить</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
