"use client"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useGameStore } from "@/store/game-store"

interface HouseDialogProps {
  onSleep?: () => void
  isTransitioning?: boolean
}

export function HouseDialog({
  onSleep,
  isTransitioning = false,
}: HouseDialogProps) {
  const gameStore = useGameStore(state => state)

  const handleSleep = () => {
    // Call the onSleep handler if it exists, otherwise just advance the day
    if (onSleep) onSleep()
    else gameStore.setNextDay()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Дом</DialogTitle>
        <DialogDescription>Ваше уютное жилище</DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Отдых</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <DialogClose asChild>
              <Button
                className='w-full'
                onClick={handleSleep}
                disabled={isTransitioning}
              >
                {isTransitioning ? "Сон..." : "Поспать"} 🌗
              </Button>
            </DialogClose>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
