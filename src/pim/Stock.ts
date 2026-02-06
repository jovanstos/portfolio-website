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
    // Moving Average, the distance betwene the current price and the average price
    movingAverage: number;
    // Socail buzz from people 0 - 100, higher means more people care
    socialBuzz: number;
    // Company news cycle -1 - 1, -1 means terrible news, 1 means great, 0 means no news this week
    companyNews: number;
    // Stock data
    data: [number, number][];

    constructor(
        companyName: string,
        currentPrice: number,
        currentEarnings: number,
        volume: number,
        volatility: number,
        socialBuzz: number) {
        
        this.companyName = companyName;
        this.currentPrice = currentPrice;
        this.currentEarnings = currentEarnings;
        this.volume = volume;
        this.volatility = volatility;
        this.socialBuzz = socialBuzz;

        this.totalShares = 100000000

        // Calculate Earnings Per Share
        const eps = this.currentEarnings / this.totalShares;
        
        // P/E calculation
        this.pOverE = eps !== 0 ? this.currentPrice / eps : 0;

        this.movingAverage = 0;
        this.companyNews = 0;
        this.projectedEarnings = 0;
        this.data = [];
    };

    updatePE() {
        const eps = this.currentEarnings / this.totalShares;
        this.pOverE = eps !== 0 ? this.currentPrice / eps : 0;
    }

    updateMovingAverage(newPrice: number) {
        let total = 0;
        for (let i = 0; i < this.data.length; i++) {
            total += this.data[i][0];
        };
        const average = this.data.length > 0 ? total / this.data.length : 0;
        this.movingAverage = newPrice - average;
    }

    addData(newEntry: [number, number]) {
        this.currentPrice = newEntry[1];
        this.updatePE(); // Update P/E when price changes
        this.updateMovingAverage(this.currentPrice);
        this.data.push(newEntry);
    }
}