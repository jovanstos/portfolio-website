import { Stock } from "./Stock";
import { simulateNextWeek } from './stockAlgorithm';
import { generateNewsValue } from './NewsAlgorithm';
import type { StockData } from "../types/pimTypes";

const BOUNDS = {
    priceChange: { min: -0.3, max: 0.3 },
    news: { min: -1, max: 1 },
    volume: { min: 0, max: 100 },
    volatility: { min: 0, max: 100 },
    pOverE: { min: 5, max: 50 },
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

export function getTrainingData(){
    const LSTMTrainingStock = new Stock("LSTM Training Corp", 100.00, 500000000, 50, 20, 50);
    const TOTAL_WEEKS = 10000;
        
    const data: StockData[] = [];
    
    let globalNews = 0
    let weeksSinceEarnings = 0

    for (let week = 1; week <= TOTAL_WEEKS; week++) {
        weeksSinceEarnings += 1

        LSTMTrainingStock.companyNews = generateNewsValue()
    
        const globalNewsChance = Math.random()
    
        if(globalNews !== 0 && globalNewsChance > 0.4){
            globalNews = generateNewsValue();
        }else if(globalNewsChance > 0.75){
            globalNews = generateNewsValue();
        }

        const priceChange = simulateNextWeek(week, LSTMTrainingStock, globalNews)

        data.push({
            "priceChange": linearNormalize(priceChange, BOUNDS.priceChange.min, BOUNDS.priceChange.max),
            "globalNews": linearNormalize(globalNews, BOUNDS.news.min, BOUNDS.news.max),
            "companyNews": linearNormalize(LSTMTrainingStock.companyNews, BOUNDS.news.min, BOUNDS.news.max),
            "volume": logNormalize(LSTMTrainingStock.volume, BOUNDS.volume.min, BOUNDS.volume.max),
            "volatility": logNormalize(LSTMTrainingStock.volatility, BOUNDS.volatility.min, BOUNDS.volatility.max),
            "pOverE": logNormalize(LSTMTrainingStock.pOverE, BOUNDS.pOverE.min, BOUNDS.pOverE.max),
            "weeksSinceEarnings": linearNormalize(weeksSinceEarnings, BOUNDS.weeks.min, BOUNDS.weeks.max),
        });

        if(week % 6 == 0 && week !== 0){
            weeksSinceEarnings = 0
        }
    }

    return data
}
