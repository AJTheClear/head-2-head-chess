const socket = io();

const gameId = window.location.pathname.split("/")[1];
const isSpectator = new URLSearchParams(window.location.search).get('spectate') === 'true';

socket.emit('joinGame', { gameId, isSpectator });

document.addEventListener("DOMContentLoaded", () => {
    let selectedCell = null;
    const board = document.getElementById("gameBoard");
    const messageBox = document.getElementById("messageBox");
    let playerRole = null;
    let lastShownMoveIndex = -1;

    socket.on('gameStateUpdate', (gameState) => {
        if (gameState.status !== "playing")
            messageBox.value += `Game state: ${gameState.status}\n`;
        
        // the following if statement is needed to protect from displaying the role every turn
        if (!playerRole) {
            const player = gameState.players.find(p => p.id === socket.id);
            if (player) {
                playerRole = player.role;
                if (playerRole === "spectator") {
                    messageBox.value += `You are watching the game as a spectator\n`;
                    board.style.cursor = "default";
                } else {
                    messageBox.value += `You are playing as: ${playerRole}\n`;
                }
            }
        }

        // loads all played moves when a spectator joins
        if (gameState.moves.length > lastShownMoveIndex + 1) {
            for (let i = lastShownMoveIndex + 1; i < gameState.moves.length; i++) {
                messageBox.value += gameState.moves[i] + "\n";
            }
            lastShownMoveIndex = gameState.moves.length - 1;
        }

        updateBoard(gameState);
    });

    socket.on('gameStarted', (data) => {
        messageBox.value += "Game started!\n";
    });

    socket.on('error', (error) => {
        messageBox.value += `Error: ${error.message}\n`;
    });

    socket.on('gameEnded', (data) => {
        messageBox.value += `Game ended: ${data.reason}\n`;
        setTimeout(() => {
            window.location.href = '/';
        }, 8000); // 8 second timeout before the game kicks the players
    });

    board.addEventListener("click", (e) => {
        if (playerRole === "spectator") {
            return;
        }

        const cell = e.target.closest("td");
        if (!cell) return;

        if (selectedCell === cell) {
            cell.classList.remove('selected');
            selectedCell = null;
            return;
        }

        if (!selectedCell) {
            selectedCell = cell;
            cell.classList.add('selected');
        } else {
            const from = {
                row: parseInt(selectedCell.dataset.row),
                col: parseInt(selectedCell.dataset.col)
            };
            const to = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col)
            };

            socket.emit('makeMove', { gameId, from, to });

            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
    });
});
