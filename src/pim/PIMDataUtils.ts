import { Stock } from "./classes/Stock";
import { simulateNextWeek } from "./stockAlgorithm";
import { generateNewsValue } from "./newsAlgorithm";
import type { StockData } from "../types/pimTypes";

const BOUNDS = {
  priceChange: { min: -0.4, max: 0.7 },
  news: { min: -1, max: 1 },
  momentum: { min: -1, max: 1 },
  volume: { min: 0, max: 100 },
  volatility: { min: 0, max: 100 },
  pOverE: { min: 5, max: 50 },
  socialBuzz: { min: 0, max: 100 },
  weeks: { min: 0, max: 6 },
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
  const volatility = isVolatile
    ? Math.random() * 50 + 50
    : Math.random() * 40 + 10;

  const volume = Math.floor(Math.random() * 100);
  const socialBuzz = Math.floor(Math.random() * 100);

  return new Stock(
    `Sim Stock ${id}`,
    price,
    earnings,
    volume,
    volatility,
    socialBuzz,
  );
}

export function formatStockData(
  currentStock: Stock,
  globalNews: number,
  week: number,
): number[] {
  let isEarningsWeek = 0;

  if (week % 6 === 0 && week !== 0) {
    isEarningsWeek = 1;
  }

  const data = [
    // Use linearNormalize for centered data (-1 to 1)
    // globalNews
    linearNormalize(globalNews, BOUNDS.news.min, BOUNDS.news.max),
    // companyNews
    linearNormalize(currentStock.companyNews, BOUNDS.news.min, BOUNDS.news.max),
    // momentum
    linearNormalize(currentStock.momentum, BOUNDS.news.min, BOUNDS.news.max),

    // Use logNormalize for magnitude data (0 to 100)
    // volume
    logNormalize(currentStock.volume, BOUNDS.volume.min, BOUNDS.volume.max),
    // volatility
    logNormalize(
      currentStock.volatility,
      BOUNDS.volatility.min,
      BOUNDS.volatility.max,
    ),
    // pOverE
    logNormalize(currentStock.pOverE, BOUNDS.pOverE.min, BOUNDS.pOverE.max),
    // socialBuzz
    logNormalize(
      currentStock.socialBuzz,
      BOUNDS.socialBuzz.min,
      BOUNDS.socialBuzz.max,
    ),

    // isEarningsWeek
    isEarningsWeek,
  ];

  return data;
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
      let isEarningsWeek = 0;
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
        priceChange: linearNormalize(
          priceChange,
          BOUNDS.priceChange.min,
          BOUNDS.priceChange.max,
        ),
        globalNews: linearNormalize(
          globalNews,
          BOUNDS.news.min,
          BOUNDS.news.max,
        ),
        companyNews: linearNormalize(
          currentStock.companyNews,
          BOUNDS.news.min,
          BOUNDS.news.max,
        ),
        momentum: linearNormalize(
          currentStock.momentum,
          BOUNDS.news.min,
          BOUNDS.news.max,
        ),

        // Use logNormalize for magnitude data (0 to 100)
        volume: logNormalize(
          currentStock.volume,
          BOUNDS.volume.min,
          BOUNDS.volume.max,
        ),
        volatility: logNormalize(
          currentStock.volatility,
          BOUNDS.volatility.min,
          BOUNDS.volatility.max,
        ),
        pOverE: logNormalize(
          currentStock.pOverE,
          BOUNDS.pOverE.min,
          BOUNDS.pOverE.max,
        ),
        socialBuzz: logNormalize(
          currentStock.socialBuzz,
          BOUNDS.socialBuzz.min,
          BOUNDS.socialBuzz.max,
        ),

        isEarningsWeek: isEarningsWeek,
      });
    }
  }

  return data;
}

export function handlePIMPrediction(prediction: number): string {
  const formatedPrediction = prediction.toFixed(2);
  // Up
  if (prediction >= 0.6)
    return `Strong Bullish Signal: High upward momentum expected. ${formatedPrediction}`;
  if (prediction > 0.55)
    return `Bullish Outlook: Favorable conditions. ${formatedPrediction}`;
  if (prediction > 0.52)
    return `Mildly Bullish: Slight upward bias detected. ${formatedPrediction}`;

  // Neutral
  if (prediction >= 0.48 && prediction <= 0.52) {
    return `Neutral: Market consolidation; no clear directional trend. ${formatedPrediction}`;
  }

  // Down
  if (prediction >= 0.45)
    return `Mildly Bearish: Slight downward bias detected. ${formatedPrediction}`;
  if (prediction >= 0.4)
    return `Bearish Outlook: Negative pressure likely. ${formatedPrediction}`;

  return `Strong Bearish Signal: High probability of drop. ${formatedPrediction}`;
}

export function formatNumber(num: number): string {
  if (num === 0) return "0";

  const lookups = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "k" },
  ];

  const item = lookups.find((item) => Math.abs(num) >= item.value);

  if (item) {
    const formatted = (num / item.value).toFixed(2).replace(/\.0$/, "");
    return formatted + item.symbol;
  }

  return num.toString();
}
