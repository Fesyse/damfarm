export interface Fish {
	id: string;
	name: string;
	icon: string;
	rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
	value: number;
}
