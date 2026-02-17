import type { NewsType, NewsDatabase } from "../types/pimTypes";

export function generateNewsValue(): number {
  // Define the possible outcomes
  const values = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

  // Define weights
  const weights = [1, 2, 4, 6, 14, 6, 4, 2, 1];

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < values.length; i++) {
    if (random < weights[i]) {
      return values[i];
    }
    random -= weights[i];
  }

  // Fallback
  return 0;
}

const newsData: NewsDatabase = {
  [-1]: {
    Company: [
      "CEO arrested for massive fraud scheme",
      "Company files for Chapter 11 bankruptcy",
      "Main factory destroyed in catastrophic fire",
      "Department of Justice launches antitrust investigation",
    ],
    Global: [
      "Global Market Crash: Indices down 20% in a single day",
      "Major war breaks out in oil-rich region",
      "Global pandemic declared; trade halts completely",
      "Banking system collapse imminent",
    ],
  },

  [-0.75]: {
    Company: [
      "Major product recall affecting millions of units",
      "CFO resigns amid accounting irregularities",
      "Quarterly earnings missed by 50%",
      "Class action lawsuit filed by investors",
    ],
    Global: [
      "Trade talks collapse between superpowers",
      "Recession confirmed by latest GDP numbers",
      "Supply chain crisis halts global shipping",
      "Major currency devaluation sparks panic",
    ],
  },

  [-0.5]: {
    Company: [
      "Company announces layoffs of 15% of workforce",
      "New product launch delayed indefinitely",
      "Analyst downgrades stock to 'Sell'",
      "Key partnership dissolved unexpectedly",
    ],
    Global: [
      "Inflation hits a 10-year high",
      "Oil prices spike, increasing transport costs",
      "Consumer confidence drops significantly",
      "Tech sector enters correction territory",
    ],
  },

  [-0.25]: {
    Company: [
      "Minor supply chain hiccup causes delays",
      "CEO tweets something controversial",
      "Slight miss on revenue projections",
      "Employee strike threatens production",
    ],
    Global: [
      "Markets open slightly lower today",
      "Minor regulatory changes worry investors",
      "Unemployment ticks up by 0.1%",
      "Housing market shows signs of cooling",
    ],
  },

  [0]: {
    Company: [
      "Company announces rebranding effort",
      "Shareholder meeting proceeds without incident",
      "Quarterly earnings meet expectations exactly",
      "New wellness program introduced for employees",
    ],
    Global: [
      "Slow news day; markets trade sideways",
      "Federal Reserve keeps interest rates unchanged",
      "Global trade remains steady",
      "No major economic events scheduled today",
    ],
  },

  [0.25]: {
    Company: [
      "New marketing campaign goes viral",
      "Analyst upgrades stock to 'Hold'",
      "Company expands into a new regional market",
      "Efficiency experts cut operating costs by 5%",
    ],
    Global: [
      "Markets rally slightly on jobs report",
      "Consumer spending shows modest growth",
      "Tech sector shows signs of recovery",
      "Small dip in fuel prices boosts logistics",
    ],
  },

  [0.5]: {
    Company: [
      "Earnings beat expectations by significant margin",
      "New flagship product receives rave reviews",
      "Competitor exits the market, leaving open share",
      "Stock buyback program announced",
    ],
    Global: [
      "Interest rates cut, stimulating borrowing",
      "International trade deal signed",
      "Unemployment drops to record lows",
      "Bull market officially confirmed",
    ],
  },

  [0.75]: {
    Company: [
      "Record-breaking quarterly profits announced",
      "Breakthrough patent approved by regulators",
      "Rumors of acquisition by tech giant drive price up",
      "Company secures massive government contract",
    ],
    Global: [
      "Economic boom: GDP grows at fastest rate in decades",
      "Major energy breakthrough reduces global costs",
      "Peace treaty signed, stabilizing global markets",
      "Corporate tax cuts enacted worldwide",
    ],
  },

  [1]: {
    Company: [
      "Revolutionary invention changes the industry forever",
      "Company achieves total monopoly in its sector",
      "Stock price doubles overnight on miracle news",
      "Unprecedented demand crashes company website",
    ],
    Global: [
      "Golden Age of Economics: Prosperity across all sectors",
      "Discovery of infinite clean energy source",
      "Space mining yields trillions in resources",
      "Global poverty rates hit historic lows",
    ],
  },
};

export function getNewsStory(value: number, type: NewsType): string {
  const stories = newsData[value];

  // Select the specific array based on type
  const headlineList = stories[type];

  // Pick a random headline from the list to keep the game fresh
  const randomIndex = Math.floor(Math.random() * headlineList.length);

  return headlineList[randomIndex];
}
