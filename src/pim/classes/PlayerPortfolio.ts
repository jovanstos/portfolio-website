import type { PlayerStock, PlayerStake } from "../../types/pimTypes";
import type { Stock } from "./Stock";

export class PlayerPortfolio {
  name: string;
  // Used to give IDs
  currentID: number;
  // How much money
  cash: number;
  // How much total assets + cash
  assets: number;
  data: [number | undefined, number][];
  // {
  //   stockObject: Stock;
  //   buyPrice: 100;
  //   shares: 100;
  // }
  stocks: Record<number, PlayerStock>;
  // {
  //   stockObject: Stock;
  //   stakePrice: 100;
  //   stakeAmount: 100;
  // }
  stakes: Record<number, PlayerStake>;

  constructor(playerName: string) {
    this.name = playerName;

    this.currentID = 0;
    this.cash = 100000;
    this.assets = this.cash;

    this.data = [[0, this.assets]];

    this.stocks = {};
    this.stakes = {};
  }

  updateData(week: number) {
    // Calculate stake to see if you hit or not first since that's cash
    this.calculateStakes();
    this.calculateAssets();

    this.data.push([week, this.assets]);
  }

  addAsset(stock: Stock, shares: number) {
    this.stocks[this.currentID] = {
      stockObject: stock,
      buyPrice: stock.currentPrice,
      shares: shares,
    };

    this.currentID += 1;

    // Deduct cash
    this.cash -= stock.currentPrice * shares;
  }

  sellAsset(id: number) {
    const asset = this.stocks[id];
    if (!asset) return;

    // Logic to add cash back based on current stock price
    this.cash += asset.stockObject.currentPrice * asset.shares;

    // Remove the asset instantly by ID
    delete this.stocks[id];
  }

  addStake(stock: Stock, amount: number, type: "UP" | "DOWN") {
    this.stakes[this.currentID] = {
      stockObject: stock,
      stakePrice: stock.currentPrice,
      stakeType: type,
      stakeAmount: amount,
    };

    this.currentID += 1;

    this.cash -= amount;
  }

  sellStake(id: number) {
    const stake = this.stakes[id];
    if (!stake) return;

    // Logic to add cash back based on current stock price
    this.cash += stake.stakeAmount;

    delete this.stakes[id];
  }

  // Calculate total assets
  calculateAssets() {
    let currentStockValue = 0;

    Object.values(this.stocks).forEach((s) => {
      currentStockValue += s.stockObject.currentPrice * s.shares;
    });

    this.assets = this.cash + currentStockValue;
  }

  calculateStakes() {
    // Loop through and check if user bet up or down
    Object.entries(this.stakes).forEach(([id, s]) => {
      let missed = false;
      // If they bet the wrong way then they missed the bet and lose the amount
      if (s.stakeType == "UP") {
        if (s.stockObject.currentPrice < s.stakePrice) {
          missed = true;
        }
      } else {
        if (s.stockObject.currentPrice > s.stakePrice) {
          missed = true;
        }
      }

      // If they didn't miss they get 3 times the percChange of the stock and their money back
      if (!missed) {
        const percChange =
          Math.abs((s.stockObject.currentPrice - s.stakePrice) / s.stakePrice) *
          3;
        const cashWon = s.stakeAmount + s.stakeAmount * percChange;
        this.cash += cashWon;
      }

      // Delete after stake was checked
      delete this.stakes[Number(id)];
    });
  }
}
