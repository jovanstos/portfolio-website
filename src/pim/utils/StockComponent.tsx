import { useState } from "react";
import type { StockComponentProps } from "../../types/pimTypes";
import { useMutation } from "@tanstack/react-query";
import { postDataToPIM } from "../../api/python";
import StockChart from "./StockChart";
import { formatStockData, handlePIMPrediction } from "../PIMDataUtils";
import { formatNumber } from "../PIMDataUtils";
import { FaPhoneAlt, FaDice } from "react-icons/fa";
import "../../styles/PIM.css";

function StockComponent({
  stock,
  color,
  globalNews,
  week,
  width,
  height,
}: StockComponentProps) {
  const [stockInfoView, setStockInfoView] = useState<boolean>(false);

  const PIMMutation = useMutation({
    mutationFn: postDataToPIM,
    onSuccess: async (data: number[]) => {
      handlePIMPrediction(data);
    },
    onError: (error: any) => {
      const msg =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(msg);
    },
  });

  const askPIM = () => {
    PIMMutation.mutate(formatStockData(stock, globalNews, week));
  };

  const handleInfoButton = () => {
    setStockInfoView(!stockInfoView);
  };

  return (
    <section className="stock">
      <h3>{stock.companyName}</h3>
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
      <button
        style={{
          display: "inline",
        }}
        className="pim-button pim-buy-button"
      >
        Buy
      </button>
      <button
        style={{
          display: "inline",
        }}
        className="pim-button pim-sell-button"
      >
        Sell
      </button>
      <button
        style={{ display: "inline" }}
        onClick={askPIM}
        className="pim-button"
      >
        Ask PIM
        <FaPhoneAlt />
      </button>
      <button style={{ display: "inline" }} className="pim-button">
        Stake
        <FaDice />
      </button>
      {stockInfoView ? (
        <button
          onClick={handleInfoButton}
          style={{ display: "inline" }}
          className="pim-button"
        >
          Stock
        </button>
      ) : (
        <button
          onClick={handleInfoButton}
          style={{ display: "inline" }}
          className="pim-button"
        >
          Info
        </button>
      )}
    </section>
  );
}

export default StockComponent;
