import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameState } from "../backend.d";
import { useActor } from "./useActor";

export function useGameState(roomCode: string | null, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery<GameState | null>({
    queryKey: ["gameState", roomCode],
    queryFn: async () => {
      if (!actor || !roomCode) return null;
      return actor.getGameState(roomCode);
    },
    enabled: !!actor && !isFetching && !!roomCode && enabled,
    refetchInterval: 1000,
    staleTime: 800,
  });
}

export function useCreateGame() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (hostName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGame(hostName);
    },
  });
}

export function useJoinGame() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      roomCode,
      playerName,
    }: { roomCode: string; playerName: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.joinGame(roomCode, playerName);
    },
  });
}

export function useStartGame() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roomCode,
      playerId,
    }: { roomCode: string; playerId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.startGame(roomCode, playerId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["gameState", vars.roomCode] });
    },
  });
}

export function useRollDice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roomCode,
      playerId,
    }: { roomCode: string; playerId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rollDice(roomCode, playerId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["gameState", vars.roomCode] });
    },
  });
}

export function useEndTurn() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roomCode,
      playerId,
    }: { roomCode: string; playerId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.endTurn(roomCode, playerId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["gameState", vars.roomCode] });
    },
  });
}

export function useGetTile() {
  const { actor } = useActor();
  return {
    getTile: async (position: bigint) => {
      if (!actor) return null;
      return actor.getTile(position);
    },
  };
}
