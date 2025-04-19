"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/store/game-store";

export function HouseDialog() {
  const gameStore = useGameStore((state) => state);
  const onSkipDay = () => {
    gameStore.setNextDay();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Дом</DialogTitle>
        <DialogDescription>Ваше уютное жилище</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm">Отдых</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <DialogClose asChild>
              <Button className="w-full" onClick={onSkipDay}>
                Поспать (пропустить день)
              </Button>
            </DialogClose>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm">Прочитать почту</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Button className="w-full">Почта</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
