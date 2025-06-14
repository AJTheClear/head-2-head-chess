// represents a game of chess between two players or spectators
export class Game {
    constructor(id) {
      this.id = id;
      this.players = []; // { id, socket, role }
      this.moves = [];
      this.turn = "white";
      this.status = "waiting"; // waiting, playing, finished
      this.winner = null;
      this.endReason = null;
      this.blackPlayerID = null;
      this.whitePlayerID = null;
      
      // initialize chess board with pieces
      this.board = { // no need to write every single tile => by default they are undifined, later we can change them
        a1: 'wr', b1: 'wn', c1: 'wb', d1: 'wq', e1: 'wk', f1: 'wb', g1: 'wn', h1: 'wr',
        a2: 'wp', b2: 'wp', c2: 'wp', d2: 'wp', e2: 'wp', f2: 'wp', g2: 'wp', h2: 'wp',
        a7: 'bp', b7: 'bp', c7: 'bp', d7: 'bp', e7: 'bp', f7: 'bp', g7: 'bp', h7: 'bp',
        a8: 'br', b8: 'bn', c8: 'bb', d8: 'bq', e8: 'bk', f8: 'bb', g8: 'bn', h8: 'br',
      };

      this.castlingRights = { // map of maps (key-value)
        w: { kingMoved: false, rookAMoved: false, rookHMoved: false },
        b: { kingMoved: false, rookAMoved: false, rookHMoved: false }
      };
    }
  
    addPlayer(socket, forcedRole = null, userID) {
      if (forcedRole === "spectator") {
        this.players.push({ id: socket.id, socket, role: "spectator" });
        return "spectator";
      }

      // count current active (non-spectator) players  
      const realPlayersCount = this.players.filter(p => p.role !== "spectator").length;

      // if already 2 players, assign as spectator
      if (realPlayersCount >= 2) {
        this.players.push({ id: socket.id, socket, role: "spectator" });
        return "spectator";
      }
  
      const role = realPlayersCount === 0 ? "white" : "black"; // first add white then black
      this.players.push({ id: socket.id, socket, role });
      if (role === "white") {
        this.whitePlayerID = userID;
        console.log(this.whitePlayerID);
      } else if (role === "black") {
        this.blackPlayerID = userID;
        console.log(this.blackPlayerID);
      }

      if (realPlayersCount + 1 === 2) { // starts game
        this.status = "playing";
      }
  
      return role;
    }
  
    removePlayer(socketId) {
      const playerIndex = this.players.findIndex(p => p.id === socketId);
      if (playerIndex === -1) return false;

      const player = this.players[playerIndex];
      this.players.splice(playerIndex, 1);
      // if a player leaves the game finishes
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
      const { from, to } = move;
      const movingPiece = this.board[from];
      
      if (!movingPiece) return false;
      
      const pieceColor = movingPiece[0];
      const pieceType = movingPiece[1];
      
      // handle castling
      if (pieceType === 'k') { // king moves
        this.castlingRights[pieceColor].kingMoved = true; // if king moves castling is no longer available
        if (from === 'e1' && to === 'g1') { // white king side castling
          this.board['f1'] = this.board['h1'];  // moves the rook
          delete this.board['h1']; // removes the old rook
        }
        if (from === 'e1' && to === 'c1') { // white queen side castling
          this.board['d1'] = this.board['a1']; // moves the rook
          delete this.board['a1']; // removes the old rook
        }
        if (from === 'e8' && to === 'g8') { // black king side castling
          this.board['f8'] = this.board['h8'];
          delete this.board['h8'];
        }
        if (from === 'e8' && to === 'c8') { // black queen side castling
          this.board['d8'] = this.board['a8'];
          delete this.board['a8'];
        }
      }

      if (pieceType === 'r') { // if rook moves castling is no logner available
        if (from === 'a1') this.castlingRights['w'].rookAMoved = true;
        if (from === 'h1') this.castlingRights['w'].rookHMoved = true;
        if (from === 'a8') this.castlingRights['b'].rookAMoved = true;
        if (from === 'h8') this.castlingRights['b'].rookHMoved = true;
      }

      // pawn promotion
      if (pieceType === 'p' && (to[1] === '8' || to[1] === '1')) {
        this.board[to] = pieceColor + 'q'; // Default to queen
      } else {
        this.board[to] = movingPiece; // move the piece to new place
      }

      delete this.board[from]; // remove the piece from old place
      
      const moveText = `${role} player moved from ${from} to ${to}`;
      this.moves.push(moveText);
      
      this.turn = this.turn === "white" ? "black" : "white"; // change turn
      return true;
    }
    
    // returns info of the current game state
    getGameState() {
      return {
        id: this.id,
        status: this.status,
        turn: this.turn,
        players: this.players.map(p => ({ id: p.id, role: p.role })),
        moves: this.moves,
        board: this.board,
        winner: this.winner,
        endReason: this.endReason,
        blackPlayerID: this.blackPlayerID,
        whitePlayerID: this.whitePlayerID,
      };
    }
}
  
