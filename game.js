export class Game {
    constructor(id) {
      this.id = id;
      this.players = []; // { id, socket, role }
      this.moves = [];
      this.turn = "white";
      this.status = "waiting"; // waiting, playing, finished
      
      this.board = Array(8).fill(null).map((_, i) => {
        return Array(8).fill(null).map((_, j) => {
          if (i < 2) return 'red';
          if (i >= 6) return 'blue';
          return 'white';
        });
      });
    }
  
    addPlayer(socket, forcedRole = null) {
      if (forcedRole === "spectator") {
        this.players.push({ id: socket.id, socket, role: "spectator" });
        return "spectator";
      }

      // counting how many players we have so far (without the one currently joining)
      const realPlayersCount = this.players.filter(p => p.role !== "spectator").length;
      
      // needed in case someone wants to join as a player but there are already two players
      if (realPlayersCount >= 2) {
        this.players.push({ id: socket.id, socket, role: "spectator" });
        return "spectator";
      }
  
      const role = realPlayersCount === 0 ? "white" : "black";
      this.players.push({ id: socket.id, socket, role });
  
      if (realPlayersCount + 1 === 2) {
        this.status = "playing";
      }
  
      return role;
    }
  
    removePlayer(socketId) {
      const playerIndex = this.players.findIndex(p => p.id === socketId);
      if (playerIndex === -1) return false;

      const player = this.players[playerIndex];
      this.players.splice(playerIndex, 1);

      if (player.role !== "spectator") {
        this.status = "finished";
      }

      return true;
    }
  
    getPlayerRole(socketId) {
      const player = this.players.find(p => p.id === socketId);
      return player?.role || null;
    }
  
    isPlayersTurn(socketId) {
      if (this.status !== "playing") return false;
      
      const role = this.getPlayerRole(socketId);
      return role === this.turn;
    }
  
    makeMove(socketId, move) {
      if (!this.isPlayersTurn(socketId)) return false;
  
      const role = this.getPlayerRole(socketId);
      const moveText = `${role} player moved from (${move.from.row},${move.from.col}) to (${move.to.row},${move.to.col})`;
      this.moves.push(moveText);
      
      const fromCell = this.board[move.from.row][move.from.col];
      this.board[move.from.row][move.from.col] = 'white';
      this.board[move.to.row][move.to.col] = fromCell;
      
      this.turn = this.turn === "white" ? "black" : "white";
      return true;
    }

    getGameState() {
      return {
        id: this.id,
        status: this.status,
        turn: this.turn,
        players: this.players.map(p => ({ id: p.id, role: p.role })),
        moves: this.moves,
        board: this.board
      };
    }
}
  