import type { Stock } from "./Stock";

const START_DATE = new Date('2025-10-01').getTime();

function rollChances(min:number, max:number) {
  return Math.random() * (max - min) + min;
}

function handleEarnings(currentStock: Stock): number {
    // Calculate variance based on Volatility
    // Higher volatility = higher chance of a massive miss or massive beat
    // Volatility 10 = +/- 2% swing. Volatility 90 = +/- 18% swing
    const volatilityFactor = (currentStock.volatility / 100) * 0.20; 
    
    // Randomize the actual earnings outcome
    // Sstick closely to projected, but apply volatility
    const variance = (Math.random() * (volatilityFactor * 2)) - volatilityFactor;
    
    // Calculate Actual Earnings
    const actualEarnings = Math.floor(currentStock.projectedEarnings * (1 + variance));

    // Calculate the "Surprise" (The % difference between Actual and Projected)
    const surprise = (actualEarnings - currentStock.projectedEarnings) / currentStock.projectedEarnings;

    // UPDATE THE STOCK OBJECT
    currentStock.currentEarnings = actualEarnings;

    // Return the surprise factor to calculate price movement
    return surprise;
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

function getChange(currentStock: Stock, trend: string, globalNews: number, earningsSurprise: number | null): number {
    // BASE MOVEMENT: Determined by Volatility
    // A stable stock (vol: 10) moves ~0.5% a day. A risky stock (vol: 90) moves ~4.5% a day.
    let volatilityPercent = (currentStock.volatility / 100) * 0.05; 

    let percentChange = 0;

    // Earnings day 
    if (earningsSurprise !== null) {
        // We amplify the surprise based on Volume (High volume = bigger reaction).
        const volumeAmplifier = 1 + (currentStock.volume / 100); 
        
        percentChange = Math.abs(earningsSurprise) * volumeAmplifier;

        // Minimum drama: Earnings always cause at least a 2% move if volatility is non-zero
        if (percentChange < 0.02 && currentStock.volatility > 0) percentChange = 0.02;

    }
    // Normal trading DAY
    else {
        
        // Random daily fluctuation (0 to Max Volatility)
        percentChange = Math.random() * volatilityPercent;

        // News Impact: Adds extra weight if news is significant
        if (Math.abs(globalNews) > 0 || Math.abs(currentStock.companyNews) > 0) {
             percentChange += 0.02; // Add 2% movement potential for news
        }
    }
    
    if (trend === "DOWN") {
        return -percentChange;
    }
    return percentChange;
}

export function simulateNextWeek(week: number, currentStock: Stock, globalNews: number) {
    let earningsSurprise: number | null = null;

    // If data exists, start 1 day after the last entry. If not, use START_DATE
    let nextDateCount: number;
    
    if (currentStock.data.length === 0) {
        nextDateCount = START_DATE;
    } else {
        // Safe access to the last element's date
        const lastEntry = currentStock.data[currentStock.data.length - 1][0];

        // Added this so typescript stops yelling at me
        if(!lastEntry){
            return
        }

        const lastDate = new Date(lastEntry);
        
        // Add 1 day to the last known date
        lastDate.setDate(lastDate.getDate() + 1);
        nextDateCount = lastDate.getTime();
    }

    for (let i = 0; i < 130; i++) {
        let trend = "";
        
        if ((week % 3 == 0) && week > 0 && !earningsSurprise) {
            earningsSurprise = handleEarnings(currentStock);
            trend = earningsSurprise >= 0 ? "UP" : "DOWN";
        } else {
            trend = getTrend(currentStock, globalNews);
        }

        const percentChange = getChange(currentStock, trend, globalNews, earningsSurprise);
        const oldPrice = currentStock.currentPrice;
        currentStock.currentPrice = oldPrice * (1 + percentChange);
        currentStock.updateProjectedEarnings(globalNews);

        currentStock.addData([nextDateCount, currentStock.currentPrice]);

        const dateObj = new Date(nextDateCount);
        
        dateObj.setDate(dateObj.getDate() + 1);
        nextDateCount = dateObj.getTime();

        console.log(`--------------------------------`);
        console.log(`DATE: ${new Date(nextDateCount).toISOString().split('T')[0]}`);
        console.log(`PRICE: $${oldPrice.toFixed(2)} -> $${currentStock.currentPrice.toFixed(2)}`);
    }
}