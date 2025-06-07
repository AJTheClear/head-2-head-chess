const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; // cols
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]; // rows
let selected = null; // null means no/empty value
let currentPlayer = 'w'; // white
let lastMove = null; 
let playerRole = null;
let lastShownMoveIndex = -1;
let castlingRights = { // map of maps (key-value)
  w: { kingMoved: false, rookAMoved: false, rookHMoved: false },
  b: { kingMoved: false, rookAMoved: false, rookHMoved: false }
};

// initialize socket connection
const socket = io();

// get gameId from URL and store it globally
window.gameId = window.location.pathname.split("/")[1];
const gameIdDisplay = document.getElementById('gameIdDisplay');

gameIdDisplay.textContent = window.gameId;

// get the current user from session storage, if available
const user = JSON.parse(sessionStorage.getItem('currentUser'));
const userId = user ? user.id : null;

// check for spectetor
const isSpectator = new URLSearchParams(window.location.search).get('spectate') === 'true';

socket.emit('joinGame', {
    gameId: window.gameId,
    isSpectator: isSpectator,
    userId: userId
});

const moveSound = document.getElementById('moveSound'); // connection to the HTML

function getLegalMovesRaw(pos, state = window.currentGameState.board, skipKingCheck = false) {
  const piece = state[pos];
  if (!piece) return []; // if no piece => empty list === no valid moves
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const [file, rank] = [pos[0], parseInt(pos[1])]; // parse string to int
  const fileIdx = files.indexOf(file); // get the index of the letter

  const isEmpty = p => !state[p]; // arrow function that checks for empty square p
  const isEnemy = p => state[p] && state[p][0] !== color;  // arrow function that checks for enemy pieces in the square p

  const directions = {  // moving patterns
    p: color === 'w' ? 1 : -1,
    r: [[1,0],[0,1],[-1,0],[0,-1]],
    b: [[1,1],[1,-1],[-1,1],[-1,-1]],
    q: [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],
    k: [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],
    n: [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]]
  };

  if (type === 'p') {  // pawn
    const fwd = rank + directions.p; // get where to go +-1
    const oneAhead = file + fwd; // set where to go
    if (isEmpty(oneAhead)) moves.push(oneAhead); // check for empty square and add the move to the list of legal moves
    if ((color === 'w' && rank === 2) || (color === 'b' && rank === 7)) { // handle two tile move
      const twoAhead = file + (rank + 2 * directions.p);
      if (isEmpty(oneAhead) && isEmpty(twoAhead)) moves.push(twoAhead);
    }
    for (let dx of [-1,1]) { // attack enemy
      const df = files[fileIdx + dx]; // to check if it is in board
      const diag = df + fwd; // find diagonal
      if (df && isEnemy(diag)) moves.push(diag); // capture
    }
  }

  if (['r','b','q'].includes(type)) { // check if type is on of rook, bishop, queen
    const dirs = directions[type];
    for (let [dx,dy] of dirs) {
      for (let i = 1; i < 8; i++) {
        const nf = files[fileIdx + dx*i]; // move left or right
        const nr = rank + dy*i; // move up or down
        const np = nf + nr; // new position
        if (!nf || nr < 1 || nr > 8) break; // invalid move
        if (isEmpty(np)) moves.push(np); // add the move to the list of legal moves if the square is empty
        else {
          if (isEnemy(np)) moves.push(np); // add the move to the list of legal moves if capture
          break;
        }
      }
    }
  }

  if (type === 'k') { // king
    for (let [dx,dy] of directions.k) {  
      const nf = files[fileIdx + dx]; // left or right
      const nr = rank + dy; // up or down
      const np = nf + nr; // new position
      if (nf && nr >= 1 && nr <= 8 && (!state[np] || isEnemy(np))) { // move on empty square or capture
        moves.push(np);
      }
    }

    if (!skipKingCheck && !isKingInCheck(color, state)) {
      if (!castlingRights[color].kingMoved) {
        // king side castling
        if (!state[files[fileIdx+1]+rank] && !state[files[fileIdx+2]+rank] &&
            !castlingRights[color].rookHMoved) {
          if (!isSquareAttacked(files[fileIdx+1]+rank, color, state) && !isSquareAttacked(files[fileIdx+2]+rank, color, state)) {
            moves.push(files[fileIdx+2]+rank);
          }
        }
        // queen side castling
        if (!state[files[fileIdx-1]+rank] && !state[files[fileIdx-2]+rank] && !state[files[fileIdx-3]+rank] &&
            !castlingRights[color].rookAMoved) {
          if (!isSquareAttacked(files[fileIdx-1]+rank, color, state) && !isSquareAttacked(files[fileIdx-2]+rank, color, state)) {
            moves.push(files[fileIdx-2]+rank);
          }
        }
      }
    }
  }

  if (type === 'n') { // knight
    for (let [dx, dy] of directions.n) {
      const nf = files[fileIdx + dx]; // left or right
      const nr = rank + dy; // up or down
      const np = nf + nr; // new position
      if (nf && nr >= 1 && nr <= 8 && (!state[np] || isEnemy(np))) {  // move on empty square or capture
        moves.push(np);
      }
    }
  }

  return moves; // return a list of moves(positions)
}

