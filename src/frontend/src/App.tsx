import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import EndGame from "./components/EndGame";
import GameBoard from "./components/GameBoard";
import Lobby from "./components/Lobby";
import WaitingRoom from "./components/WaitingRoom";
import { useGameState } from "./hooks/useQueries";

const queryClient = new QueryClient();

export interface SessionData {
  roomCode: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
}

const SESSION_KEY = "bsg_session";

function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data: SessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

type Screen = "lobby" | "waiting" | "game" | "end";

function GameApp() {
  const [session, setSession] = useState<SessionData | null>(loadSession);
  const [screen, setScreen] = useState<Screen>("lobby");

  const { data: gameState } = useGameState(
    session?.roomCode ?? null,
    screen !== "lobby",
  );

  useEffect(() => {
    if (!gameState || !session) return;
    if (gameState.gameFinished) {
      setScreen("end");
    } else if (gameState.gameStarted) {
      setScreen("game");
    } else {
      setScreen("waiting");
    }
  }, [gameState, session]);

  function handleSessionCreated(data: SessionData) {
    saveSession(data);
    setSession(data);
    setScreen("waiting");
  }

  function handleLeave() {
    clearSession();
    setSession(null);
    setScreen("lobby");
  }

  if (screen === "lobby" || !session) {
    return <Lobby onSession={handleSessionCreated} />;
  }

  if (screen === "waiting") {
    return (
      <WaitingRoom
        session={session}
        gameState={gameState ?? null}
        onLeave={handleLeave}
      />
    );
  }

  if (screen === "end") {
    return (
      <EndGame
        session={session}
        gameState={gameState ?? null}
        onLeave={handleLeave}
      />
    );
  }

  return <GameBoard session={session} onLeave={handleLeave} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameApp />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
