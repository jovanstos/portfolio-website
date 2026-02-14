export class Stock {
  // Name of the company
  companyName: string;
  // Price of Stock
  currentPrice: number;
  // Money Made
  currentEarnings: number;
  // Total shares, all stocks are 100 million shares
  totalShares: number;
  // Projected future earnings
  projectedEarnings: number;
  // Total volume being brought 0-100
  volume: number;
  // Volatility risk of the stock 0-100, higher means higher risk
  volatility: number;
  // P/E (Price-to-Earings) Ratio usually 0-40
  pOverE: number;
  // Socail buzz from people 0 - 100, higher means more people care
  socialBuzz: number;
  // The stocks price momentum
  momentum: number;
  // Company news cycle -1 - 1, -1 means terrible news, 1 means great, 0 means no news this week
  companyNews: number;
  // Stock data
  data: [number | undefined, number][];

  constructor(
    companyName: string,
    currentPrice: number,
    currentEarnings: number,
    volume: number,
    volatility: number,
    socialBuzz: number,
  ) {
    this.companyName = companyName;
    this.currentPrice = currentPrice;
    this.currentEarnings = currentEarnings;
    this.volume = volume;
    this.volatility = volatility;
    this.socialBuzz = socialBuzz;

    this.totalShares = 100000000;

    // Calculate Earnings Per Share
    const eps = this.currentEarnings / this.totalShares;

    // P/E calculation
    this.pOverE = eps !== 0 ? this.currentPrice / eps : 0;

    this.momentum = 0;
    this.companyNews = 0;
    this.projectedEarnings = 0;
    this.data = [];
  }

  updatePE() {
    const eps = this.currentEarnings / this.totalShares;
    this.pOverE = eps !== 0 ? this.currentPrice / eps : 0;
  }

  updateProjectedEarnings(globalNews: number) {
    // Global News impact, economy is good/bad
    // Global news (-1 to 1) affects projection by up to +/- 5%
    let growthFactor = globalNews * 0.05;

    // Company News: Stronger impact
    // Company news (-1 to 1) affects projection by up to +/- 10%
    if (this.companyNews !== 0) {
      growthFactor += this.companyNews * 0.1;
    }

    // Social Buzz: The "Hype"
    // Normalize buzz (0-100) to a range of -5% to +5%
    // If buzz is 50 (neutral), impact is 0. If 100, impact is +5%.
    const buzzImpact = ((this.socialBuzz - 50) / 100) * 0.1;
    growthFactor += buzzImpact;

    // Volatility: Random "Analyst Uncertainty"
    // Higher volatility = wider random swings in projection
    // A volatility of 80 adds a random +/- 4% variance
    const uncertainty = (Math.random() - 0.5) * (this.volatility / 1000);
    growthFactor += uncertainty;

    // Apply to Current Earnings
    // It is floored at 0 because projected earnings shouldn't be negative revenue
    this.projectedEarnings = Math.max(
      0,
      this.currentEarnings * (1 + growthFactor),
    );

    // Round for cleaner UI
    this.projectedEarnings = Math.round(this.projectedEarnings);
  }

  addData(newEntry: [number | undefined, number]) {
    this.currentPrice = newEntry[1];
    this.updatePE(); // Update P/E when price changes
    this.data.push(newEntry);
  }
}
