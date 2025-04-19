"use client"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function StocksDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Биржа</DialogTitle>
        <DialogDescription>
          Торгуйте акциями и станьте богаче!
        </DialogDescription>
      </DialogHeader>
      <div>Торговля акциями...</div>
    </>
  )
}
