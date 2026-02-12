import { Stock } from "./Stock";

const START_DATE = new Date('2025-01-01').getTime();
const DAYS_IN_WEEK = 5
const EARNINGS_WEEK = 6

function rollChances(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function getMovingAverage(currentStock: Stock, days: number): number {
    // If not enough data, just return current price
    if (currentStock.data.length < days) return currentStock.currentPrice;

    // Slice the last 'days' entries
    const recentHistory = currentStock.data.slice(-days);

    // Sum up the prices
    const sum = recentHistory.reduce((acc, entry) => acc + entry[1], 0);

    return sum / recentHistory.length;
}

function handleEarnings(currentStock: Stock): number {
    // Get stock growth over the last weeks since last earnings, 5 is the days
    const recentHistory = currentStock.data.slice(-(EARNINGS_WEEK * DAYS_IN_WEEK));
    const startPrice = recentHistory.length > 0 ? recentHistory[0][1] : currentStock.currentPrice;
    const stockGains = (currentStock.currentPrice - startPrice) / startPrice;

    // Base chance is 60% because 60% of stocks in real life beat it
    let beatProbability = 0.60 + stockGains;

    // Can't have a perfect chance of beating and must at least have 15% chance
    beatProbability = Math.max(0.15, Math.min(0.95, beatProbability));

    // If random number is LESS than our win chance, stock wins.
    const isBeat = Math.random() < beatProbability;

    // Get the volatility of the stock, turn it into a perctange with variance of 3%
    const volatilityLowEnd = Math.max(((currentStock.volatility - 3) / 1000), 0.03)
    const volatilityHighEnd = Math.max(((currentStock.volatility + 3) / 1000), 0.05)
    const variancePercent = rollChances(volatilityLowEnd, volatilityHighEnd);

    let actualEarnings;
    if (isBeat) {
        actualEarnings = currentStock.projectedEarnings * (1 + variancePercent);
    } else {
        actualEarnings = currentStock.projectedEarnings * (1 - variancePercent);
    }

    actualEarnings = Math.floor(actualEarnings);
    currentStock.currentEarnings = actualEarnings;

    // Calculate the "Surprise" (The % difference between Actual and Projected)
    const surprise = (actualEarnings - currentStock.projectedEarnings) / currentStock.projectedEarnings;

    // Return the surprise factor to calculate price movement
    return surprise;
}

function getTrend(currentStock: Stock, globalNews: number, earningsWeek: boolean): "UP" | "DOWN" {
    let randomNumberMax = 1;

    // Check for "Crash" "or "Rally" conditions
    if (globalNews <= -0.75 && currentStock.companyNews < 0) {
        return "DOWN";
    }

    if (globalNews >= 0.75 && currentStock.companyNews > 0) {
        return "UP";
    }

    // Down comes first because horrible news is always something people listen to instead of good
    if ((globalNews == -1 || currentStock.companyNews == -1)) {
        return "DOWN";
    }

    if ((globalNews == 1 || currentStock.companyNews == 1)) {
        return "UP";
    }

    // If P/E is massive (Bubble) and Social Buzz the bubble pops.
    if (currentStock.pOverE > 60 && currentStock.socialBuzz < 20) {
        return "DOWN";
    }

    // News And Volume interaction
    // Volume amplifies News.
    // Good News + High Volume = Massive Rally.
    // Bad News + High Volume = Panic Selling.

    const volumeModifier = currentStock.volume / 100; // 0.0 to 1.0

    // Normal News Logic
    if (globalNews != 0) {
        // If news is positive, Volume helps it go higher. If negative, Volume pulls it lower.
        const amplifiedNews = globalNews > 0 ? (globalNews + volumeModifier) : (globalNews - volumeModifier);

        randomNumberMax += amplifiedNews;
    }

    if (currentStock.companyNews != 0) {
        const amplifiedCompanyNews = currentStock.companyNews > 0
            ? (currentStock.companyNews + volumeModifier)
            : (currentStock.companyNews - volumeModifier);

        randomNumberMax += amplifiedCompanyNews;
    }

    // P/E
    // "Value" stocks (Low P/E) have a safety net.
    // "Bubble" stocks (High P/E) have gravity pulling them down.

    if (currentStock.pOverE < 5) {
        randomNumberMax -= 0.15; // Junk status, very risky
    } else if (currentStock.pOverE < 15) {
        randomNumberMax += 0.05; // Safe Value buy
    } else if (currentStock.pOverE < 25) {
        randomNumberMax += 0.10; // Solid
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
    } else if (currentStock.socialBuzz < 15) {
        // "Dead" stock. No one cares, so it drifts down.
        randomNumberMax -= 0.05;
    } else {
        randomNumberMax -= 0.02;
    }

    // When there is an earnings the average doesn't matter
    if (!earningsWeek) {
        // MEAN REVERSION Lik an Elastic Band to relax volatility, 3 weeks * 5 days
        const movingAverage = getMovingAverage(currentStock, -(3 * DAYS_IN_WEEK));

        // Calculate how far we are from the average
        const deviation = currentStock.currentPrice / movingAverage;

        if (deviation > 1.15) {
            // Price is 15% above average. It's "Overbought". Pull it down.
            // We reduce the UP chance significantly.
            randomNumberMax -= 0.35;
        } else if (deviation > 1.05) {
            // Price is 5% above average. Minor resistance.
            randomNumberMax -= 0.10;
        } else if (deviation < 0.85) {
            // Price is 15% below average. It's "Oversold". Bargain hunters step in.
            randomNumberMax += 0.35;
        } else if (deviation < 0.95) {
            // Price is 5% below average. slight support.
            randomNumberMax += 0.10;
        }
    }

    // If max is under 0.01 then it's trending down
    if (randomNumberMax < 0.01) {
        return "DOWN";
    }

    let freshTrendScore = randomNumberMax;

    // Mix with previous momentum to create smooth trends
    const effectiveScore = (freshTrendScore * 0.7) + (currentStock.momentum * 0.3);

    // Update Momentum for next week decay it slightly towards neutral
    if (effectiveScore > 0.5) {
        currentStock.momentum = Math.min(currentStock.momentum + 0.1, 1.0);
    } else {
        currentStock.momentum = Math.max(currentStock.momentum - 0.1, -1.0);
    }

    const stocksRoll = rollChances(0, effectiveScore);

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
    const volumeModifier = currentStock.volume / 100;

    let percentChange = 0;

    // Earnings day 
    if (earningsSurprise !== null) {
        // We amplify the surprise based on Volume (High volume = bigger reaction).
        const volumeAmplifier = 1 + volumeModifier;

        percentChange = Math.abs(earningsSurprise) * volumeAmplifier;

        // Minimum drama: Earnings always cause at least a 2% move if volatility is non-zero
        if (percentChange < 0.02 && currentStock.volatility > 0) percentChange = 0.02;

    }
    // Normal trading DAY
    else {
        // Use a "cubic" random to bias towards smaller numbers
        // Math.random() is linear. Math.pow(Math.random(), 3) biases heavily towards 0.
        // This means most days are quiet, but rare days are big.
        const biasedRandom = Math.pow(Math.random(), 1.5);

        percentChange = biasedRandom * volatilityPercent

        if (trend == "UP") {
            if (globalNews > 0) {
                let newsValue = globalNews + volumeModifier;

                newsValue = newsValue * 0.5 / 100

                percentChange += newsValue
            }

            if (currentStock.companyNews > 0) {
                let newsValue = (currentStock.companyNews + volumeModifier);

                newsValue = newsValue * 0.5 / 100

                percentChange += newsValue
            }

        } else {
            if (globalNews < 0) {
                let newsValue = globalNews - volumeModifier;

                newsValue = newsValue * 0.5 / 100

                percentChange += newsValue
            }

            if (currentStock.companyNews < 0) {
                let newsValue = (currentStock.companyNews - volumeModifier);

                newsValue = newsValue * 0.5 / 100

                percentChange += newsValue
            }
        }
    }

    // FORCE MOVEMENT
    // If the stock is moving, make it move at least 0.5%. 
    // Small movments make the AI/ML model stuck at predicting
    if (percentChange < 0.005 && currentStock.volatility > 20) {
        percentChange = rollChances(0.005, 0.015);
    }

    // Sometimes percentage can be negative
    return Math.abs(percentChange);
}

function updateMarketPsychology(currentStock: Stock, percentChange: number, isEarnings: boolean): void {
    // Convert decimal percentage to a readable number (e.g., 0.05 -> 5)
    const moveMagnitude = Math.abs(percentChange * 100);
    const isCrash = percentChange < -0.05; // Dropped more than 5%
    const isRally = percentChange > 0.05;  // Gained more than 5%

    // SOCIAL BUZZ
    if (isCrash) {
        // Panic!
        // Drops 5 - 10 points depending on severity
        currentStock.socialBuzz -= Math.floor(moveMagnitude * 1.5);
    } else if (isRally) {
        // FOMO! Everyone starts tweeting about it.
        currentStock.socialBuzz += Math.floor(moveMagnitude * 1.2);
    } else if (moveMagnitude < 1) {
        // Boredom. If stock moves less than 1%, buzz decays slowly.
        currentStock.socialBuzz -= 2;
    }

    // Earnings always generates chatter, regardless of outcome
    if (isEarnings) {
        currentStock.socialBuzz += 10;
    }

    // Clamp Buzz 0-100
    currentStock.socialBuzz = Math.max(0, Math.min(100, currentStock.socialBuzz));

    // Volume follows action. 
    // If the move is big, volume spikes. If flat, volume fades.
    if (moveMagnitude > 2) {
        currentStock.volume += Math.floor(moveMagnitude * 2);
    } else {
        currentStock.volume -= 3; // Day traders leave boring stocks
    }

    // Clamp Volume 0-100
    currentStock.volume = Math.max(0, Math.min(100, currentStock.volume));


    // Volatility is "sticky". It rises fast on shock, drops slow on calm.
    if (moveMagnitude > 4) {
        // Shock event increases future risk
        currentStock.volatility += 5;
    } else if (moveMagnitude < 1) {
        // Stability cools things down
        currentStock.volatility -= 2;
    }

    // Clamp Volatility 0-100
    currentStock.volatility = Math.max(0, Math.min(100, currentStock.volatility));
}

export function simulateNextWeek(week: number, currentStock: Stock, globalNews: number): number {
    const startingPrice = currentStock.currentPrice;

    let weeklyEarningsSurprise: number | null = null;

    // If data exists, start 1 day after the last entry. If not, use START_DATE
    let nextDateCount: number;

    if (currentStock.data.length === 0) {
        nextDateCount = START_DATE;
    } else {
        // Safe access to the last element's date
        const lastEntry = currentStock.data[currentStock.data.length - 1][0];

        // Added this so typescript stops yelling at me
        if (!lastEntry) return 0

        const lastDate = new Date(lastEntry);

        // Add 1 day to the last known date
        lastDate.setDate(lastDate.getDate() + 1);
        nextDateCount = lastDate.getTime();
    }


    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        let isEarningsDay = false;
        let trend = "";

        let todaySurprise: number | null = null;

        if ((week % EARNINGS_WEEK == 0) && week > 0 && !weeklyEarningsSurprise) {
            weeklyEarningsSurprise = handleEarnings(currentStock);

            todaySurprise = weeklyEarningsSurprise;

            isEarningsDay = true;
            trend = weeklyEarningsSurprise >= 0 ? "UP" : "DOWN";
        } else {
            if (week % EARNINGS_WEEK == 0 && week > 0) {
                trend = getTrend(currentStock, globalNews, true);
            } else {
                trend = getTrend(currentStock, globalNews, false);
            }
        }

        const percentChange = getChange(currentStock, trend, globalNews, todaySurprise);

        const oldPrice = currentStock.currentPrice;
        if (trend == "DOWN") {
            currentStock.currentPrice = oldPrice - (oldPrice * percentChange);
        } else {
            currentStock.currentPrice = oldPrice + (oldPrice * percentChange);
        }

        currentStock.updateProjectedEarnings(globalNews);
        currentStock.addData([nextDateCount, currentStock.currentPrice]);

        const dateObj = new Date(nextDateCount);
        dateObj.setDate(dateObj.getDate() + 1);
        nextDateCount = dateObj.getTime();

        // If there's an earnings the changes are radical so market must adjust
        if (isEarningsDay) updateMarketPsychology(currentStock, percentChange, isEarningsDay);

        // console.log(`--------------------------------`);
        // console.log(`DATE: ${new Date(nextDateCount).toISOString().split('T')[0]}`);
        // console.log(`PRICE: $${oldPrice.toFixed(2)} -> $${currentStock.currentPrice.toFixed(2)}`);
        // console.log(`STATS: Vol: ${currentStock.volume} | Buzz: ${currentStock.socialBuzz} | Risk: ${currentStock.volatility}`);
    }

    let wasEarningsWeek = false;
    if ((week % EARNINGS_WEEK == 0) && week > 0) wasEarningsWeek = true;

    const totalWeeklyChange = (currentStock.currentPrice - startingPrice) / startingPrice;
    updateMarketPsychology(currentStock, totalWeeklyChange, wasEarningsWeek);

    return totalWeeklyChange
}