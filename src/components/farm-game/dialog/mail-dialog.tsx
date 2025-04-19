"use client"

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function MailDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Почта</DialogTitle>
        <DialogDescription>Проверьте свою почту!</DialogDescription>
      </DialogHeader>
      <div>Почтовый ящик пуст.</div>
    </>
  )
}
