import type { PlayerProps } from "../../types/pimTypes";
import StockChart from "./StockChart";
import "../../styles/PIM.css";

function PlayerCard({
  playerName,
  playerIMG,
  stock,
  color,
  width,
  height,
}: PlayerProps) {
  return (
    <div className="player-card">
      <div className="player-profile">
        <img
          className="player-img"
          src={playerIMG}
          alt="player profile image"
        />
        <h3>{playerName}</h3>
      </div>
      <p>This Week: </p>
      <p>Overall: </p>
      <StockChart stock={stock} color={color} width={width} height={height} />
    </div>
  );
}

export default PlayerCard;
