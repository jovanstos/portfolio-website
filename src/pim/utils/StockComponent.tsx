import { useState, useMemo } from "react";
import type { StockComponentProps } from "../../types/pimTypes";
import { useMutation } from "@tanstack/react-query";
import { postDataToPIM } from "../../api/python";
import StockChart from "./StockChart";
import Popup from "../../components/Popup";
import {
  formatStockData,
  handlePIMPrediction,
  formatNumber,
} from "../PIMDataUtils";
import {
  FaPhoneAlt,
  FaDice,
  FaArrowUp,
  FaArrowDown,
  FaRobot,
} from "react-icons/fa";
import "../../styles/PIM.css";

type PopupType = "BUY" | "SELL" | "STAKE" | "PIM" | null;
type StakeDirection = "UP" | "DOWN";

function StockComponent({
  player,
  stock,
  color,
  globalNews,
  week,
  width,
  height,
}: StockComponentProps) {
  const [stockInfoView, setStockInfoView] = useState<boolean>(false);

  // Popup State
  const [activePopup, setActivePopup] = useState<PopupType>(null);
  // Used for Share Count or Cash Amount
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [stakeDir, setStakeDir] = useState<StakeDirection>("UP");

  // PIM Prediction State
  const [pimPrediction, setPimPrediction] = useState<string | null>(null);

  // Force update to trigger re-render when player object mutates
  const [_, setTick] = useState(0);
  const forceUpdate = () => setTick((t) => t + 1);

  const ownedHoldings = useMemo(() => {
    return Object.entries(player.stocks).filter(
      ([_, s]) => s.stockObject.name === stock.name,
    );
  }, [player.stocks, stock.name, _]); // Depend on _ (tick) to refresh when sales happen

  const PIMMutation = useMutation({
    mutationFn: postDataToPIM,
    onSuccess: async (data: any) => {
      // Update local state to show in popup
      const PIMText = handlePIMPrediction(data);

      setPimPrediction(PIMText);
    },
    onError: (error: any) => {
      const msg =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(msg);
      setPimPrediction("Error: Unable to reach PIM.");
    },
  });

  const askPIM = () => {
    setActivePopup("PIM");
    setPimPrediction(null); // Reset previous prediction
    PIMMutation.mutate(formatStockData(stock, globalNews, week));
  };

  const handleInfoButton = () => {
    setStockInfoView(!stockInfoView);
  };

  const closePopup = () => {
    setActivePopup(null);
    setTransactionAmount(0);
    setStakeDir("UP");
  };

  const handleBuy = () => {
    if (transactionAmount <= 0) return;
    const cost = transactionAmount * stock.currentPrice;
    if (player.cash >= cost) {
      player.addAsset(stock, transactionAmount);
      forceUpdate(); // Refresh UI to show new cash balance
      closePopup();
    } else {
      alert("Insufficient funds!");
    }
  };

  const handleSell = (id: string) => {
    player.sellAsset(Number(id));
    forceUpdate(); // Refresh UI
  };

  const handleStake = () => {
    if (transactionAmount <= 0) return;
    if (player.cash >= transactionAmount) {
      player.addStake(stock, transactionAmount, stakeDir);
      forceUpdate();
      closePopup();
    } else {
      alert("Insufficient funds for this stake!");
    }
  };

  return (
    <section className="stock">
      <h3>{stock.name}</h3>
      {stockInfoView ? (
        <table className="stock-table">
          <thead>
            <tr className="stock-tr">
              <th className="stock-th">Current Price</th>
              <th className="stock-th">Earnings</th>
              <th className="stock-th">Projected</th>
              <th className="stock-th">Volume</th>
              <th className="stock-th">Volatility</th>
              <th className="stock-th">P/E</th>
              <th className="stock-th">Social Buzz</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="stock-td">${stock.currentPrice.toFixed(2)}</td>
              <td className="stock-td">
                ${formatNumber(stock.currentEarnings)}
              </td>
              <td className="stock-td">
                ${formatNumber(stock.projectedEarnings)}
              </td>
              <td className="stock-td">{stock.volume}</td>
              <td className="stock-td">{stock.volatility}</td>
              <td className="stock-td">{stock.pOverE.toFixed(2)}</td>
              <td className="stock-td">{stock.socialBuzz}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <StockChart
          stock={stock}
          color={color}
          width={width}
          height={height}
          tooltip={true}
        />
      )}
      <div className="stock-actions">
        <button
          onClick={() => setActivePopup("BUY")}
          className="pim-button pim-buy-button"
        >
          Buy
        </button>
        <button
          onClick={() => setActivePopup("SELL")}
          className="pim-button pim-sell-button"
        >
          Sell
        </button>
        <button onClick={askPIM} className="pim-button">
          Ask PIM <FaPhoneAlt />
        </button>
        <button onClick={() => setActivePopup("STAKE")} className="pim-button">
          Stake <FaDice />
        </button>
        <button onClick={handleInfoButton} className="pim-button">
          {stockInfoView ? "Chart" : "Info"}
        </button>
      </div>
      {/* --- POPUPS --- */}

      {/* BUY POPUP */}
      <Popup isOpen={activePopup === "BUY"} onClose={closePopup}>
        <div className="popup-inner-content">
          <h2>Buy {stock.name}</h2>
          <div className="popup-stats">
            <p>
              <strong>Available Cash:</strong> ${player.cash.toFixed(2)}
            </p>
            <p>
              <strong>Current Price:</strong> ${stock.currentPrice.toFixed(2)}
            </p>
            <p>
              <strong>Max Shares:</strong>{" "}
              {Math.floor(player.cash / stock.currentPrice)}
            </p>
          </div>

          <div className="popup-input-group">
            <label>Shares to Buy:</label>
            <input
              type="number"
              min="0"
              value={transactionAmount}
              onChange={(e) =>
                setTransactionAmount(parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="popup-summary">
            <p>
              Total Cost: ${(transactionAmount * stock.currentPrice).toFixed(2)}
            </p>
          </div>

          <button className="pim-button pim-buy-button" onClick={handleBuy}>
            Confirm Purchase
          </button>
        </div>
      </Popup>

      {/* SELL POPUP */}
      <Popup isOpen={activePopup === "SELL"} onClose={closePopup}>
        <div className="popup-inner-content">
          <h2>Sell Holdings: {stock.name}</h2>
          <p>You have {ownedHoldings.length} active lots for this stock.</p>

          <div
            className="holdings-list"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {ownedHoldings.length === 0 ? (
              <p>You do not own any shares of this stock.</p>
            ) : (
              <table className="stock-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Shares</th>
                    <th>Buy Price</th>
                    <th>Current Val</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ownedHoldings.map(([id, s]) => (
                    <tr key={id}>
                      <td>{s.shares}</td>
                      <td>${s.buyPrice.toFixed(2)}</td>
                      <td>${(s.shares * stock.currentPrice).toFixed(2)}</td>
                      <td>
                        <button
                          className="pim-button pim-sell-button"
                          style={{ fontSize: "0.8rem", padding: "5px" }}
                          onClick={() => handleSell(id)}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Popup>

      {/* PIM PREDICTION POPUP */}
      <Popup isOpen={activePopup === "PIM"} onClose={closePopup}>
        <div className="popup-inner-content" style={{ textAlign: "center" }}>
          <h2>PIM Analysis</h2>
          <div
            style={{
              margin: "2rem 0",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {PIMMutation.isPending ? (
              <>
                <FaRobot
                  className="rotating-icon"
                  size={40}
                  style={{ marginBottom: "1rem", color: "#888" }}
                />
                <p className="pulsing-text">Analyzing market data...</p>
              </>
            ) : (
              <>
                <FaRobot
                  size={40}
                  style={{ marginBottom: "1rem", color: "#4CAF50" }}
                />
                <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {pimPrediction || "No prediction available."}
                </p>
              </>
            )}
          </div>

          {!PIMMutation.isPending && (
            <button className="pim-button" onClick={closePopup}>
              Close
            </button>
          )}
        </div>
      </Popup>

      {/* STAKE POPUP */}
      <Popup isOpen={activePopup === "STAKE"} onClose={closePopup}>
        <div className="popup-inner-content">
          <h2>Stake on {stock.name}</h2>
          <p>Bet on the movement of this stock.</p>
          <div className="popup-stats">
            <p>
              <strong>Available Cash:</strong> ${player.cash.toFixed(2)}
            </p>
          </div>

          <div className="popup-input-group">
            <label>Amount to Wager:</label>
            <input
              type="number"
              min="0"
              value={transactionAmount}
              onChange={(e) =>
                setTransactionAmount(Number(e.target.value) || 0)
              }
            />
          </div>

          <div
            className="stake-direction-selector"
            style={{ display: "flex", gap: "10px", margin: "20px 0" }}
          >
            <button
              className={`pim-button ${stakeDir === "UP" ? "pim-buy-button" : ""}`}
              style={{ opacity: stakeDir === "UP" ? 1 : 0.5 }}
              onClick={() => setStakeDir("UP")}
            >
              High <FaArrowUp />
            </button>
            <button
              className={`pim-button ${stakeDir === "DOWN" ? "pim-sell-button" : ""}`}
              style={{ opacity: stakeDir === "DOWN" ? 1 : 0.5 }}
              onClick={() => setStakeDir("DOWN")}
            >
              Low <FaArrowDown />
            </button>
          </div>

          <button className="pim-button" onClick={handleStake}>
            Place Stake
          </button>
        </div>
      </Popup>
    </section>
  );
}

export default StockComponent;
