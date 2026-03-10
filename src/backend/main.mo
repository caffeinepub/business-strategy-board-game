import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Char "mo:core/Char";

actor {
  // Types
  type Player = {
    id : Text;
    name : Text;
    position : Nat;
    capital : Int;
    reputation : Int;
    innovation : Int;
    capacity : Int;
    hasRolled : Bool;
  };

  type TileType = {
    #start;
    #decision;
    #bonus;
    #penalty;
    #final;
  };

  module TileType {
    public func compare(type1 : TileType, type2 : TileType) : Order.Order {
      switch (type1, type2) {
        case (#start, #start) { #equal };
        case (#start, _) { #less };
        case (_, #start) { #greater };
        case (#decision, #decision) { #equal };
        case (#decision, _) { #less };
        case (_, #decision) { #greater };
        case (#bonus, #bonus) { #equal };
        case (#bonus, _) { #less };
        case (_, #bonus) { #greater };
        case (#penalty, #penalty) { #equal };
        case (#penalty, _) { #less };
        case (_, #penalty) { #greater };
        case (#final, #final) { #equal };
      };
    };
  };

  type Tile = {
    id : Nat;
    name : Text;
    tileType : TileType;
  };

  module Tile {
    public func compareByType(tile1 : Tile, tile2 : Tile) : Order.Order {
      switch (TileType.compare(tile1.tileType, tile2.tileType)) {
        case (#equal) { Nat.compare(tile1.id, tile2.id) };
	      case (order) { order };
      };
    };
  };

  type GameState = {
    roomCode : Text;
    hostId : Text;
    players : [Player];
    currentTurn : Nat;
    round : Nat;
    gameStarted : Bool;
    gameFinished : Bool;
  };

  type Result = {
    #ok : Text;
    #err : Text;
  };

  // Game Storage
  let games = Map.empty<Text, GameState>();

  // Static board data (array for deterministic order)
  let board = [
    { id = 0; name = "Start"; tileType = #start },
    { id = 1; name = "Market Boom"; tileType = #bonus },
    { id = 2; name = "Innovation Hub"; tileType = #decision },
    { id = 3; name = "Tax Penalty"; tileType = #penalty },
    { id = 4; name = "Business Expansion"; tileType = #bonus },
    { id = 5; name = "Employee Strike"; tileType = #penalty },
    { id = 6; name = "Legal Decision"; tileType = #decision },
    { id = 7; name = "Marketing Campaign"; tileType = #bonus },
    { id = 8; name = "Supply Chain Issue"; tileType = #penalty },
    { id = 9; name = "Tech Advancement"; tileType = #bonus },
    { id = 10; name = "Compliance Check"; tileType = #penalty },
    { id = 11; name = "Strategic Decision"; tileType = #decision },
    { id = 12; name = "Investor Bonus"; tileType = #bonus },
    { id = 13; name = "Regulatory Penalty"; tileType = #penalty },
    { id = 14; name = "Product Launch"; tileType = #bonus },
    { id = 15; name = "HR Challenge"; tileType = #penalty },
    { id = 16; name = "Environmental Decision"; tileType = #decision },
    { id = 17; name = "Global Expansion"; tileType = #bonus },
    { id = 18; name = "Market Downturn"; tileType = #penalty },
    { id = 19; name = "Brand Reputation"; tileType = #bonus },
    { id = 20; name = "Operational Risk"; tileType = #penalty },
    { id = 21; name = "Ethical Decision"; tileType = #decision },
    { id = 22; name = "Cost Reduction"; tileType = #bonus },
    { id = 23; name = "Vendor Penalty"; tileType = #penalty },
    { id = 24; name = "Customer Loyalty"; tileType = #bonus },
    { id = 25; name = "Financial Audit"; tileType = #penalty },
    { id = 26; name = "Final Decision"; tileType = #decision },
    { id = 27; name = "Game End"; tileType = #final },
  ];

  // Utility function to generate random room code
  func generateRoomCode() : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var code = "";
    var i = 0;
    while (i < 6) {
      let index = Int.abs(Time.now() + i) % chars.size();
      code #= chars.toArray()[index].toText();
      i += 1;
    };
    code;
  };

  // Core Functions
  public shared ({ caller }) func createGame(hostName : Text) : async Text {
    let roomCode = generateRoomCode();
    let hostId = "host-" # Time.now().toNat().toText();

    // Host player
    let hostPlayer = {
      id = hostId;
      name = hostName;
      position = 0;
      capital = 100;
      reputation = 10;
      innovation = 10;
      capacity = 10;
      hasRolled = false;
    };

    let initialState : GameState = {
      roomCode;
      hostId;
      players = [hostPlayer];
      currentTurn = 0;
      round = 1;
      gameStarted = false;
      gameFinished = false;
    };

    games.add(roomCode, initialState);
    roomCode;
  };

  public shared ({ caller }) func joinGame(roomCode : Text, playerName : Text) : async Result {
    switch (games.get(roomCode)) {
      case (null) { #err("Room not found") };
      case (?game) {
        if (game.gameStarted) { return #err("Game already started") };
        if (game.players.size() >= 12) { return #err("Room is full (max 12 players)") };

        let playerId = "player-" # Time.now().toNat().toText();
        let newPlayer = {
          id = playerId;
          name = playerName;
          position = 0;
          capital = 100;
          reputation = 10;
          innovation = 10;
          capacity = 10;
          hasRolled = false;
        };

        let updatedGame : GameState = {
          game with players = game.players.concat([newPlayer])
        };
        games.add(roomCode, updatedGame);
        #ok(playerId);
      };
    };
  };

  public shared ({ caller }) func startGame(roomCode : Text, playerId : Text) : async Result {
    switch (games.get(roomCode)) {
      case (null) { #err("Room not found") };
      case (?game) {
        if (playerId != game.hostId) { return #err("Only the host can start the game") };
        if (game.players.size() < 2) { return #err("Need at least 2 players to start") };
        if (game.gameStarted) { return #err("Game already started") };

        let updatedGame : GameState = {
          game with gameStarted = true
        };
        games.add(roomCode, updatedGame);
        #ok("Game started");
      };
    };
  };

  public query ({ caller }) func getGameState(roomCode : Text) : async ?GameState {
    games.get(roomCode);
  };

  public shared ({ caller }) func rollDice(roomCode : Text, playerId : Text) : async Result {
    switch (games.get(roomCode)) {
      case (null) { #err("Room not found") };
      case (?game) {
        if (game.gameFinished) { return #err("Game has ended") };
        if (not game.gameStarted) { return #err("Game not started") };

        let currentPlayer = game.players[game.currentTurn];
        if (currentPlayer.id != playerId) { return #err("Not your turn") };
        if (currentPlayer.hasRolled) { return #err("You have already rolled") };

        // Simulate dice roll using current time (1-6 range)
        let diceValue = Int.abs(Time.now()) % 6 + 1;

        // Move player
        var newPosition = (currentPlayer.position + Int.abs(diceValue)) % 28;
        var newCapital = currentPlayer.capital;
        var newReputation = currentPlayer.reputation;
        var gameFinished = false;

        // Check if player passed start
        if (newPosition < currentPlayer.position) {
          newCapital += 10;
        };

        // Tile effects
        switch (board[newPosition].tileType) {
          case (#bonus) { newCapital += 10 };
          case (#penalty) { newCapital -= 10 };
          case (#decision) { newReputation += 5 };
          case (#final) { gameFinished := true };
          case (#start) {};
        };

        if (game.currentTurn < game.players.size()) {
          let updatedPlayers = Array.tabulate(
            game.players.size(),
            func(i) {
              if (i == game.currentTurn) {
                {
                  currentPlayer with
                  position = newPosition;
                  capital = newCapital;
                  reputation = newReputation;
                  hasRolled = true;
                };
              } else {
                game.players[i];
              };
            },
          );

          let updatedGame : GameState = {
            game with
            players = updatedPlayers;
            gameFinished;
          };
          games.add(roomCode, updatedGame);
        };
        // Return "diceValue:newPosition" so frontend can parse both
        #ok(diceValue.toText() # ":" # newPosition.toText());
      };
    };
  };

  public shared ({ caller }) func endTurn(roomCode : Text, playerId : Text) : async Result {
    switch (games.get(roomCode)) {
      case (null) { #err("Room not found") };
      case (?game) {
        if (game.gameFinished) { return #err("Game has ended") };
        if (not game.gameStarted) { return #err("Game not started") };

        let currentPlayer = game.players[game.currentTurn];
        if (currentPlayer.id != playerId) { return #err("Not your turn") };
        if (not currentPlayer.hasRolled) { return #err("You must roll the dice first") };

        var nextTurn = (game.currentTurn + 1) % game.players.size();
        var newRound = game.round;
        if (nextTurn == 0) { newRound += 1 };

        // Reset all players' hasRolled to false
        let resetPlayers = game.players.map(
          func(player) {
            { player with hasRolled = false };
          }
        );

        let updatedGame : GameState = {
          game with
          players = resetPlayers;
          currentTurn = nextTurn;
          round = newRound;
        };
        games.add(roomCode, updatedGame);
        #ok("Turn ended");
      };
    };
  };

  public query ({ caller }) func getTile(position : Nat) : async ?Tile {
    if (position >= 0 and position < 28) {
      ?board[position];
    } else {
      null;
    };
  };
};
