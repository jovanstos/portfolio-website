import { useState } from "react";
import { Stock } from "./classes/Stock";
import { simulateNextWeek } from "./stockAlgorithm";
import { generateNewsValue, getNewsStory } from "./newsAlgorithm";
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
  const [gameState, setGameState] = useState<"start" | "playing" | "end">(
    "start",
  );
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
  // Used to create DOM updates
  const [transactionCount, setTransactionCount] = useState(0);

  console.log(transactionCount);

  function handleNewsCycle() {
    const stocks = [stock1, stock2, stock3, stock4, stock5];
    const newEntries: NewsObject[] = [];

    stocks.forEach((s) => {
      s.companyNews = generateNewsValue();
      if (s.companyNews !== 0) {
        const story = getNewsStory(s.companyNews, "Company");
        newEntries.push({
          text: `${s.name}: ${story}`,
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
        const story = getNewsStory(newVal, "Global");

        newEntries.push({
          text: story,
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
    if (week >= 26) {
      setGameState("end");
      return;
    }

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

  const triggerUpdate = () => setTransactionCount((prev) => prev + 1);

  // START SCREEN LOGIC
  if (gameState === "start") {
    return (
      <main id="PIM" className="start-end">
        <h1 style={{ color: "white", fontSize: "3rem", marginBottom: "20px" }}>
          P.I.M.
        </h1>
        <h2 style={{ color: "#aaa", marginBottom: "40px" }}>
          Predictive Investment Model Simulation
        </h2>
        <div
          style={{
            color: "white",
            maxWidth: "600px",
            lineHeight: "1.6",
            marginBottom: "40px",
          }}
        >
          <p>
            Welcome to the simulation. You play as "Player 1" and are a stock
            investor over a 26-week period. You have a secret tool to assist you
            in this period called P.I.M. an AI/ML. P.I.M is able to predict if a
            stock will go up and down, helping you make better trades.
          </p>
          <hr />
          <p>
            You will compete against 3 differnt AI in the market, after 26 weeks
            whoever has the highest assets wins! Analyze the market, read the
            news, manage your assets correctly, and use P.I.M. to outperform the
            competition! 😎
          </p>
        </div>
        <button
          className="pim-button"
          style={{ fontSize: "1.5rem", padding: "15px 40px" }}
          onClick={() => {
            setGameState("playing");
            runSim(); // Run the 0 week immediately upon start
          }}
        >
          Start Game
        </button>
      </main>
    );
  }

  // END GAME SCREEN LOGIC
  if (gameState === "end") {
    // Sort players by total assets for the leaderboard
    const allPlayers = [player, preston, randy, granny].sort(
      (a, b) => b.assets - a.assets,
    );

    return (
      <main id="PIM" className="start-end">
        <h1 style={{ color: "white", fontSize: "3rem" }}>Game Over</h1>
        <h2 style={{ color: "white" }}>Week 27 Reached</h2>

        <div
          style={{
            marginTop: "30px",
            marginBottom: "30px",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <h3
            style={{
              color: "white",
              borderBottom: "1px solid #555",
              paddingBottom: "10px",
            }}
          >
            Final Standings
          </h3>
          {allPlayers.map((p, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: p.name === player.name ? "#008FFB" : "white",
                padding: "15px",
                background: "rgba(255,255,255,0.05)",
                marginBottom: "10px",
                borderRadius: "8px",
                border: p.name === player.name ? "1px solid #008FFB" : "none",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                #{index + 1} {p.name}
              </span>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                ${p.assets.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <h2 style={{ color: "#4caf50", marginTop: "20px" }}>
          Thanks for playing!
        </h2>
      </main>
    );
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
              color="white"
              width={550}
              height={250}
              tooltip={true}
            />
            <h2>Cash:</h2>
            <p>${player.cash.toFixed(2)}</p>
            <h2>Stocks:</h2>
            {Object.values(player.stocks).map((pstoc, key) => (
              <div key={key}>
                <table className="stock-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Shares</th>
                      <th>Buy Price</th>
                      <th>Current Val</th>
                      <th>Change</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{pstoc.stockObject.name}</td>
                      <td>{pstoc.shares}</td>
                      <td>${pstoc.buyPrice.toFixed(2)}</td>
                      <td>
                        $
                        {(
                          pstoc.shares * pstoc.stockObject.currentPrice
                        ).toFixed(2)}
                      </td>
                      <td>
                        {(
                          ((pstoc.stockObject.currentPrice - pstoc.buyPrice) /
                            pstoc.buyPrice) *
                          100
                        ).toFixed(2)}
                        %
                      </td>
                      <td>
                        <button
                          className="pim-button pim-sell-button"
                          style={{ fontSize: "0.8rem", padding: "5px" }}
                          onClick={() => {
                            player.sellAsset(key);
                            triggerUpdate();
                          }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            <h2>Stakes:</h2>
            {Object.values(player.stakes).map((pstake, key) => (
              <div key={key}>
                <table className="stock-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Stock Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{pstake.stockObject.name}</td>
                      <td>${pstake.stakeAmount.toFixed(2)}</td>
                      <td>{pstake.stakeType}</td>
                      <td>${pstake.stakePrice.toFixed(2)}</td>
                      <td>
                        <button
                          className="pim-button pim-sell-button"
                          style={{ fontSize: "0.8rem", padding: "5px" }}
                          onClick={() => {
                            player.sellStake(key);
                            triggerUpdate();
                          }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
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
        P.I.M. (Prediction Investment Model) Simulation
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
