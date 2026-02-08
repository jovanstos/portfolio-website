import { Stock } from "./Stock";
import { simulateNextWeek } from './stockAlgorithm';
import { generateNewsValue } from './NewsAlgorithm';

interface StockData {
  priceChange: number;
  globalNews: number;
  companyNews: number;
  volume: number;
  volatility: number;
  pOverE: number;
  weeksSinceEarnings: number;
}

export function getTrainingData(){
    const LSTMTrainingStock = new Stock("LSTM Training Corp", 100.00, 500000000, 50, 20, 50);
    const TOTAL_WEEKS = 10000;
        
    const data: StockData[] = [];
    
    let globalNews = 0
    let weeksSinceEarnings = 0

    data.push(
        {
            "priceChange": 0,
            "globalNews": globalNews,
            "companyNews": LSTMTrainingStock.companyNews,
            "volume": LSTMTrainingStock.volume,
            "volatility": LSTMTrainingStock.volatility,
            "pOverE": LSTMTrainingStock.pOverE,
            "weeksSinceEarnings": weeksSinceEarnings,
        }
    )

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

        data.push(
            {
                "priceChange": priceChange,
                "globalNews": globalNews,
                "companyNews": LSTMTrainingStock.companyNews,
                "volume": LSTMTrainingStock.volume,
                "volatility": LSTMTrainingStock.volatility,
                "pOverE": LSTMTrainingStock.pOverE,
                "weeksSinceEarnings": weeksSinceEarnings,
            }
        )

        if(week % 6 == 0 && week !== 0){
            weeksSinceEarnings = 0
        }
    }

    return data
}
