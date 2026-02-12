import type { Stock } from "../pim/Stock";

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
  stock: Stock,
  color: string,
  globalNews: number,
  week: number
}