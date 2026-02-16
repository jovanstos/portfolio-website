import { useState } from "react";
import { Stock } from "./classes/Stock";
import { simulateNextWeek } from "./stockAlgorithm";
import { generateNewsValue } from "./newsAlgorithm";
import StockComponent from "./utils/StockComponent";
import PlayerCard from "./utils/PlayerCard";
import { FaChartLine, FaNewspaper, FaMoneyBill } from "react-icons/fa";
import type { NewsObject } from "../types/pimTypes";
import FadeInSection from "../components/FadeInSection";
import "../styles/PIM.css";
import { PlayerPortfolio } from "./classes/PlayerPortfolio";
import StockChart from "./utils/StockChart";
// Only used when deving
// import { Parser } from '@json2csv/plainjs';
// import { getTrainingData } from './PIMDataUtils';

// Create the player and AI
const player = new PlayerPortfolio("Player 1");
const preston = new PlayerPortfolio("Preston");
const randy = new PlayerPortfolio("Randy");
const granny = new PlayerPortfolio("Granny");

// High-growth tech: High price, moderate earnings = High P/E
const stock1 = new Stock("NovaTech Robotics", 210.5, 450000000, 85, 75, 92);

// Stable Utility: Lower price, consistent earnings = Low P/E
const stock2 = new Stock("GreenGrid Energy", 45.2, 380000000, 30, 15, 20);

// Volatile Biotech: High risk/volatility based on research news
const stock3 = new Stock("BioPulse Pharma", 88.0, 120000000, 60, 90, 55);

// Blue Chip Retail: Large earnings, very low volatility
const stock4 = new Stock("TerraMart Global", 155.1, 1200000000, 45, 10, 12);

// Penny Tech Startup: Low price and very low earnings, high buzz
const stock5 = new Stock("CloudStream Inc.", 12.75, 250000000, 95, 80, 88);

// Granny will buy and hold one stock the whole game, she's a base line
granny.addAsset(stock4, 644);

