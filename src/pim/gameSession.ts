import { Stock } from "./classes/Stock";
import { PlayerPortfolio } from "./classes/PlayerPortfolio";
import { simulateNextWeek } from "./stockAlgorithm";
import { generateNewsValue, getNewsStory } from "./newsAlgorithm";
import { formatStockData } from "./PIMDataUtils";
import type { NewsObject } from "../types/pimTypes";
export interface GameSnapshot {
  phase: "start" | "playing" | "end";
  week: number;
  player: PlayerPortfolio;
  opponents: PlayerPortfolio[];
  stocks: Stock[];
  globalNews: number;
  news: NewsObject[];
}
function freshGame(): GameSnapshot {
  const stocks = [
    new Stock("NovaTech Robotics", 210.5, 450000000, 85, 75, 92),
    new Stock("GreenGrid Energy", 45.2, 380000000, 30, 15, 20),
    new Stock("BioPulse Pharma", 88, 120000000, 60, 90, 55),
    new Stock("TerraMart Global", 155.1, 1200000000, 45, 10, 12),
    new Stock("CloudStream Inc.", 12.75, 250000000, 95, 80, 88),
  ];
  const opponents = ["Preston", "Randy", "Granny"].map(
    (name) => new PlayerPortfolio(name),
  );
  opponents[2].addAsset(stocks[3], 644);
  return {
    phase: "start",
    week: 0,
    player: new PlayerPortfolio("Player 1"),
    opponents,
    stocks,
    globalNews: 0,
    news: [],
  };
}
export class GameSession {
  private state = freshGame();
  private listeners = new Set<() => void>();
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.state;
  private publish() {
    this.state = { ...this.state };
    this.listeners.forEach((fn) => fn());
  }
  restart = () => {
    this.state = freshGame();
    this.publish();
  };
  start = () => {
    if (this.state.phase !== "start") return;
    this.state.phase = "playing";
    this.advance();
  };
  advance = () => {
    const game = this.state;
    if (game.phase !== "playing" || game.week >= 26) return;
    const changes = game.stocks.map((stock) =>
      simulateNextWeek(game.week, stock, game.globalNews),
    );
    game.stocks.forEach((stock) =>
      stock.featureHistory.push(
        formatStockData(stock, game.globalNews, game.week),
      ),
    );
    game.week++;
    game.player.updateData(game.week);
    game.opponents[2].updateData(game.week);
    const [preston, randy] = game.opponents;
    const pick =
      Math.random() < 0.85
        ? changes.indexOf(Math.max(...changes))
        : Math.floor(Math.random() * changes.length);
    preston.cash += preston.cash * changes[pick];
    preston.updateData(game.week);
    randy.cash +=
      randy.cash * changes[Math.floor(Math.random() * changes.length)];
    randy.updateData(game.week);
    const news: NewsObject[] = [];
    game.stocks.forEach((stock) => {
      stock.companyNews = generateNewsValue();
      if (stock.companyNews !== 0)
        news.push({
          text: `${stock.name}: ${getNewsStory(stock.companyNews, "Company")}`,
          type: "Company",
          company: stock.name,
          severity: stock.companyNews > 0 ? "positive" : "negative",
          week: game.week,
        });
    });
    const chance = Math.random();
    if ((game.globalNews !== 0 && chance > 0.4) || chance > 0.75)
      game.globalNews = generateNewsValue();
    if (game.globalNews !== 0)
      news.push({
        text: getNewsStory(game.globalNews, "Global"),
        type: "Global",
        company: "N/A",
        severity: game.globalNews > 0 ? "positive" : "negative",
        week: game.week,
      });
    game.news = [...news, ...game.news].slice(0, 150);
    if (game.week === 26) game.phase = "end";
    this.publish();
  };
  trade = (
    command: "buy" | "sell" | "stake" | "unstake",
    stock: Stock,
    amount: number,
    direction: "UP" | "DOWN" = "UP",
  ) => {
    if (this.state.phase !== "playing")
      throw new Error("Start a game to trade.");
    if (!this.state.stocks.includes(stock)) throw new Error("Unknown stock.");
    const player = this.state.player;
    if (command === "buy") player.addAsset(stock, amount);
    if (command === "sell") player.sellAsset(amount);
    if (command === "stake") player.addStake(stock, amount, direction);
    if (command === "unstake") player.sellStake(amount);
    player.calculateAssets();
    this.publish();
  };
}
