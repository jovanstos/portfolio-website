import type { PlayerProps } from "../../types/pimTypes";
import StockChart from "./StockChart";
import "../../styles/PIM.css";

function PlayerCard({
  playerName,
  playerIMG,
  portfolio,
  color,
  width,
  height,
}: PlayerProps) {
  // Safely get the baseline for "This Week"
  // .at(-2) gets the 2nd to last. Fallback to the 1st element if it doesn't exist.
  const weekBaseline = portfolio.data.at(-2)?.[1] ?? portfolio.data[0][1];

  const weekChange = ((portfolio.assets - weekBaseline) / weekBaseline) * 100;
  const overallChange = ((portfolio.assets - 100000) / 100000) * 100;

  // Used to determine color
  const getColor = (value: number) => (value >= 0 ? "#00c569" : "#d53051");

  return (
    <div className="player-card">
      <div className="player-profile">
        <img
          className="player-img"
          src={`/${playerIMG}`}
          alt="player profile image"
        />
        <h3>{playerName}</h3>
      </div>
      <p style={{ color: getColor(weekChange) }}>
        This Week: {weekChange.toFixed(2)}%
      </p>
      <p style={{ color: getColor(overallChange) }}>
        Overall: {overallChange.toFixed(2)}%
      </p>
      <StockChart
        stock={portfolio}
        color={color}
        width={width}
        height={height}
        tooltip={false}
      />
    </div>
  );
}

export default PlayerCard;
