"use client"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameStore } from "@/store/game-store"
import { useState } from "react"
import { Carrot, Hand } from "lucide-react"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

const animalEmoji = {
  cow: "🐄",
  chicken: "🐔",
  sheep: "🐑",
  pig: "🐖",
  rabbit: "🐇",
  horse: "🐎",
}

const animalProduct = {
  milk: "Молоко",
  eggs: "Яйца",
  wool: "Шерсть",
  meat: "Мясо",
}

const animalName = {
  cow: "Корова",
  chicken: "Курица",
  sheep: "Овца",
  pig: "Свинья",
  rabbit: "Кролик",
  horse: "Лошадь",
}

const productEmoji = {
  milk: "🥛",
  eggs: "🥚",
  wool: "🧶",
  meat: "🍖",
}
const availableAnimals = [
  { type: "cow", price: 2000, description: "Дает молоко каждый день" },
  { type: "chicken", price: 500, description: "Несет яйца каждый день" },
  { type: "sheep", price: 1500, description: "Дает шерсть каждые 3 дня" },
  { type: "pig", price: 1200, description: "Быстро растет, дает мясо" },
  { type: "rabbit", price: 400, description: "Дает мясо и мех" },
  { type: "horse", price: 3000, description: "Ускоряет передвижение" },
] as const
export function BarnDialog() {
  const [tab, setTab] = useState<"animals" | "market">("animals")
  const { animals, strokeAnimal, feedAnimal } = useGameStore(state => state)

  const strokeAnimalHandler = (id: number) => {
    const changed = strokeAnimal(id)
    if (changed) {
      toast.success("Вы погладили животное!", {
        description: (
          <span className='text-foreground'>Возвращайтесь завтра!</span>
        ),
      })
    } else {
      toast.error("Вы уже гладили это животное сегодня!")
    }
  }

  const feedAnimalHandler = (id: number) => {
    const changed = feedAnimal(id)
    if (changed) {
      toast.success("Вы покормили животное!", {
        description: (
          <span className='text-foreground'>Возвращайтесь завтра!</span>
        ),
      })
    } else {
      toast.error("Вы уже кормили это животное сегодня!")
    }
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>Амбар - Уход за животными</DialogTitle>
        <DialogDescription>
          Здесь вы можете ухаживать за вашими животными и собирать продукты
        </DialogDescription>
      </DialogHeader>

      <Tabs
        defaultValue='animals'
        value={tab}
        onValueChange={value => setTab(value as "animals" | "market")}
        className='mt-4'
      >
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
                      <CardTitle className='text-lg flex items-end gap-2'>
                        <span className='text-2xl'>
                          {animalEmoji[animal.type]}
                        </span>
                        {animal.name}
                      </CardTitle>
                      <span className='text-sm text-muted-foreground'>
                        {animalName[animal.type]}
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
                            <span>
                              {animalProduct[animal.product]}:{" "}
                              {animal.productAmount}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className='flex items-center gap-2 pt-2'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='sm'
                                variant='secondary'
                                className='flex-1'
                                onClick={() => strokeAnimalHandler(animal.id)}
                              >
                                <Hand />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Погладить</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='sm'
                                variant='secondary'
                                className='flex-1'
                                onClick={() => feedAnimalHandler(animal.id)}
                              >
                                <Carrot />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Покормить</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {animal.product && animal.productAmount > 0 && (
                          <Button size='sm' className='flex-1'>
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
              <Button onClick={() => setTab("market")}>Купить животных</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value='market' className='mt-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {availableAnimals.map((animal, index) => (
              <Card key={index} className='flex flex-col'>
                <CardHeader className='p-4 pb-2'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <span className='text-2xl'>{animalEmoji[animal.type]}</span>
                    <span className='capitalize'>
                      {animalName[animal.type]}
                    </span>
                  </CardTitle>
                  <CardDescription className='text-sm text-muted-foreground mb-4'>
                    {animal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='p-4 pt-0 mt-auto'>
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
