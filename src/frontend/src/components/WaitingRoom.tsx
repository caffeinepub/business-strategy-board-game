import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Copy, Crown, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { SessionData } from "../App";
import type { GameState } from "../backend.d";
import { useStartGame } from "../hooks/useQueries";

const PLAYER_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

interface Props {
  session: SessionData;
  gameState: GameState | null;
  onLeave: () => void;
}

export default function WaitingRoom({ session, gameState, onLeave }: Props) {
  const startGame = useStartGame();

  async function handleStart() {
    try {
      const result = await startGame.mutateAsync({
        roomCode: session.roomCode,
        playerId: session.playerId,
      });
      if (result.__kind__ === "err") {
        toast.error(result.err);
      }
    } catch {
      toast.error("Failed to start game");
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(session.roomCode);
    toast.success("Room code copied!");
  }

  const players = gameState?.players ?? [];
  const canStart = session.isHost && players.length >= 2;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 space-y-4"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl font-black gold-text">
            Waiting Room
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Waiting for all players to join...
          </p>
        </div>

        {/* Room Code */}
        <Card className="border-2 border-primary/40 bg-card shadow-game">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Room Code
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-4xl font-black gold-text tracking-[0.2em]">
                {session.roomCode}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyCode}
                data-ocid="waiting.copy_button"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this code with friends to join
            </p>
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="border border-border bg-card shadow-game">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Players ({players.length}/12)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {players.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <Clock className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                No players yet...
              </div>
            ) : (
              players.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${PLAYER_COLORS[i % PLAYER_COLORS.length]}`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground text-sm">
                    {p.name}
                  </span>
                  {p.id === gameState?.hostId && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs border-primary/50 gold-text"
                    >
                      <Crown className="w-3 h-3 mr-1" /> Host
                    </Badge>
                  )}
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          {session.isHost ? (
            <>
              {!canStart && players.length < 2 && (
                <p className="text-center text-xs text-muted-foreground">
                  Need at least 2 players to start (currently {players.length})
                </p>
              )}
              <Button
                data-ocid="waiting.start_button"
                onClick={handleStart}
                disabled={!canStart || startGame.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base h-12 animate-pulse-glow"
              >
                {startGame.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {canStart ? "Start Game" : "Waiting for players..."}
              </Button>
            </>
          ) : (
            <div className="text-center py-3 text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-pulse" />
              Waiting for host to start the game...
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onLeave}
            data-ocid="waiting.leave_button"
          >
            Leave Room
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
