import { useState, useSyncExternalStore } from "react";
import { GameSession } from "./gameSession";
export function useGameSession() {
  const [session] = useState(() => new GameSession());
  return {
    session,
    game: useSyncExternalStore(session.subscribe, session.getSnapshot),
  };
}
