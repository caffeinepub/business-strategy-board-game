import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: string;
    hasRolled: boolean;
    name: string;
    reputation: bigint;
    innovation: bigint;
    capital: bigint;
    capacity: bigint;
    position: bigint;
}
export type Result = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface Tile {
    id: bigint;
    name: string;
    tileType: TileType;
}
export interface GameState {
    gameStarted: boolean;
    currentTurn: bigint;
    players: Array<Player>;
    hostId: string;
    gameFinished: boolean;
    roomCode: string;
    round: bigint;
}
export enum TileType {
    final_ = "final",
    decision = "decision",
    penalty = "penalty",
    start = "start",
    bonus = "bonus"
}
export interface backendInterface {
    createGame(hostName: string): Promise<string>;
    endTurn(roomCode: string, playerId: string): Promise<Result>;
    getGameState(roomCode: string): Promise<GameState | null>;
    getTile(position: bigint): Promise<Tile | null>;
    joinGame(roomCode: string, playerName: string): Promise<Result>;
    rollDice(roomCode: string, playerId: string): Promise<Result>;
    startGame(roomCode: string, playerId: string): Promise<Result>;
}
