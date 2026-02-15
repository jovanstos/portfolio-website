import type { playerStock } from "../../types/pimTypes";

const START_DATE = new Date("2025-01-01").getTime();

export class PlayerPortfolio {
  // How much money
  cash: number;
  // How much total assets + cash
  assets: number;
  data: [number | undefined, number][];
  // {
  //   stockName: "";
  //   buyPrice: 100;
  //   shares: 100;
  // }
  stocks: playerStock[];
  // {
  //   stockName: "";
  //   stockPrice: 100;
  //   stakeAmount: 100;
  // }
  stakes: object[];

  constructor() {
    this.cash = 100000;
    this.assets = this.cash;

    this.data = [[START_DATE, this.assets]];

    this.stocks = [];
    this.stakes = [];
  }

  addData() {
    // Safe access to the last element's date
    const lastEntry = this.data[this.data.length - 1][0];

    // Added this so typescript stops yelling at me
    if (!lastEntry) return 0;

    const lastDate = new Date(lastEntry);

    // Add 1 day to the last known date
    lastDate.setDate(lastDate.getDate() + 1);

    this.calculateAssets();
    this.calculateStake();

    this.data.push([lastDate.getTime(), this.assets]);
  }

  addAsset() {}

  addStake() {}

  calculateAssets() {}

  calculateStake() {}
}
