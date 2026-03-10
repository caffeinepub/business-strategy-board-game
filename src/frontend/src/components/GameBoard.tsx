import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dice5,
  Loader2,
  LogOut,
  Package,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { SessionData } from "../App";
import type { Player } from "../backend.d";
import { TileType } from "../backend.d";
import { useEndTurn, useGameState, useRollDice } from "../hooks/useQueries";

const TILES = [
  { id: 0, name: "START", tileType: TileType.start },
  { id: 1, name: "Market Research", tileType: TileType.decision },
  { id: 2, name: "Lucky Deal", tileType: TileType.bonus },
  { id: 3, name: "Supply Chain", tileType: TileType.decision },
  { id: 4, name: "Tax Audit", tileType: TileType.penalty },
  { id: 5, name: "Innovation Lab", tileType: TileType.bonus },
  { id: 6, name: "Competitor Attack", tileType: TileType.penalty },
  { id: 7, name: "Brand Launch", tileType: TileType.decision },
  { id: 8, name: "Cash Bonus", tileType: TileType.bonus },
  { id: 9, name: "Regulatory Fine", tileType: TileType.penalty },
  { id: 10, name: "Pricing Strategy", tileType: TileType.decision },
  { id: 11, name: "Investor Meeting", tileType: TileType.bonus },
  { id: 12, name: "Data Breach", tileType: TileType.penalty },
  { id: 13, name: "Product Launch", tileType: TileType.decision },
  { id: 14, name: "Market Crash", tileType: TileType.penalty },
  { id: 15, name: "Partnership Deal", tileType: TileType.bonus },
  { id: 16, name: "Talent Hire", tileType: TileType.decision },
  { id: 17, name: "Office Flood", tileType: TileType.penalty },
  { id: 18, name: "Viral Campaign", tileType: TileType.bonus },
  { id: 19, name: "Legal Battle", tileType: TileType.penalty },
  { id: 20, name: "Merger Talks", tileType: TileType.decision },
  { id: 21, name: "Tech Upgrade", tileType: TileType.bonus },
  { id: 22, name: "Scandal", tileType: TileType.penalty },
  { id: 23, name: "Expansion", tileType: TileType.decision },
  { id: 24, name: "Equipment Failure", tileType: TileType.penalty },
  { id: 25, name: "Global Deal", tileType: TileType.bonus },
  { id: 26, name: "Restructure", tileType: TileType.decision },
  { id: 27, name: "FINISH", tileType: TileType.final_ },
];

const PLAYER_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
];

function getTileClass(tileType: TileType): string {
  switch (tileType) {
    case TileType.start:
      return "tile-start";
    case TileType.bonus:
      return "tile-bonus";
    case TileType.penalty:
      return "tile-penalty";
    case TileType.decision:
      return "tile-decision";
    case TileType.final_:
      return "tile-final";
    default:
      return "tile-decision";
  }
}

function getTileEvent(tileType: TileType): string {
  switch (tileType) {
    case TileType.bonus:
      return "+10 Capital gained! Your business thrives.";
    case TileType.penalty:
      return "-10 Capital lost! A setback for your company.";
    case TileType.decision:
      return "+5 Reputation gained! Strategic decision made.";
    case TileType.final_:
      return "You reached the finish line!";
    case TileType.start:
      return "Back to the beginning. +10 Capital for passing Go!";
    default:
      return "Something happened...";
  }
}

// Board layout: 28 tiles arranged as a rectangular loop
function getBoardLayout() {
  const COLS = 8;
  const ROWS = 6;
  const positions: Record<number, [number, number]> = {};

  // Bottom row: 0-7
  for (let i = 0; i <= 7; i++) {
    positions[i] = [i, ROWS - 1];
  }
  // Right column going up: 8-13
  for (let i = 0; i <= 5; i++) {
    positions[8 + i] = [COLS - 1, ROWS - 2 - i];
  }
  // Top row going left: 14-20
  for (let i = 0; i <= 6; i++) {
    positions[14 + i] = [COLS - 2 - i, 0];
  }
  // Left column going down: 21-27
  for (let i = 0; i <= 6; i++) {
    positions[21 + i] = [0, 1 + i];
  }

  return { positions, COLS, ROWS };
}

interface EventModalData {
  diceValue: number;
  tileName: string;
  tileType: TileType;
  event: string;
}

interface Props {
  session: SessionData;
  onLeave: () => void;
}

