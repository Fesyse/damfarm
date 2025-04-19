import animalsProducts from "./animal-products.json";
import data from "./money-work.json";

export const getData = data;
export const getAnimalsProducts = animalsProducts;
export const getNews = (day: number) => {
	return data.days[day].news;
};

export const getStocks = (day: number) => {
	return data.days[day].stocks;
};

export const getStocksHistory = (day: number) => {
	const stocks = [];
	for (let i = 1; i < day; i++) {
		stocks.push(data.days[i].stocks);
	}
	return stocks;
};

export const getPricesForPlants = (day: number) => {
	return data.days[day].products.slice(0, 6);
};

export const getPricesForFishes = (day: number) => {
	return data.days[day].products.slice(6, -1);
};
export const getPricesForAnimalsProducts = () => {
	return getAnimalsProducts.products;
};
