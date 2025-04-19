"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { useState } from "react";
import { getQuest } from "@/story/story";
import { FishType, ProductsType, ResoursesType } from "@/types/store";

export function QuestDialog() {
  const gameStore = useGameStore((state) => state);
  const quest = getQuest(gameStore.days);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSkip = () => {
    setMessage("Вы пропустили квест. День завершён.");
    setErrorMessage("");
    setIsAvailable(false);
  };

  const handleComplete = () => {
    if (!quest.quest) return;

    if (quest.quest.type === "plants") {
      Object.entries(quest.quest?.give).forEach(([name, amount]) => {
        // Вычитаем каждый ресурс
        const resourceName = name as keyof ResoursesType;
        if (gameStore.resources[resourceName] < amount) {
          setErrorMessage(`Недостаточно ${resourceName}`);
          return;
        } else {
          gameStore.setResource(resourceName, -(amount as number));
          gameStore.setMoney(quest.quest.reward);
        }
      });
    }

    if (quest.quest.type === "products") {
      Object.entries(quest.quest?.give).forEach(([name, amount]) => {
        // Вычитаем каждый ресурс
        console.log(name, amount);

        const resourceName = name as keyof ProductsType;
        if (gameStore.products[resourceName] < amount) {
          setErrorMessage(`Недостаточно ${resourceName}`);
          return;
        } else {
          {
            gameStore.setProducts(resourceName, -(amount as number));
            gameStore.setMoney(quest.quest.reward);
          }
        }
      });
    }
    if (quest.quest.type === "fish") {
      Object.entries(quest.quest?.give).forEach(([name, amount]) => {
        // Вычитаем каждый ресурс
        const resourceName = name as keyof FishType;
        if (gameStore.fishes[resourceName] < amount) {
          setErrorMessage(`Недостаточно ${resourceName}`);
          return;
        } else {
          gameStore.setFishes(resourceName, -(amount as number));
          gameStore.setMoney(quest.quest.reward);
        }
      });
    }
    setMessage(
      `Квест выполнен! Получено ${quest?.quest?.reward}₽. Также вы услышали: '${quest.quest.storyReward}' - вы не уверены, что они говорят правду`
    );
  };

  if (!quest) {
    return null;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">🧾 Сюжет дня</DialogTitle>
      </DialogHeader>

      <Card className="mt-4 rounded-2xl shadow-sm border">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="text-primary w-5 h-5 mt-1" />
            <div className="text-base">{quest.message}</div>
          </div>

          {quest.quest && (
            <div>
              <div className="">
                <div className="text-sm text-muted-foreground">
                  Задание:
                  <ul className="ml-4 list-disc">
                    {Object.entries(quest.quest?.give || {}).map(
                      ([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="text-sm">Награда: {quest.quest.reward}₽</div>
              </div>
              {isAvailable && (
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleComplete} variant="default">
                    ✅ Выполнить
                  </Button>
                  <Button onClick={handleSkip} variant="secondary">
                    ❌ Пропустить
                  </Button>
                </div>
              )}
            </div>
          )}

          {message && !errorMessage && (
            <div className="text-sm text-center text-blue-600">{message}</div>
          )}
          {errorMessage && (
            <div className="text-sm text-center text-red-600">
              {errorMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
