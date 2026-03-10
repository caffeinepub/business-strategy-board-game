import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { SessionData } from "../App";
import type { GameState } from "../backend.d";

const PLAYER_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#eab308",
];

interface Props {
  session: SessionData;
  gameState: GameState | null;
  onLeave: () => void;
}

export default function EndGame({ session, gameState, onLeave }: Props) {
  const players = gameState?.players ?? [];
  const sorted = [...players].sort(
    (a, b) => Number(b.capital) - Number(a.capital),
  );
  const winner = sorted[0];
  const isWinner = winner?.id === session.playerId;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(var(--border)) 1px, transparent 0)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
          }}
        />
      </div>

      <motion.div
        data-ocid="endgame.panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 space-y-4"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center animate-pulse-glow"
          >
            <Trophy className="w-10 h-10 gold-text" />
          </motion.div>
          <h1 className="font-display text-4xl font-black gold-text">
            Game Over!
          </h1>
          {isWinner ? (
            <p className="text-foreground font-semibold text-lg">🎉 You won!</p>
          ) : (
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">
                {winner?.name}
              </span>{" "}
              wins the game!
            </p>
          )}
        </div>

        <Card className="border-2 border-primary/30 bg-card shadow-game">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Medal className="w-4 h-4 gold-text" /> Final Standings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  p.id === session.playerId
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/20 border-border"
                }`}
              >
                <div className="w-8 text-center">
                  {i === 0 ? (
                    <Crown className="w-5 h-5 gold-text mx-auto" />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      #{i + 1}
                    </span>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{
                    background:
                      PLAYER_COLORS[players.indexOf(p) % PLAYER_COLORS.length],
                  }}
                >
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rep: {Number(p.reputation)} | Inn: {Number(p.innovation)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm gold-text">
                    ${Number(p.capital)}
                  </p>
                  <p className="text-xs text-muted-foreground">capital</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Button
          onClick={onLeave}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11"
        >
          Back to Lobby
        </Button>
      </motion.div>
    </div>
  );
}
