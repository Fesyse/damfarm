"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getNews } from "@/data/json-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { useState } from "react";
import { useGameStore } from "@/store/game-store";

export function MailDialog() {
  const gameStore = useGameStore((state) => state);
  const news = getNews(gameStore.days);

  const [isPaidNewsMessage, setIsPaidNewsMessage] = useState("");

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "free":
        return "bg-green-100 text-green-700";
      case "paid":
        return "bg-yellow-100 text-yellow-800";
      case "controversial":
        return "bg-red-100 text-red-700";
      case "reliable":
        return "bg-blue-100 text-blue-700";
      case "unreliable":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  const BuyPaidNews = () => {
    if (gameStore.moneys < 150)
      setIsPaidNewsMessage(`У вас недостаточно средств (${gameStore.moneys}₽)`);
    else {
      gameStore.setMoney(-150);
      gameStore.setIsPaidNews(true);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">📬 Почта</DialogTitle>
        <DialogDescription className="text-base">
          Проверьте свою почту! Здесь самые свежие новости, влияющие на рынок.
        </DialogDescription>
      </DialogHeader>

      {!gameStore.is_paid_news  && (
        <div className="mt-4 mb-1">
          <Button variant="default" className="w-full" onClick={BuyPaidNews}>
            🔓 Купить платные новости (150₽)
          </Button>
          <div className="text-sm text-center text-red-700 ">
            {isPaidNewsMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mt-4">
        {news.stocks.map(
          (item, i) =>
            ((item.type === "paid" && gameStore.is_paid_news) ||
              item.type === "free") && (
              <Card key={i} className="rounded-2xl shadow-sm border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <Newspaper className="text-primary w-5 h-5 mt-1" />
                    <div className="text-base">{item.text}</div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getBadgeColor(item.type)}>
                      Тип: {item.type}
                    </Badge>
                    {item.reliability && (
                      <Badge className={getBadgeColor(item.reliability)}>
                        Надёжность: {item.reliability}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
        )}
        {news.shop.map(
          (item, i) =>
            ((item.type === "paid" && gameStore.is_paid_news) ||
              item.type === "free") && (
              <Card key={i} className="rounded-2xl shadow-sm border">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <Newspaper className="text-primary w-5 h-5 mt-1" />
                    <div className="text-base">{item.text}</div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getBadgeColor(item.type)}>
                      Тип: {item.type}
                    </Badge>
                    {item.reliability && (
                      <Badge className={getBadgeColor(item.reliability)}>
                        Надёжность: {item.reliability}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
        )}
      </div>
    </>
  );
}
