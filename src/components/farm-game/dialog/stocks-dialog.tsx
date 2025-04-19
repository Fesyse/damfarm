"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronDown, LineChart } from "lucide-react"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGameStore } from "@/store/game-store"
import { getStocks, getStocksHistory } from "@/data/json-data"
import { StocksType } from "@/types/store"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Generate random price history for demo
const generatePriceHistory = (
  actualPrice: number,
  actualName: string,
  history: { price: number; name: string }[][]
) => {
  const newHistory = []

  for (let i = 0; i < history.length; i++) {
    for (let j = 0; j < history[i].length; j++) {
      if (history[i][j].name === actualName) {
        newHistory.push(history[i][j].price)
      }
    }
  }
  newHistory.push(actualPrice)
  return newHistory
}

export function StocksDialog() {
  const gameStore = useGameStore(state => state)
  const stocks = getStocks(gameStore.days)

  const history = getStocksHistory(gameStore.days)

  const [errorMessage, setErrorMessage] = useState("")
  const [SuccessMessage, setSuccessMessage] = useState("")

  const [selectedStock, setSelectedStock] = useState(stocks[0])
  const [quantity, setQuantity] = useState(1)
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const newHistory = generatePriceHistory(
      selectedStock.price,
      selectedStock.name,
      history
    )
    console.log(newHistory)

    if (chartRef.current && history.length > 0) {
      drawChart(chartRef.current, newHistory)
    }
  }, [history, chartRef])

  const drawChart = (canvas: HTMLCanvasElement, data: number[]) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 20
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Find min and max values
    const min = Math.min(...data) * 0.95
    const max = Math.max(...data) * 1.05
    const range = max - min

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw price line
    ctx.beginPath()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    data.forEach((price, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = height - padding - ((price - min) / range) * chartHeight
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw points
    data.forEach((price, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = height - padding - ((price - min) / range) * chartHeight
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = "#000"
      ctx.fill()
    })

    // Draw price labels
    ctx.fillStyle = "#555"
    ctx.font = "12px Arial"
    ctx.fillText(`${min.toFixed(2)}`, 5, height - padding)
    ctx.fillText(`${max.toFixed(2)}`, 5, padding + 12)
  }

  const handleBuy = () => {
    setSuccessMessage("")
    if (quantity > 0 && selectedStock) {
      if (selectedStock.price * quantity <= gameStore.moneys) {
        gameStore.setMoney(-(selectedStock.price * quantity))
        gameStore.setStocks(selectedStock.name as keyof StocksType, quantity)
        setSuccessMessage(
          `Куплено ${quantity} акций ${
            selectedStock.name
          } за ${selectedStock.price.toFixed(2)} за 1 акцию`
        )
        setErrorMessage("")
      } else {
        setErrorMessage("Недостаточно средств")
      }
    } else {
      setErrorMessage("Количество акций должно быть больше нуля")
    }
  }

  const handleSell = () => {
    setSuccessMessage("")
    if (quantity > 0 && selectedStock) {
      if (
        gameStore.stocks[selectedStock.name as keyof StocksType] >= quantity
      ) {
        gameStore.setStocks(selectedStock.name as keyof StocksType, -quantity)
        gameStore.setMoney(selectedStock.price * quantity)
        setSuccessMessage(
          `Куплено ${quantity} акций ${
            selectedStock.name
          } за ${selectedStock.price.toFixed(2)} за 1 акцию`
        )
        setErrorMessage("")
      } else {
        setErrorMessage("Недостаточно акций в наличии")
      }
    } else {
      setErrorMessage("Количество акций должно быть больше нуля")
    }
  }
  const totalCost = (selectedStock?.price || 0) * quantity

  return (
    <>
      <DialogHeader>
        <DialogTitle>Биржа</DialogTitle>
        <DialogDescription>
          Торгуйте акциями и станьте богаче!
        </DialogDescription>
      </DialogHeader>

      <div className='grid gap-6 py-4'>
        {/* Stock Selection */}
        <div className='grid gap-2'>
          <Label htmlFor='stock'>Выберите акции:</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='w-full justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='font-mono'>{selectedStock.name}</span>
                  <span className='text-gray-500'>-</span>
                  <span>{selectedStock.name}</span>
                </div>
                <ChevronDown className='h-4 w-4 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {stocks.map((stock, id) => (
                <DropdownMenuItem
                  key={stock.name}
                  onClick={() => setSelectedStock(stock)}
                  className='flex justify-between cursor-pointer hover:bg-gray-100'
                >
                  <div className='flex gap-2'>
                    <span className='font-mono'>{stock.name}</span>
                    <span className='text-gray-500'>-</span>
                    <span>{stock.name}</span>
                  </div>
                  <span
                    className={
                      history.length > 0
                        ? history[gameStore.days - 2][id].price >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        : "text-gray-600"
                    }
                  >
                    ${stock.price}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stock Info */}
        <div className='grid grid-cols-2 gap-4 rounded-lg border p-4'>
          <div>
            <p className='text-sm text-gray-500'>Текущая цена</p>
            <p className='text-2xl font-bold'>
              ${selectedStock.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Price Chart */}
        <ScrollArea className='min-w-[300px] overflow-hidden'>
          <div className='rounded-lg border p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-medium'>График цены</h3>
              <div className='flex items-center gap-1'>
                <LineChart className='h-4 w-4' />
                <span className='text-sm text-gray-500'>30 дней</span>
              </div>
            </div>
            <ScrollArea className='w-[550px] overflow-hidden'>
              <canvas
                ref={chartRef}
                width={550}
                height={200}
                className='w-full'
              ></canvas>
            </ScrollArea>
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

        {/* Buy Controls */}
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='quantity'>Количество акций:</Label>
            <Input
              id='quantity'
              type='number'
              min='1'
              max='100'
              defaultValue={quantity}
              onChange={e => {
                if (
                  Number.parseInt(e.target.value) <= 100 &&
                  Number.parseInt(e.target.value) >= 1
                ) {
                  setQuantity(Number.parseInt(e.target.value))
                } else {
                  setErrorMessage("Количество акций должно быть от 1 до 100")
                }
              }}
              className='w-full'
            />
          </div>

          <div className='rounded-lg border p-4'>
            <div className='flex justify-between'>
              <span>Итого:</span>
              <span className='font-bold'>${totalCost.toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Итого:</span>
              <span className='font-bold'>
                {selectedStock
                  ? gameStore.stocks[selectedStock.name as keyof StocksType]
                  : 0}
              </span>
            </div>
          </div>

          <div className='flex gap-5 items-center justify-center'>
            <div className=''>
              <Button onClick={handleBuy} className='w-full bg-green-600'>
                Купить {quantity} акций {selectedStock.name}
              </Button>
            </div>
            <div className=''>
              <Button onClick={handleSell} className='w-full bg-red-600'>
                Продать {quantity} акций {selectedStock.name}
              </Button>
            </div>
          </div>
          {SuccessMessage ? (
            <div className='text-center text-green-700 text-sm'>
              {SuccessMessage}
            </div>
          ) : errorMessage ? (
            <div className='text-center text-red-700 text-sm'>
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
