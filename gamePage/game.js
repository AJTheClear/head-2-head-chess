const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
let selected = null;
let currentPlayer = 'w';
let lastMove = null;
let playerRole = null;
let lastShownMoveIndex = -1;
let castlingRights = {
  w: { kingMoved: false, rookAMoved: false, rookHMoved: false },
  b: { kingMoved: false, rookAMoved: false, rookHMoved: false }
};

// Initialize socket connection
const socket = io();

// Get gameId from URL and store it globally
window.gameId = window.location.pathname.split("/")[1];
const isSpectator = new URLSearchParams(window.location.search).get('spectate') === 'true';

socket.emit('joinGame', { gameId: window.gameId, isSpectator });

function getLegalMovesRaw(pos, state = window.currentGameState.board, skipKingCheck = false) {
  const piece = state[pos];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const [file, rank] = [pos[0], parseInt(pos[1])];
  const fileIdx = files.indexOf(file);

  const isEmpty = p => !state[p];
  const isEnemy = p => state[p] && state[p][0] !== color;

  const directions = {
    p: color === 'w' ? 1 : -1,
    r: [[1,0],[0,1],[-1,0],[0,-1]],
    b: [[1,1],[1,-1],[-1,1],[-1,-1]],
    q: [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],
    k: [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],
    n: [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]]
  };

  if (type === 'p') {
    const fwd = rank + directions.p;
    const oneAhead = file + fwd;
    if (isEmpty(oneAhead)) moves.push(oneAhead);
    if ((color === 'w' && rank === 2) || (color === 'b' && rank === 7)) {
      const twoAhead = file + (rank + 2 * directions.p);
      if (isEmpty(oneAhead) && isEmpty(twoAhead)) moves.push(twoAhead);
    }
    for (let dx of [-1,1]) {
      const df = files[fileIdx + dx];
      const diag = df + fwd;
      if (df && isEnemy(diag)) moves.push(diag);
    }
  }

  if (['r','b','q'].includes(type)) {
    const dirs = directions[type];
    for (let [dx,dy] of dirs) {
      for (let i = 1; i < 8; i++) {
        const nf = files[fileIdx + dx*i];
        const nr = rank + dy*i;
        const np = nf + nr;
        if (!nf || nr < 1 || nr > 8) break;
        if (isEmpty(np)) moves.push(np);
        else {
          if (isEnemy(np)) moves.push(np);
          break;
        }
      }
    }
  }

  if (type === 'k') {
    for (let [dx,dy] of directions.k) {
      const nf = files[fileIdx + dx];
      const nr = rank + dy;
      const np = nf + nr;
      if (nf && nr >= 1 && nr <= 8 && (!state[np] || isEnemy(np))) {
        moves.push(np);
      }
    }
  }

  if (type === 'n') {
    for (let [dx, dy] of directions.n) {
      const nf = files[fileIdx + dx];
      const nr = rank + dy;
      const np = nf + nr;
      if (nf && nr >= 1 && nr <= 8 && (!state[np] || isEnemy(np))) {
        moves.push(np);
      }
    }
  }

  return moves;
}

