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

export function FishingDialog() {
  const [isFishing, setIsFishing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [catchResult, setCatchResult] = useState<string | null>(null)

  const startFishing = () => {
    setIsFishing(true)
    setProgress(0)
    setCatchResult(null)

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          const catches = [
            "Окунь",
            "Карп",
            "Щука",
            "Форель",
            "Старый ботинок",
            "Водоросли",
          ]
          setCatchResult(catches[Math.floor(Math.random() * catches.length)])
          setIsFishing(false)
          return 100
        }
        return prev + 5
      })
    }, 300)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Рыбалка</DialogTitle>
        <DialogDescription>
          Начните рыбалку и поймайте что-нибудь интересное!
        </DialogDescription>
      </DialogHeader>
      <div className='grid grid-cols-1 gap-4'>
        {!isFishing && !catchResult && (
          <Button className='w-full' onClick={startFishing}>
            Начать рыбалку
          </Button>
        )}

        {isFishing && (
          <div className='space-y-4'>
            <div className='text-center text-lg'>Рыбалка в процессе...</div>
            <Progress value={progress} className='h-2 mb-2' />
          </div>
        )}

        {catchResult && (
          <div className='space-y-4'>
            <div className='text-center text-xl font-bold'>
              Вы поймали: {catchResult}!
            </div>
            <Button className='w-full' onClick={startFishing}>
              Попробовать снова
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className='p-3 pb-0'>
            <CardTitle className='text-sm'>Ваш улов сегодня</CardTitle>
          </CardHeader>
          <CardContent className='p-3'>
            <table className='w-full'>
              <thead>
                <tr>
                  <th className='text-left'>Рыба</th>
                  <th className='text-right'>Количество</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Окунь</td>
                  <td className='text-right'>2</td>
                </tr>
                <tr>
                  <td>Карп</td>
                  <td className='text-right'>1</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
