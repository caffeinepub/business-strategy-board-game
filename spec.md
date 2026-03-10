# Business Strategy Board Game

## Current State
Blank project — only the base UI library and scaffold are present. No backend or frontend app code exists.

## Requested Changes (Diff)

### Add
- Motoko backend canister implementing full multiplayer game engine
- Lobby screen: create game (host) and join game (player) by room code
- Game board with 28 tiles arranged in a loop
- Turn-based gameplay: dice roll, player movement, tile events
- Player stats: capital, reputation, innovation, capacity
- Leaderboard sidebar
- Polling every 1 second to sync state across browsers
- Host-only controls: start game button
- End game screen showing winner

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Motoko canister: GameState type, Player type, Board (28 tiles), createGame, joinGame, startGame, rollDice, endTurn, getGameState
2. React frontend: Lobby (CreateGame + JoinGame), GameBoard (28 tiles in loop), PlayerTokens, DicePanel, EventModal, Sidebar (Leaderboard + PlayerStats), EndGame screen
3. Polling via setInterval every 1000ms to fetch getGameState
4. Host player sees Start Game button; non-host players wait
5. Passing start tile awards +10 capital
6. Game ends when any player reaches or passes tile 27 (0-indexed)