export default function GameBoard({ session, onLeave }: Props) {
  const { data: gameState } = useGameState(session.roomCode);
  const rollDice = useRollDice();
  const endTurn = useEndTurn();
  const [eventModal, setEventModal] = useState<EventModalData | null>(null);
  const [diceAnimating, setDiceAnimating] = useState(false);

  const players = gameState?.players ?? [];
  const myPlayer = players.find((p) => p.id === session.playerId);
  const currentTurnIndex = Number(gameState?.currentTurn ?? 0);
  const currentPlayer = players[currentTurnIndex];
  const isMyTurn = currentPlayer?.id === session.playerId;
  const hasRolled = myPlayer?.hasRolled ?? false;

  const { positions, COLS, ROWS } = getBoardLayout();

  const getPlayersOnTile = useCallback(
    (tileId: number): Player[] => {
      return players.filter((p) => Number(p.position) === tileId);
    },
    [players],
  );

  async function handleRoll() {
    if (!isMyTurn || hasRolled) return;
    setDiceAnimating(true);
    setTimeout(() => setDiceAnimating(false), 700);
    try {
      const result = await rollDice.mutateAsync({
        roomCode: session.roomCode,
        playerId: session.playerId,
      });
      if (result.__kind__ === "err") {
        toast.error(result.err);
        return;
      }
      // Backend returns "diceValue:newPosition"
      const parts = result.ok.split(":");
      const diceValue = Number.parseInt(parts[0] ?? "1", 10);
      const newPos = Number.parseInt(parts[1] ?? "0", 10);
      const tile = TILES[newPos] ?? TILES[0];
      setEventModal({
        diceValue,
        tileName: tile.name,
        tileType: tile.tileType,
        event: getTileEvent(tile.tileType),
      });
    } catch {
      toast.error("Failed to roll dice");
      setDiceAnimating(false);
    }
  }

  async function handleEndTurn() {
    try {
      const result = await endTurn.mutateAsync({
        roomCode: session.roomCode,
        playerId: session.playerId,
      });
      if (result.__kind__ === "err") {
        toast.error(result.err);
      }
    } catch {
      toast.error("Failed to end turn");
    }
  }

  const sortedPlayers = [...players].sort(
    (a, b) => Number(b.capital) - Number(a.capital),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-black text-lg gold-text">
            BOARD GAME
          </h1>
          <Badge
            variant="outline"
            className="font-mono border-border text-muted-foreground"
          >
            {session.roomCode}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            Round{" "}
            <span className="gold-text font-bold">
              {Number(gameState?.round ?? 1)}
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
            data-ocid="game.leave_button"
          >
            <LogOut className="w-4 h-4 mr-1" /> Leave
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        {/* Main Board */}
        <main className="flex-1 p-3 md:p-6 flex flex-col items-center justify-center min-h-0">
          <div
            className="w-full"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              gap: "4px",
              aspectRatio: `${COLS}/${ROWS}`,
              maxWidth: "800px",
              maxHeight: "600px",
            }}
          >
            {/* Center area */}
            <div
              style={{
                gridColumn: "2 / span 6",
                gridRow: "2 / span 4",
                background: "oklch(var(--card) / 0.5)",
                border: "1px solid oklch(var(--border))",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px",
                gap: "8px",
              }}
            >
              <h2 className="font-display font-black text-xl md:text-2xl gold-text text-center">
                BUSINESS STRATEGY
              </h2>
              <p className="text-muted-foreground text-xs text-center">
                Multiplayer Board Game
              </p>
              <div className="w-16 h-px bg-primary/50 my-1" />
              {currentPlayer && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Current Turn
                  </p>
                  <p
                    className="font-display font-bold text-sm md:text-base"
                    style={{
                      color:
                        PLAYER_COLORS[
                          players.indexOf(currentPlayer) % PLAYER_COLORS.length
                        ],
                    }}
                  >
                    {currentPlayer.name}
                  </p>
                </div>
              )}
            </div>

            {/* Tiles */}
            {TILES.map((tile) => {
              const [col, row] = positions[tile.id];
              const playersHere = getPlayersOnTile(tile.id);
              const isCurrentPlayerHere = playersHere.some(
                (p) => p.id === session.playerId,
              );

              return (
                <motion.div
                  key={tile.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: tile.id * 0.01 }}
                  style={{
                    gridColumn: col + 1,
                    gridRow: row + 1,
                  }}
                  className={`relative border rounded-sm flex flex-col items-center justify-center p-0.5 shadow-tile overflow-hidden ${getTileClass(tile.tileType)} ${isCurrentPlayerHere ? "current-turn-highlight" : ""}`}
                >
                  <span
                    className="text-center leading-tight"
                    style={{
                      fontSize: "clamp(5px, 0.8vw, 10px)",
                      fontWeight: 600,
                    }}
                  >
                    {tile.name}
                  </span>
                  {playersHere.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                      {playersHere.map((p) => {
                        const pi = players.indexOf(p);
                        return (
                          <div
                            key={p.id}
                            className="rounded-full border border-white/50 flex items-center justify-center text-white font-bold"
                            style={{
                              width: "clamp(8px, 1.2vw, 16px)",
                              height: "clamp(8px, 1.2vw, 16px)",
                              fontSize: "clamp(4px, 0.6vw, 8px)",
                              background:
                                PLAYER_COLORS[pi % PLAYER_COLORS.length],
                            }}
                          >
                            {p.name.charAt(0)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Dice Panel */}
          <div className="mt-4 flex items-center gap-3">
            <Button
              data-ocid="game.roll_button"
              onClick={handleRoll}
              disabled={!isMyTurn || hasRolled || rollDice.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 h-10 disabled:opacity-40"
            >
              {rollDice.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Dice5
                  className={`w-4 h-4 mr-2 ${diceAnimating ? "animate-dice" : ""}`}
                />
              )}
              Roll Dice
            </Button>
            <Button
              data-ocid="game.end_turn_button"
              onClick={handleEndTurn}
              disabled={!isMyTurn || !hasRolled || endTurn.isPending}
              variant="secondary"
              className="font-bold px-6 h-10 disabled:opacity-40"
            >
              {endTurn.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              End Turn
            </Button>
            {!isMyTurn && (
              <span className="text-sm text-muted-foreground">
                Waiting for{" "}
                <span
                  className="font-semibold"
                  style={{
                    color: currentPlayer
                      ? PLAYER_COLORS[
                          players.indexOf(currentPlayer) % PLAYER_COLORS.length
                        ]
                      : undefined,
                  }}
                >
                  {currentPlayer?.name ?? "..."}
                </span>
              </span>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card/50 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Leaderboard */}
              <Card className="border border-border bg-card shadow-game">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 gold-text" /> Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {sortedPlayers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No players yet
                    </p>
                  ) : (
                    sortedPlayers.map((p, i) => (
                      <div
                        key={p.id}
                        data-ocid={`leaderboard.item.${i + 1}`}
                        className={`flex items-center gap-2 p-1.5 rounded-md ${
                          p.id === session.playerId
                            ? "bg-primary/10 border border-primary/20"
                            : ""
                        }`}
                      >
                        <span className="text-xs font-bold w-4 text-muted-foreground">
                          {i + 1}
                        </span>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{
                            background:
                              PLAYER_COLORS[
                                players.indexOf(p) % PLAYER_COLORS.length
                              ],
                          }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium flex-1 truncate">
                          {p.name}
                        </span>
                        <span className="text-xs font-bold gold-text">
                          ${Number(p.capital)}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* My Stats */}
              {myPlayer && (
                <Card className="border border-primary/30 bg-card shadow-game">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 gold-text" /> Your Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 rounded-md p-2">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Capital
                      </p>
                      <p className="font-bold text-sm gold-text">
                        ${Number(myPlayer.capital)}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Reputation
                      </p>
                      <p className="font-bold text-sm text-foreground">
                        {Number(myPlayer.reputation)}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Innovation
                      </p>
                      <p className="font-bold text-sm text-foreground">
                        {Number(myPlayer.innovation)}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Capacity
                      </p>
                      <p className="font-bold text-sm text-foreground">
                        {Number(myPlayer.capacity)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Round info */}
              <div className="text-center text-xs text-muted-foreground">
                Round{" "}
                <span className="gold-text font-bold">
                  {Number(gameState?.round ?? 1)}
                </span>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {eventModal && (
          <Dialog open onOpenChange={() => setEventModal(null)}>
            <DialogContent
              data-ocid="event.dialog"
              className="bg-card border-2 border-primary/40 shadow-game max-w-sm"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center">
                  <span className="gold-text">
                    Rolled a {eventModal.diceValue}!
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4 py-2">
                <div
                  className={`inline-block px-4 py-2 rounded-lg border ${getTileClass(eventModal.tileType)}`}
                >
                  <p className="font-display font-bold text-lg">
                    {eventModal.tileName}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">
                  {eventModal.event}
                </p>
              </div>
              <DialogFooter>
                <Button
                  data-ocid="event.close_button"
                  onClick={() => setEventModal(null)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                >
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
