import type { StockComponentProps } from "../../types/pimTypes";
import { useMutation } from "@tanstack/react-query";
import { postDataToPIM } from "../../api/python";
import StockChart from "./StockChart";
import { formatStockData, handlePIMPrediction } from "../PIMDataUtils";
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

  return (
    <section className="stock">
      <h3>{stock.companyName}</h3>
      <StockChart
        stock={stock}
        color={color}
        width={width}
        height={height}
        tooltip={true}
      />
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
    </section>
  );
}

export default StockComponent;
