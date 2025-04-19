"use client"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function HouseDialog() {
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
            <Button className='w-full'>Поспать (пропустить день)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Хранилище</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <div className='text-center mb-2'>
              Здесь вы можете хранить свои вещи
            </div>
            <Button className='w-full'>Открыть хранилище</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Украшение дома</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <Button className='w-full'>Изменить интерьер</Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
