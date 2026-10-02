import { useState } from "react";
import StockComponent from "./utils/StockComponent";
import PlayerCard from "./utils/PlayerCard";
import StockChart from "./utils/StockChart";
import { useGameSession } from "./useGameSession";
import "../styles/PIM.css";
// CSV training-data export remains disabled; Python/model development is out of scope.
const colors = ["#008FFB", "#fbc000", "#fb004f", "#9566ff", "#fb6000"];
export default function PIM() {
  const { game, session } = useGameSession();
  const [view, setView] = useState<"stock" | "news" | "assets">("stock");
  const profiles = [
    "player-profile.webp",
    "preston-profile.webp",
    "randy-profile.webp",
    "grandma-profile.webp",
  ];
  if (game.phase === "start")
    return (
      <section id="PIM" className="start-end">
        <h1>P.I.M.</h1>
        <h2>Predictive Investment Model Simulation</h2>
        <p>
          Trade across 26 weeks. Read the news, manage your assets, and compete
          with Preston, Randy, and Granny. Ask PIM for experimental predictions
          after ten weeks of market history.
        </p>
        <p>
          A game, not financial advice. The opponents keep their original
          strategies—including Preston's unusually good timing.
        </p>
        <button className="primary-button" onClick={session.start}>
          Start game
        </button>
      </section>
    );
  if (game.phase === "end")
    return (
      <section id="PIM" className="start-end">
        <h1>Game over · 26 weeks complete</h1>
        <h2>Final standings</h2>
        <ol className="pim-standings">
          {[game.player, ...game.opponents]
            .sort((a, b) => b.assets - a.assets)
            .map((player) => (
              <li key={player.name}>
                {player.name} <strong>${player.assets.toFixed(2)}</strong>
              </li>
            ))}
        </ol>
        <button
          className="primary-button"
          onClick={() => {
            session.restart();
            setView("stock");
          }}
        >
          Play again
        </button>
      </section>
    );
  return (
    <section id="PIM">
      <header className="pim-header">
        <div>
          <h1>P.I.M.</h1>
          <p>
            Week {game.week}/26 · Assets ${game.player.assets.toFixed(2)} · Cash
            ${game.player.cash.toFixed(2)}
          </p>
        </div>
        <button className="primary-button" onClick={session.advance}>
          Next week
        </button>
        <button
          className="secondary-button"
          onClick={() => {
            session.restart();
            setView("stock");
          }}
        >
          Restart
        </button>
      </header>
      <div className="pim-tabs" aria-label="Game views">
        {(["stock", "news", "assets"] as const).map((item) => (
          <button
            key={item}
            aria-pressed={view === item}
            onClick={() => setView(item)}
          >
            {item === "stock"
              ? "Market"
              : item === "news"
                ? "News"
                : "Your assets"}
          </button>
        ))}
      </div>
      <div id="PIM-game">
        <div className="pim-content-holder">
          {view === "stock" &&
            game.stocks.map((stock, index) => (
              <StockComponent
                key={stock.name}
                player={game.player}
                stock={stock}
                color={colors[index]}
                globalNews={game.globalNews}
                week={game.week}
                width={550}
                height={180}
                onTrade={session.trade}
              />
            ))}
          {view === "news" && (
            <>
              <h2>Market news</h2>
              {game.news.length === 0 && <p>No market stories yet.</p>}
              {game.news.map((news) => (
                <article
                  key={`${news.week}:${news.text}`}
                  className={`news-item severity-${news.severity}`}
                >
                  <p>{news.text}</p>
                  <small>Week {news.week}</small>
                </article>
              ))}
            </>
          )}
          {view === "assets" && (
            <>
              <h2>Your assets</h2>
              <StockChart
                stock={game.player}
                color="#008FFB"
                width={550}
                height={230}
                tooltip
              />
              <p>Cash: ${game.player.cash.toFixed(2)}</p>
              <h3>Holdings</h3>
              {Object.entries(game.player.stocks).map(([id, holding]) => (
                <div key={id} className="pim-holding">
                  <span>
                    {holding.stockObject.name} · {holding.shares} shares · $
                    {(
                      holding.shares * holding.stockObject.currentPrice
                    ).toFixed(2)}
                  </span>
                  <button
                    onClick={() =>
                      session.trade("sell", holding.stockObject, Number(id))
                    }
                  >
                    Sell lot
                  </button>
                </div>
              ))}
              <h3>Stakes</h3>
              {Object.entries(game.player.stakes).map(([id, stake]) => (
                <div key={id} className="pim-holding">
                  <span>
                    {stake.stockObject.name} · {stake.stakeType} · $
                    {stake.stakeAmount.toFixed(2)}
                  </span>
                  <button
                    onClick={() =>
                      session.trade("unstake", stake.stockObject, Number(id))
                    }
                  >
                    Cancel stake
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        <aside id="players" aria-label="Players">
          {[game.player, ...game.opponents].map((player, index) => (
            <PlayerCard
              key={player.name}
              playerName={player.name}
              playerIMG={profiles[index]}
              portfolio={player}
              color="#ddd"
              width={200}
              height={100}
            />
          ))}
        </aside>
      </div>
    </section>
  );
}
