import type { Stock } from "./Stock";

const START_DATE = new Date('2025-10-01');

function rollChances(min:number, max:number) {
  return Math.random() * (max - min) + min;
}

function getTrend(currentStock: Stock, globalNews: number) {
    let randomNumberMax = 1;

    // NEWS & VOLUME INTERACTION
    // Real World Logic: Volume amplifies News.
    // Good News + High Volume = Massive Rally.
    // Bad News + High Volume = Panic Selling.

    const volumeModifier = currentStock.volume / 100; // 0.0 to 1.0

    // Check for "Crash" conditions
    if ((globalNews == -1 || currentStock.companyNews == -1) && Math.random() < 0.99) {
        // If news is terrible, Volume accelerates the crash Panic Sell
        return "DOWN"; 
    } 
    
    // Normal News Logic
    if (globalNews != 0) {
        // If news is positive, Volume helps it go higher. If negative, Volume pulls it lower.
        const amplifiedNews = globalNews > 0 ? (globalNews + volumeModifier) : (globalNews - volumeModifier);
        randomNumberMax += amplifiedNews * 0.25;
    }

    if (currentStock.companyNews != 0) {
        const amplifiedCompanyNews = currentStock.companyNews > 0 
            ? (currentStock.companyNews + volumeModifier) 
            : (currentStock.companyNews - volumeModifier);
        randomNumberMax += amplifiedCompanyNews * 0.15;
    }

    // P/E
    // "Value" stocks (Low P/E) have a safety net.
    // "Bubble" stocks (High P/E) have gravity pulling them down.
    
    if (currentStock.pOverE < 5) {
        randomNumberMax -= 0.15; // Junk status, very risky
    } else if (currentStock.pOverE < 15) {
        randomNumberMax += 0.05; // Safe Value buy
    } else if (currentStock.pOverE < 45) {
        randomNumberMax += 0.20; // Growth Momentum
    } else if (currentStock.pOverE < 60) {
        randomNumberMax += 0.10; // Slowing down
    } else {
        randomNumberMax -= 0.20; // Overvalued/Bubble Correction
    }

    // SOCIAL BUZZ
    // High buzz can overpower bad P/E ratios
    // Low buzz means the stock is "invisible" and hard to move up.
    
    if (currentStock.socialBuzz > 80) {
        // "To The Moon" Logic: Massive hype
        randomNumberMax += 0.25; 
    } else if (currentStock.socialBuzz > 50) {
        // Healthy attention
        randomNumberMax += 0.10;
    } else if (currentStock.socialBuzz < 20) {
        // "Dead" stock. No one cares, so it drifts down.
        randomNumberMax -= 0.05;
    }

    // Ensure we don't break the math with negative maxes
    if (randomNumberMax < 0.01) randomNumberMax = 0.01;

    const stocksRoll = rollChances(0, randomNumberMax);
    
    // If the weighted roll beats a raw random chance, we go UP.
    if (stocksRoll > Math.random()) {
        return "UP";
    }

    return "DOWN";
}

export function simulateNextWeek(currentStock: Stock, globalNews: number) {
    const trend = getTrend(currentStock, globalNews);
    console.log(`COMAPNY ${currentStock.companyName} TREND: ${trend}`);
    
}