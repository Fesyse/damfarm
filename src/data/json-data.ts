import data from "./money-work.json";

export const getData = data;

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
