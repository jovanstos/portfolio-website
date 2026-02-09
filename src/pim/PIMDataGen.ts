import { Stock } from "./Stock";
import { simulateNextWeek } from './stockAlgorithm';
import { generateNewsValue } from './NewsAlgorithm';
import type { StockData } from "../types/pimTypes";

const BOUNDS = {
    priceChange: { min: -0.3, max: 0.3 },
    news: { min: -1, max: 1 },
    momentum: { min: -1, max: 1 },
    volume: { min: 0, max: 100 },
    volatility: { min: 0, max: 100 },
    pOverE: { min: 5, max: 50 },
    socialBuzz: { min: 0, max: 100 },
    weeks: { min: 0, max: 6 }
};

function logNormalize(val: number, min: number, max: number): number {
    const logVal = Math.log1p(val);
    const logMin = Math.log1p(min);
    const logMax = Math.log1p(max);

    return ((logVal - logMin) / (logMax - logMin)) * 2 - 1;
}

function linearNormalize(val: number, min: number, max: number): number {
    return ((val - min) / (max - min)) * 2 - 1;
}

function createRandomStock(id: number): Stock {
    const price = Math.random() * 190 + 10;

    const targetPE = Math.random() * 50 + 10;

    const totalShares = 100000000;
    const eps = price / targetPE;
    const earnings = Math.floor(eps * totalShares);

    const isVolatile = Math.random() > 0.5;
    const volatility = isVolatile ?
        Math.random() * 50 + 50 :
        Math.random() * 40 + 10;

    const volume = Math.floor(Math.random() * 100);
    const socialBuzz = Math.floor(Math.random() * 100);

    return new Stock(
        `Sim Stock ${id}`,
        price,
        earnings,
        volume,
        volatility,
        socialBuzz
    );
}

export function getTrainingData() {
    const TOTAL_EPISODES = 400; // 400 games * 26 weeks = 10,400 data points
    const WEEKS_PER_GAME = 26;
    const data: StockData[] = [];

    for (let episode = 0; episode < TOTAL_EPISODES; episode++) {
        // Create a new stock per each episode to keep data fresh
        const currentStock = createRandomStock(episode);

        let globalNews = 0;

        // Simulate a full 26 week game
        for (let week = 0; week < WEEKS_PER_GAME; week++) {

            let isEarningsWeek = 0
            // Logic for earnings reset
            if (week % 6 === 0 && week !== 0) {
                isEarningsWeek = 1;
            }

            // Generate News
            currentStock.companyNews = generateNewsValue();
            const globalNewsChance = Math.random();

            if (globalNews !== 0 && globalNewsChance > 0.4) {
                globalNews = generateNewsValue();
            } else if (globalNewsChance > 0.75) {
                globalNews = generateNewsValue();
            }

            // Simulate Price Movement
            const priceChange = simulateNextWeek(week, currentStock, globalNews);

            data.push({
                // Use linearNormalize for centered data (-1 to 1)
                "priceChange": linearNormalize(priceChange, BOUNDS.priceChange.min, BOUNDS.priceChange.max),
                "globalNews": linearNormalize(globalNews, BOUNDS.news.min, BOUNDS.news.max),
                "companyNews": linearNormalize(currentStock.companyNews, BOUNDS.news.min, BOUNDS.news.max),
                "momentum": linearNormalize(currentStock.momentum, BOUNDS.news.min, BOUNDS.news.max),

                // Use logNormalize for magnitude data (0 to 100)
                "volume": logNormalize(currentStock.volume, BOUNDS.volume.min, BOUNDS.volume.max),
                "volatility": logNormalize(currentStock.volatility, BOUNDS.volatility.min, BOUNDS.volatility.max),
                "pOverE": logNormalize(currentStock.pOverE, BOUNDS.pOverE.min, BOUNDS.pOverE.max),
                "socialBuzz": logNormalize(currentStock.socialBuzz, BOUNDS.socialBuzz.min, BOUNDS.socialBuzz.max),

                "isEarningsWeek": isEarningsWeek,
            });
        }
    }

    return data;
}