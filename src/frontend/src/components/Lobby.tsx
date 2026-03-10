import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, ChevronRight, Loader2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SessionData } from "../App";
import { useCreateGame, useJoinGame } from "../hooks/useQueries";

interface Props {
  onSession: (data: SessionData) => void;
}

type View = "choose" | "create" | "join";

export default function Lobby({ onSession }: Props) {
  const [view, setView] = useState<View>("choose");
  const [hostName, setHostName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const createGame = useCreateGame();
  const joinGame = useJoinGame();

  async function handleCreate() {
    if (!hostName.trim()) {
      toast.error("Enter your name");
      return;
    }
    try {
      const code = await createGame.mutateAsync(hostName.trim());
      onSession({
        roomCode: code,
        playerId: "host",
        playerName: hostName.trim(),
        isHost: true,
      });
    } catch {
      toast.error("Failed to create game");
    }
  }

  async function handleJoin() {
    if (!roomCode.trim() || !playerName.trim()) {
      toast.error("Enter both room code and your name");
      return;
    }
    try {
      const result = await joinGame.mutateAsync({
        roomCode: roomCode.trim().toUpperCase(),
        playerName: playerName.trim(),
      });
      if (result.__kind__ === "err") {
        toast.error(result.err);
        return;
      }
      onSession({
        roomCode: roomCode.trim().toUpperCase(),
        playerId: result.ok,
        playerName: playerName.trim(),
        isHost: false,
      });
    } catch {
      toast.error("Failed to join game");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 relative z-10"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1 mb-4">
          <Briefcase className="w-4 h-4 gold-text" />
          <span className="text-xs font-medium gold-text tracking-widest uppercase">
            Business Strategy
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight mb-2">
          <span className="gold-text">BOARD</span>
          <span className="text-foreground"> GAME</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Multiplayer business simulation
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg relative z-10"
          >
            <Card
              className="cursor-pointer border-2 border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all duration-200 group shadow-game"
              onClick={() => setView("create")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="w-7 h-7 gold-text" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Create Game
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start a new room as host
                  </p>
                </div>
                <Button
                  data-ocid="lobby.create_button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  onClick={() => setView("create")}
                >
                  Host Game <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-2 border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all duration-200 group shadow-game"
              onClick={() => setView("join")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-7 h-7 gold-text" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Join Game
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a room code to join
                  </p>
                </div>
                <Button
                  data-ocid="lobby.join_button"
                  variant="secondary"
                  className="w-full font-semibold"
                  onClick={() => setView("join")}
                >
                  Join Room <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {view === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm relative z-10"
          >
            <Card className="border-2 border-primary/30 bg-card shadow-game">
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  Create Game
                </CardTitle>
                <CardDescription>
                  Enter your name to become the host
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="host-name">Your Name</Label>
                  <Input
                    id="host-name"
                    data-ocid="create.name_input"
                    placeholder="e.g. Alex Chen"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setView("choose")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    data-ocid="create.submit_button"
                    onClick={handleCreate}
                    disabled={createGame.isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {createGame.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create Room"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {view === "join" && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm relative z-10"
          >
            <Card className="border-2 border-primary/30 bg-card shadow-game">
              <CardHeader>
                <CardTitle className="font-display text-xl">
                  Join Game
                </CardTitle>
                <CardDescription>
                  Enter the room code shared by the host
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input
                    id="room-code"
                    data-ocid="join.code_input"
                    placeholder="e.g. A7X2KP"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-input border-border text-foreground font-mono text-lg tracking-widest uppercase placeholder:text-muted-foreground placeholder:font-normal placeholder:tracking-normal"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player-name">Your Name</Label>
                  <Input
                    id="player-name"
                    data-ocid="join.name_input"
                    placeholder="e.g. Sam Rivera"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setView("choose")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    data-ocid="join.submit_button"
                    onClick={handleJoin}
                    disabled={joinGame.isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {joinGame.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Join Game"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gold-text hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
