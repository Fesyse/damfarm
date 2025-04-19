"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export function GameButtons(): React.ReactElement {
  const handleCloseGame = () => {
    window.close()
  }

  return (
    <div className='flex flex-col gap-4 p-6'>
      <Button
        className='bg-[#43A047] hover:bg-[#2E7D32] text-white font-bold py-3 text-lg border-b-4 border-[#1B5E20] hover:border-b-2 hover:mt-[2px]'
        style={{ boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)" }}
        onClick={() => (window.location.href = "/new-game")}
      >
        СОЗДАТЬ НОВУЮ ИГРУ
      </Button>

      <Button
        className='bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold py-3 text-lg border-b-4 border-[#0D47A1] hover:border-b-2 hover:mt-[2px]'
        style={{ boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)" }}
        onClick={() => (window.location.href = "/load-game")}
      >
        ПРОДОЛЖИТЬ ИГРУ
      </Button>

      <Button
        className='bg-[#E53935] hover:bg-[#C62828] text-white font-bold py-3 text-lg border-b-4 border-[#B71C1C] hover:border-b-2 hover:mt-[2px]'
        style={{ boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)" }}
        onClick={handleCloseGame}
      >
        ЗАКРЫТЬ ИГРУ
      </Button>
    </div>
  )
}
