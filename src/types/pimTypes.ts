import type { Stock } from "../pim/classes/Stock";

export interface StockData {
  priceChange: number;
  globalNews: number;
  companyNews: number;
  momentum: number;
  volume: number;
  volatility: number;
  pOverE: number;
  socialBuzz: number;
  isEarningsWeek: number;
}

export type StockComponentProps = {
  stock: Stock;
  color: string;
  globalNews: number;
  week: number;
  width: number;
  height: number;
};

export type StockChartProps = {
  stock: Stock;
  color: string;
  width: number;
  height: number;
};

export type PlayerProps = {
  playerName: string;
  playerIMG: string;
  stock: Stock;
  color: string;
  width: number;
  height: number;
};
