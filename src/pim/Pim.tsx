import { useState } from "react";
import { Stock } from "./classes/Stock";
import { simulateNextWeek } from "./stockAlgorithm";
import { generateNewsValue } from "./NewsAlgorithm";
import StockComponent from "./utils/StockComponent";
import PlayerCard from "./utils/PlayerCard";
import { FaChartLine, FaNewspaper, FaMoneyBill } from "react-icons/fa";
import type { newsObject } from "../types/pimTypes";
import "../styles/PIM.css";
// Only used when deving
// import { Parser } from '@json2csv/plainjs';
// import { getTrainingData } from './PIMDataUtils';

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

// P.I.M. stands for predictive investment model
function PIM() {
  const [activeView, setActiveView] = useState<"stock" | "news" | "assets">(
    "stock",
  );
  const [newsFeed, setNewsFeed] = useState<newsObject[]>([
    {
      text: "This is the news feed, here you will see any news stories!",
      type: "global",
      company: "N/A",
      severity: 0,
    },
  ]);
  const [globalNews, setGlobalNews] = useState<number>(0);
  const [week, setWeek] = useState<number>(0);

  function handleNewsCycle() {
    const stocks = [stock1, stock2, stock3, stock4, stock5];
    const newEntries: newsObject[] = [];

    stocks.forEach((s) => {
      s.companyNews = generateNewsValue();
      if (s.companyNews !== 0) {
        newEntries.push({
          text: `${s.companyName} announces record profits!`,
          type: "company",
          company: s.companyName,
          severity: s.companyNews,
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
          type: "global",
          company: "N/A",
          severity: newVal,
        });
      }
    }

    if (newEntries.length > 0) {
      setNewsFeed((prev) => [...newEntries, ...prev]);
    }
  }

  function runSim() {
    simulateNextWeek(week, stock1, globalNews);
    simulateNextWeek(week, stock2, globalNews);
    simulateNextWeek(week, stock3, globalNews);
    simulateNextWeek(week, stock4, globalNews);
    simulateNextWeek(week, stock5, globalNews);

    setWeek((prev) => prev + 1);

    handleNewsCycle();
  }

  const renderContent = () => {
    switch (activeView) {
      case "news":
        return (
          <>
            <h1 style={{ color: "white" }}>Market News Feed</h1>
            <div className="news-list">
              {newsFeed.map((news, index) => (
                <div
                  key={index}
                  className={`news-item severity-${news.severity}`}
                >
                  <p className="news-text">{news.text}</p>
                  <span className="news-type">
                    TYPE: {news.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </>
        );
      case "assets":
        return <h1 style={{ color: "white" }}>Assets</h1>;
      case "stock":
      default:
        return (
          <>
            <StockComponent
              stock={stock1}
              color="#008FFB"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              stock={stock2}
              color="#fbc000"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              stock={stock3}
              color="#fb004f"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
              stock={stock4}
              color="#5400fb"
              globalNews={globalNews}
              week={week}
              width={550}
              height={150}
            />
            <StockComponent
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
      <h2 style={{ color: "white" }}>Assets: $0</h2>
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
            stock={stock1}
            color="white"
            width={200}
            height={100}
          />
          <PlayerCard
            playerName="Preston Blackwell"
            playerIMG="preston-profile.webp"
            stock={stock1}
            color="white"
            width={200}
            height={100}
          />
          <PlayerCard
            playerName="Randy Random"
            playerIMG="randy-profile.webp"
            stock={stock1}
            color="white"
            width={200}
            height={100}
          />
          <PlayerCard
            playerName="Granny"
            playerIMG="grandma-profile.webp"
            stock={stock1}
            color="white"
            width={200}
            height={100}
          />
        </div>
      </section>
      <button onClick={runSim}>Run Sim</button>
    </main>
  );
}

export default PIM;