function getLegalMoves(pos) { 
  const piece = window.currentGameState.board[pos]; 
  if (!piece) return []; // no legal moves

  const color = piece[0];
  const rawMoves = getLegalMovesRaw(pos); // all moves
  const legalMoves = [];

  for (let move of rawMoves) {
    const temp = { ...window.currentGameState.board };
    temp[move] = temp[pos]; // move the piece to new place
    delete temp[pos]; // delete the piece from old place
    if (!isKingInCheck(color, temp)) { // check for king safety
      legalMoves.push(move);
    }
  }

  return legalMoves; // list of legal moves(positions)
}

function isSquareAttacked(square, color, state) {
  const enemyColor = color === 'w' ? 'b' : 'w';
  for (let pos in state) {
    const piece = state[pos];
    if (piece && piece[0] === enemyColor) {
      const moves = getLegalMovesRaw(pos, state, true); // get all enemy moves
      if (moves.includes(square)) return true; // check if the enemy can attack the given square
    }
  }
  return false;  // no attacking => safe
}

function isKingInCheck(color, state = window.currentGameState.board) { 
  const kingPos = Object.keys(state).find(pos => state[pos] === color + 'k'); // get all keys(positions) on the board and check which one is the king of the given color
  if (!kingPos) return false;
  return isSquareAttacked(kingPos, color, state);
}

function isMoveLegal(from, to) {
  const legalMoves = getLegalMoves(from); // all valid moves for piece
  return legalMoves.includes(to); // check if to belongs to them
}

function createBoard() {
  const board = document.getElementById("gameBoard");
  if (!board) {
    console.error("Game board element not found!");
    return;
  }
  
  board.innerHTML = ''; // clear the board
  for (let r of ranks) {
    const row = document.createElement("tr");  
    for (let f of files) {
      const square = document.createElement("td"); // create new div element for each square
      const pos = f + r; // create "key"
      square.classList.add((files.indexOf(f) + ranks.indexOf(r)) % 2 === 0 ? "white" : "black");  // styling with css
      square.id = pos; // easier reference trough ID later
      square.dataset.row = ranks.indexOf(r);
      square.dataset.col = files.indexOf(f);

      square.addEventListener("click", () => handleSelect(pos));  // click event listener which triggers handleSelect
      row.appendChild(square); // attach/connect the square to the board
    }
    board.appendChild(row);
  }
}

function updateBoard(gameState) {
  if (!gameState || !gameState.board) return;
  
  // clear all squares first
  for (let rank of ranks) {
    for (let file of files) {
      const pos = file + rank;
      const square = document.getElementById(pos);
      if (square) {
        square.innerHTML = '';
      }
    }
  }
  
  // then add pieces
  for (let pos in gameState.board) {
    const square = document.getElementById(pos);
    if (square) {
      const piece = gameState.board[pos];
      if (piece) {
        const img = document.createElement("img"); // create the image
        img.src = `../assets/pieces/${piece}.png`; // get the location of the imgages
        img.draggable = false; // can not drag
        img.dataset.pos = pos; // safe way to save special information
        square.appendChild(img); // attach/connect the img to the square
      }
    }
  }

  if (lastMove) {
    const { from, to } = lastMove;
    const fromSquare = document.getElementById(from);
    const toSquare = document.getElementById(to);
    if (fromSquare) fromSquare.classList.add("highlightLast");
    if (toSquare) toSquare.classList.add("highlightLast");

    // update castling rights
    const piece = gameState.board[to];
    if (piece) {
      const color = piece[0];
      const type = piece[1];
      
      if (type === 'k') { // if king moves
        castlingRights[color].kingMoved = true;
      }
      else if (type === 'r') { // if rook moves castling is no logner available
        if (from === 'a1') castlingRights['w'].rookAMoved = true;
        if (from === 'h1') castlingRights['w'].rookHMoved = true;
        if (from === 'a8') castlingRights['b'].rookAMoved = true;
        if (from === 'h8') castlingRights['b'].rookHMoved = true;
      }
    }
  }
}

function handleSelect(pos) {
  if (playerRole === "spectator") return;

  const gameState = window.currentGameState;
  if (!gameState || !gameState.board) return;

  const piece = gameState.board[pos]; // get piece
  const pieceColor = piece?.[0]; // get w(white) or b(black). ?. throw undefined and prevents throwing an error 

  if (selected && selected !== pos && isMoveLegal(selected, pos)) { // if the click is move selection
    const from = selected;
    const to = pos;

    if (moveSound) {
        moveSound.play();
    }

    // handle castling
    if (piece && piece[1] === 'k') {
      const rank = pos[1];
      const file = pos[0];
      const isCastling = Math.abs(files.indexOf(file) - files.indexOf(selected[0])) === 2;
      
      if (isCastling) {
        // kingside castling
        if (file === 'g') {
          socket.emit('makeMove', {
            gameId: window.gameId,
            from: 'h' + rank,
            to: 'f' + rank
          });
        }
        // queenside castling
        else if (file === 'c') {
          socket.emit('makeMove', {
            gameId: window.gameId,
            from: 'a' + rank,
            to: 'd' + rank
          });
        }
      }
    }

    socket.emit('makeMove', { 
      gameId: window.gameId,
      from,
      to
    });
    
    selected = null;
    clearHighlights();
  } else if (piece && pieceColor === currentPlayer) { // if the click is a valid piece selection
    selected = pos;
    clearHighlights();
    const legalMoves = getLegalMoves(pos);
    legalMoves.forEach(move => {
      const square = document.getElementById(move);
      if (square) square.classList.add("highlight");
    });
  } else { // if the click is a non valid piece selection
    selected = null;
    clearHighlights();
  }
}