// P.I.M. stands for predictive investment model
function PIM() {
  const [activeView, setActiveView] = useState<"stock" | "news" | "assets">(
    "stock",
  );
  const [newsFeed, setNewsFeed] = useState<NewsObject[]>([
    {
      text: "This is the news feed, here you will see any news stories!",
      type: "Global",
      company: "N/A",
      severity: "netural",
      week: 0,
    },
  ]);
  const [globalNews, setGlobalNews] = useState<number>(0);
  const [week, setWeek] = useState<number>(0);

  function handleNewsCycle() {
    const stocks = [stock1, stock2, stock3, stock4, stock5];
    const newEntries: NewsObject[] = [];

    stocks.forEach((s) => {
      s.companyNews = generateNewsValue();
      if (s.companyNews !== 0) {
        newEntries.push({
          text: `${s.name} announces record profits!`,
          type: "Company",
          company: s.name,
          severity: s.companyNews > 0 ? "positive" : "negative",
          week: week,
        });
      }
    });

    const globalNewsChance = Math.random();
    if (
      (globalNews !== 0 && globalNewsChance > 0.4) ||
      globalNewsChance > 0.75
    ) {
      const newVal = generateNewsValue();
      setGlobalNews(newVal);

      if (newVal !== 0) {
        newEntries.push({
          text: "Global News",
          type: "Global",
          company: "N/A",
          severity: newVal > 0 ? "positive" : "negative",
          week: week,
        });
      }
    }

    if (newEntries.length > 0) {
      setNewsFeed((prev) => [...newEntries, ...prev]);
    }
  }

  function handlePlayerAI(stockChanges: number[]): void {
    player.updateData(week);
    granny.updateData(week);

    // Randy random like his name selects a random stock each week to go all in on
    const randysPick = Math.floor(Math.random() * stockChanges.length);
    // Apply the change directly to cash to save on resources
    randy.cash += randy.cash * stockChanges[randysPick];
    randy.updateData(week);

    // Preston makes the best trade 85% of the time else it's random
    let prestonsPickIndex: number;
    const isSmartMove = Math.random() < 0.85;

    if (isSmartMove) {
      // Find the index of the highest positive change
      prestonsPickIndex = stockChanges.indexOf(Math.max(...stockChanges));
    } else {
      // Pick a random index (the 10% "oops" factor)
      prestonsPickIndex = Math.floor(Math.random() * stockChanges.length);
    }

    // Apply the change directly to cash to save on resources
    preston.cash += preston.cash * stockChanges[prestonsPickIndex];
    preston.updateData(week);
  }

  function runSim() {
    const stock1Change = simulateNextWeek(week, stock1, globalNews);
    const stock2Change = simulateNextWeek(week, stock2, globalNews);
    const stock3Change = simulateNextWeek(week, stock3, globalNews);
    const stock4Change = simulateNextWeek(week, stock4, globalNews);
    const stock5Change = simulateNextWeek(week, stock5, globalNews);

    setWeek((prev) => prev + 1);

    handleNewsCycle();

    handlePlayerAI([
      stock1Change,
      stock2Change,
      stock3Change,
      stock4Change,
      stock5Change,
    ]);
  }

  const renderContent = () => {
    switch (activeView) {
      case "news":
        return (
          <>
            <h1 style={{ color: "white" }}>Market News Feed</h1>
            {newsFeed.map((news, index) => (
              <FadeInSection key={index}>
                <div className={`news-item severity-${news.severity}`}>
                  <p className="news-text">{news.text}</p>
                  <span>Week: {news.week} </span>
                  <span className="news-type">Type: {news.type}</span>
                </div>
              </FadeInSection>
            ))}
          </>
        );
      case "assets":
        return (
          <>
            <h1 style={{ color: "white" }}>Your Assets</h1>
            <StockChart
              stock={player}
              color="#008FFB"
              width={550}
              height={150}
              tooltip={true}
            />
          </>
        );
      case "stock":
      default:
        return (
          <>
            <StockComponent
              player={player}
              stock={stock1}
              color="#008FFB"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              player={player}
              stock={stock2}
              color="#fbc000"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              player={player}
              stock={stock3}
              color="#fb004f"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              player={player}
              stock={stock4}
              color="#5400fb"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              player={player}
              stock={stock5}
              color="#fb6000"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
          </>
        );
    }
  };

  // Only used when deving
  // function downloadCSV() {
  //     const data = getTrainingData()

  //     try {
  //         const parser = new Parser();
  //         const csv = parser.parse(data);

  //         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  //         const url = URL.createObjectURL(blob);

  //         // Create a temporary link element to trigger download
  //         const link = document.createElement('a');
  //         link.href = url;
  //         link.setAttribute('download', 'PIM_training_data.csv');
  //         document.body.appendChild(link);
  //         link.click();

  //         // Cleanup
  //         document.body.removeChild(link);
  //         URL.revokeObjectURL(url);
  //     } catch (err) {
  //         console.error("CSV Export Error:", err);
  //     }
  // };

  return (
    <main id="PIM">
      <h1 style={{ color: "white" }}>
        P.I.M (Prediction Investment Model) Game
      </h1>
      <h1 style={{ color: "white" }}>Week: {week}/26</h1>
      <h2 style={{ color: "white" }}>Assets: ${player.assets.toFixed(2)}</h2>
      <div id="next-week-button">
        <button onClick={runSim}>Next Week</button>
      </div>
      <section id="PIM-game">
        <div id="PIM-nav">
          <h2 style={{ color: "white" }}>Menu</h2>
          <button
            className={`pim-button ${activeView === "stock" ? "active" : ""}`}
            onClick={() => setActiveView("stock")}
          >
            <FaChartLine />
            <span>Stock</span>
          </button>
          <button
            className={`pim-button ${activeView === "news" ? "active" : ""}`}
            onClick={() => setActiveView("news")}
          >
            <FaNewspaper /> News
          </button>
          <button
            className={`pim-button ${activeView === "assets" ? "active" : ""}`}
            onClick={() => setActiveView("assets")}
          >
            <FaMoneyBill /> Your Assets
          </button>
        </div>
        <div className="pim-content-holder" key={activeView}>
          {renderContent()}
        </div>
        <div id="players">
          <h2 style={{ color: "white" }}>Players</h2>
          <PlayerCard
            playerName="Player 1"
            playerIMG="player-profile.webp"
            portfolio={player}
            color="white"
            width={200}
            height={100}
          />
          <PlayerCard
            playerName="Preston Blackwell"
            playerIMG="preston-profile.webp"
            portfolio={preston}
            color="white"
            width={200}
            height={100}
          />
          <PlayerCard
            playerName="Randy Random"
            playerIMG="randy-profile.webp"
            portfolio={randy}
            color="white"
            width={200}
            height={100}
          />
          <PlayerCard
            playerName="Granny"
            playerIMG="grandma-profile.webp"
            portfolio={granny}
            color="white"
            width={200}
            height={100}
          />
        </div>
      </section>
    </main>
  );
}

export default PIM;
