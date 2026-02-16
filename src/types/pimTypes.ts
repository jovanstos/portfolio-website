import type { Stock } from "../pim/classes/Stock";
import type { PlayerPortfolio } from "../pim/classes/PlayerPortfolio";

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
  stock: Stock | PlayerPortfolio;
  color: string;
  width: number;
  height: number;
  tooltip: boolean;
};

export type PlayerProps = {
  playerName: string;
  playerIMG: string;
  portfolio: PlayerPortfolio;
  color: string;
  width: number;
  height: number;
};

export type PlayerStock = {
  stockObject: Stock;
  buyPrice: number;
  shares: number;
};
export type PlayerStake = {
  stockObject: Stock;
  stakePrice: number;
  stakeType: "UP" | "DOWN";
  stakeAmount: number;
};

export type NewsObject = {
  text: string;
  type: "Global" | "Company";
  company: string;
  severity: string;
  week: number;
};
