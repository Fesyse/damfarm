"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGameStore } from "@/store/game-store";
import { useRouter } from "next/navigation";

interface HouseDialogProps {
	onSleep?: () => void;
	isTransitioning?: boolean;
}

export function HouseDialog({
	onSleep,
	isTransitioning = false,
}: HouseDialogProps) {
	const gameStore = useGameStore((state) => state);
	const router = useRouter();
	const handleSleep = () => {
		if (gameStore.days === 30) {
			router.push("/future");
		}
		if (onSleep) onSleep();
		else gameStore.setNextDay();
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
							<Button
								className="w-full"
								onClick={handleSleep}
								disabled={isTransitioning}
							>
								{isTransitioning ? "Сон..." : "Поспать"} 🌗
							</Button>
						</DialogClose>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