function getLegalMoves(pos) {
  const piece = window.currentGameState.board[pos];
  if (!piece) return [];

  const color = piece[0];
  const rawMoves = getLegalMovesRaw(pos);
  const legalMoves = [];

  for (let move of rawMoves) {
    const temp = { ...window.currentGameState.board };
    temp[move] = temp[pos];
    delete temp[pos];
    if (!isKingInCheck(color, temp)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

function isSquareAttacked(square, color, state) {
  const enemyColor = color === 'w' ? 'b' : 'w';
  for (let pos in state) {
    const piece = state[pos];
    if (piece && piece[0] === enemyColor) {
      const moves = getLegalMovesRaw(pos, state, true);
      if (moves.includes(square)) return true;
    }
  }
  return false;
}

function isKingInCheck(color, state = window.currentGameState.board) {
  const kingPos = Object.keys(state).find(pos => state[pos] === color + 'k');
  if (!kingPos) return false;
  return isSquareAttacked(kingPos, color, state);
}

function isMoveLegal(from, to) {
  const legalMoves = getLegalMoves(from);
  return legalMoves.includes(to);
}

function createBoard() {
  const board = document.getElementById("gameBoard");
  if (!board) {
    console.error("Game board element not found!");
    return;
  }
  
  board.innerHTML = '';
  for (let r of ranks) {
    const row = document.createElement("tr");
    for (let f of files) {
      const square = document.createElement("td");
      const pos = f + r;
      square.classList.add((files.indexOf(f) + ranks.indexOf(r)) % 2 === 0 ? "white" : "black");
      square.id = pos;
      square.dataset.row = ranks.indexOf(r);
      square.dataset.col = files.indexOf(f);

      square.addEventListener("click", () => handleSelect(pos));
      row.appendChild(square);
    }
    board.appendChild(row);
  }
}

function updateBoard(gameState) {
  if (!gameState || !gameState.board) return;
  
  // Clear all squares first
  for (let rank of ranks) {
    for (let file of files) {
      const pos = file + rank;
      const square = document.getElementById(pos);
      if (square) {
        square.innerHTML = '';
      }
    }
  }
  
  // Then add pieces
  for (let pos in gameState.board) {
    const square = document.getElementById(pos);
    if (square) {
      const piece = gameState.board[pos];
      if (piece) {
        const img = document.createElement("img");
        img.src = `/img/${piece}.png`;
        img.draggable = false;
        img.dataset.pos = pos;
        square.appendChild(img);
      }
    }
  }

  if (lastMove) {
    const { from, to } = lastMove;
    const fromSquare = document.getElementById(from);
    const toSquare = document.getElementById(to);
    if (fromSquare) fromSquare.classList.add("highlightLast");
    if (toSquare) toSquare.classList.add("highlightLast");
  }
}

function handleSelect(pos) {
  if (playerRole === "spectator") return;

  const gameState = window.currentGameState;
  if (!gameState || !gameState.board) return;

  const piece = gameState.board[pos];
  const pieceColor = piece?.[0];

  if (selected && selected !== pos && isMoveLegal(selected, pos)) {
    const from = selected;
    const to = pos;
    
    socket.emit('makeMove', { 
      gameId: window.gameId,
      from,
      to
    });
    
    selected = null;
    clearHighlights();
  } else if (piece && pieceColor === currentPlayer) {
    selected = pos;
    clearHighlights();
    const legalMoves = getLegalMoves(pos);
    legalMoves.forEach(move => {
      const square = document.getElementById(move);
      if (square) square.classList.add("highlight");
    });
  } else {
    selected = null;
    clearHighlights();
  }
}

function highlightMoves(pos) {
  const square = document.getElementById(pos);
  if (square) square.classList.add("highlight");
}

function clearHighlights() {
  document.querySelectorAll("td").forEach(sq => {
    sq.classList.remove("highlight", "highlightLast", "selected");
  });
}

function playSound() {
  const sound = document.getElementById("moveSound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.error("Error playing sound:", error);
    });
  } else {
    console.error("Sound element not found!");
  }
}

function isCheckmate(color) {
  if (!isKingInCheck(color)) return false;
  for (let from in window.currentGameState.board) {
    const piece = window.currentGameState.board[from];
    if (piece && piece[0] === color) {
      const legalMoves = getLegalMoves(from);
      if (legalMoves.length > 0) return false;
    }
  }
  return true;
}

function isStalemate(color) {
  if (isKingInCheck(color)) return false;
  for (let from in window.currentGameState.board) {
    if (window.currentGameState.board[from][0] === color) {
      if (getLegalMoves(from).length > 0) return false;
    }
  }
  return true;
}

function isInsufficientMaterial() {
  const pieces = Object.values(window.currentGameState.board).map(p => p[1]);
  const minorPieces = pieces.filter(p => ['n', 'b'].includes(p));
  if (pieces.every(p => p === 'k')) return true;
  if (pieces.length === 3 && minorPieces.length === 1) return true;
  return false;
}

// Socket event handlers
socket.on('gameStateUpdate', (gameState) => {
  window.currentGameState = gameState;
  const messageBox = document.getElementById("messageBox");
  
  if (gameState.status !== "playing" && gameState.status !== "waiting") {
    messageBox.value += `Game state: ${gameState.status}\n`;
    return;
  }
  
  // Set player role if not set
  if (!playerRole) {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player) {
      playerRole = player.role;
      if (playerRole === "spectator") {
        messageBox.value += `You are watching the game as a spectator\n`;
      } else {
        messageBox.value += `You are playing as: ${playerRole}\n`;
      }
    }
  }

  // Show moves for spectators
  if (gameState.moves.length > lastShownMoveIndex + 1) {
    for (let i = lastShownMoveIndex + 1; i < gameState.moves.length; i++) {
      messageBox.value += gameState.moves[i] + "\n";
    }
    lastShownMoveIndex = gameState.moves.length - 1;
  }

  updateBoard(gameState);
  currentPlayer = gameState.turn === 'white' ? 'w' : 'b';

  // Check for game end conditions
  const lastPlayer = currentPlayer === 'w' ? 'b' : 'w';
  
  if (isCheckmate(currentPlayer)) {
    messageBox.value += `Checkmate! ${lastPlayer === 'w' ? "White" : "Black"} wins!\n`;
    socket.emit('gameEnded', { 
      gameId: window.gameId, 
      reason: 'checkmate', 
      winner: lastPlayer 
    });
  } else if (isStalemate(currentPlayer)) {
    messageBox.value += "Stalemate! It's a draw.\n";
    socket.emit('gameEnded', { gameId: window.gameId, reason: 'stalemate' });
  } else if (isInsufficientMaterial()) {
    messageBox.value += "Draw due to insufficient material.\n";
    socket.emit('gameEnded', { gameId: window.gameId, reason: 'insufficient_material' });
  } else if (isKingInCheck(currentPlayer)) {
    messageBox.value += "Check!\n";
  }
});

socket.on('gameStarted', ({ whitePlayer, blackPlayer }) => {
  const messageBox = document.getElementById("messageBox");
  messageBox.value += "Game started!\n";
  currentPlayer = socket.id === whitePlayer ? 'w' : 'b';
});

socket.on('error', (error) => {
  const messageBox = document.getElementById("messageBox");
  messageBox.value += `Error: ${error.message}\n`;
});

socket.on('gameEnded', (data) => {
  const messageBox = document.getElementById("messageBox");
  messageBox.value += `Game ended: ${data.reason}\n`;
  setTimeout(() => {
    window.location.href = '/';
  }, 8000);
});

// Initialize the board when the page loads
document.addEventListener('DOMContentLoaded', () => {
  createBoard();
});
