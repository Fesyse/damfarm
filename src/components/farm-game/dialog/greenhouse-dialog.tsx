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

export function GreenhouseDialog() {
  const plots = [
    { id: 1, plant: "carrot", stage: 2, watered: true },
    { id: 2, plant: "potato", stage: 1, watered: false },
    { id: 3, plant: "wheat", stage: 3, watered: true },
    { id: 4, plant: null, stage: 0, watered: false },
    { id: 5, plant: "corn", stage: 2, watered: true },
  ]
  const [selectedPlant, setSelectedPlant] = useState("carrot")

  return (
    <>
      <DialogHeader>
        <DialogTitle>Теплица - Управление растениями</DialogTitle>
        <DialogDescription>
          Здесь вы можете выращивать растения в контролируемых условиях
        </DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex gap-2 mb-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("carrot")}
            className={selectedPlant === "carrot" ? "ring-2 ring-primary" : ""}
          >
            🥕 Морковь
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("potato")}
            className={selectedPlant === "potato" ? "ring-2 ring-primary" : ""}
          >
            🥔 Картофель
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("wheat")}
            className={selectedPlant === "wheat" ? "ring-2 ring-primary" : ""}
          >
            🌾 Пшеница
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSelectedPlant("corn")}
            className={selectedPlant === "corn" ? "ring-2 ring-primary" : ""}
          >
            🌽 Кукуруза
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {plots.map(plot => (
            <Card key={plot.id}>
              <CardHeader className='p-3 pb-0'>
                <CardTitle className='text-sm'>Грядка #{plot.id}</CardTitle>
              </CardHeader>
              <CardContent className='p-3'>
                {plot.plant ? (
                  <div className='flex items-center gap-3'>
                    <div className='text-3xl'>
                      {plot.plant === "carrot" && "🥕"}
                      {plot.plant === "potato" && "🥔"}
                      {plot.plant === "wheat" && "🌾"}
                      {plot.plant === "corn" && "🌽"}
                      {plot.plant === "tomato" && "🍅"}
                    </div>
                    <div className='flex-1'>
                      <div className='flex justify-between mb-1'>
                        <span className='capitalize'>{plot.plant}</span>
                        <span>{plot.watered ? "💧" : ""}</span>
                      </div>
                      <Progress value={plot.stage * 33} className='h-2 mb-2' />
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant={plot.watered ? "outline" : "default"}
                        >
                          {plot.watered ? "Полито" : "Полить"}
                        </Button>
                        <Button size='sm' variant='destructive'>
                          Убрать
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <div className='text-center text-muted-foreground mb-2'>
                      Пустая грядка
                    </div>
                    <Button size='sm' className='w-full'>
                      Посадить{" "}
                      {selectedPlant === "carrot"
                        ? "🥕"
                        : selectedPlant === "potato"
                        ? "🥔"
                        : selectedPlant === "wheat"
                        ? "🌾"
                        : "🌽"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className='mt-4'>Добавить новую грядку (500 монет)</Button>
      </div>
    </>
  )
}