function highlightMoves(pos) {
  const square = document.getElementById(pos);
  if (square) square.classList.add("highlight"); // highlight the square
}

function clearHighlights() {
  document.querySelectorAll("td").forEach(sq => {
    sq.classList.remove("highlight", "highlightLast", "selected");
  });  // selects all squares and then for each remove the highlight
}

function playSound() {
  const sound = document.getElementById("moveSound"); // connection to the HTML
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.error("Error playing sound:", error);
    }); // play sound if it exsists
  } else {
    console.error("Sound element not found!");
  }
}

function isCheckmate(color) {
  if (!isKingInCheck(color)) return false; // no check
  for (let from in window.currentGameState.board) {
    const piece = window.currentGameState.board[from];
    if (piece && piece[0] === color) {
      const legalMoves = getLegalMoves(from);
      if (legalMoves.length > 0) return false; // has legal moves => only checked
    }
  }
  return true;
}

function isStalemate(color) {
  if (isKingInCheck(color)) return false; // king in check
  for (let from in window.currentGameState.board) {
    if (window.currentGameState.board[from][0] === color) {
      if (getLegalMoves(from).length > 0) return false; // has legal moves => only checked
    } 
  }
  return true;
}

function isInsufficientMaterial() {
  const pieces = Object.values(window.currentGameState.board).map(p => p[1]); // list of all pieces and retrieve only the type of the pieces
  const minorPieces = pieces.filter(p => ['n', 'b'].includes(p));  // filters only the knight and the bishop
  if (pieces.every(p => p === 'k')) return true; // only kings
  if (pieces.length === 3 && minorPieces.length === 1) return true; // two kings with one knight/bishop
  return false;
}

// socket event handlers
socket.on('gameStateUpdate', (gameState) => { // listen for game state updates from the server
  window.currentGameState = gameState; // store the latest game state globally
  const messageBox = document.getElementById("messageBox");
  
  if (gameState.status !== "playing" && gameState.status !== "waiting") { // if the game is not in a playable state, log the status and exit early
    messageBox.value += `Game state: ${gameState.status}\n`;
    return;
  }
  
  // set player role if not set
  if (!playerRole) { // assign the player's role based on their socket ID, if not already set
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

  // show moves for spectators
  if (gameState.moves.length > lastShownMoveIndex + 1) { 
    for (let i = lastShownMoveIndex + 1; i < gameState.moves.length; i++) {
      messageBox.value += gameState.moves[i] + "\n";
    }
    lastShownMoveIndex = gameState.moves.length - 1;
  }

  updateBoard(gameState);
  currentPlayer = gameState.turn === 'white' ? 'w' : 'b';

  // determine the last player who moved (used for win messages)
  const lastPlayer = currentPlayer === 'w' ? 'b' : 'w';

  // check for endgame conditions
  if (isCheckmate(currentPlayer)) {
    messageBox.value += `Checkmate! ${lastPlayer === 'w' ? "White" : "Black"} wins!\n`;
    socket.emit('gameEnded', { 
      gameId: window.gameId, 
      reason: 'checkmate', 
      winner: lastPlayer 
    });
  } else if (isStalemate(currentPlayer)) {
    messageBox.value += "Stalemate! It's a draw.\n";
    socket.emit('gameEnded', { gameId: window.gameId, reason: 'stalemate', winner: 'white' });
  } else if (isInsufficientMaterial()) {
    messageBox.value += "Draw due to insufficient material.\n";
    socket.emit('gameEnded', { gameId: window.gameId, reason: 'insufficient_material', winner: 'white' });
  } else if (isKingInCheck(currentPlayer)) {
    messageBox.value += "Check!\n";
  }
});

// handle game start event
socket.on('gameStarted', ({ whitePlayer, blackPlayer }) => {
  const messageBox = document.getElementById("messageBox");
  messageBox.value += "Game started!\n";
  currentPlayer = socket.id === whitePlayer ? 'w' : 'b';
});

// handle general error messages from the server
socket.on('error', (error) => {
  const messageBox = document.getElementById("messageBox");
  messageBox.value += `Error: ${error.message}\n`;
});

// handle game end event
socket.on('gameEnded', (data) => {
  const messageBox = document.getElementById("messageBox");
  messageBox.value += `Game ended: ${data.reason}\n`;

  // redirect back to home page after a short delay
  setTimeout(() => {
      window.location.href = '/';
  }, 8000);
});

// initialize the board when the page loads
document.addEventListener('DOMContentLoaded', () => {
  createBoard();
});
