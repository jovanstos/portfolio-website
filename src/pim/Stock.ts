export class Stock {
    price: number;
    volume: number;
    volatility: number;
    pOverE: number;
    movingAverage: number;
    socailBuzz: number;
    companyNews: number;
    data: [number, number][];

    constructor(price: number, volume: number, volatility: number, pOverE: number, socailBuzz: number) {
        this.price = price;
        this.volume = volume;
        this.volatility = volatility;
        this.pOverE = pOverE;
        this.socailBuzz = socailBuzz;

        this.movingAverage = 0;
        this.companyNews = 0;
        this.data = []
    }
}