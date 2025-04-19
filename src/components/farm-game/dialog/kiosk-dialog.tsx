"use client"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

export function KioskDialog() {
  const items = [
    { name: "Семена моркови", icon: "🥕", price: 10, stock: 15 },
    { name: "Семена картофеля", icon: "🥔", price: 15, stock: 10 },
    { name: "Семена пшеницы", icon: "🌾", price: 5, stock: 20 },
    { name: "Семена кукурузы", icon: "🌽", price: 20, stock: 8 },
    { name: "Удобрение", icon: "💩", price: 30, stock: 5 },
    { name: "Лейка", icon: "💧", price: 50, stock: 3 },
    { name: "Лопата", icon: "🧹", price: 40, stock: 4 },
  ]

  return (
    <>
      <DialogHeader>
        <DialogTitle>Киоск</DialogTitle>
        <DialogDescription>
          Покупайте семена и инструменты для вашей фермы
        </DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex justify-between items-center'>
          <div className='font-medium'>Ваш баланс:</div>
          <Badge
            variant='outline'
            className='flex items-center gap-2 px-3 py-1'
          >
            <Coins className='h-4 w-4 text-yellow-500' />
            <span className='text-lg font-bold'>1250</span>
          </Badge>
        </div>

        <div className='border rounded-md'>
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
              {items.map((item, i) => (
                <tr key={i} className='border-b'>
                  <td className='p-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xl'>{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className='text-right p-2'>{item.price}</td>
                  <td className='text-right p-2'>{item.stock}</td>
                  <td className='text-right p-2'>
                    <Button size='sm' variant='outline'>
                      Купить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
