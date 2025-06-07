import express from 'express'
import cors from 'cors'
import knex from 'knex';
import router from './routes/defaultPageRouter.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './utils/game.js';
import knexConfig from './knexfile.js';
import userRouter from './routes/userRouter.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

export const games = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/views/home-page', express.static('views/home-page'));
app.use('/views/game-page', express.static('views/game-page'));
app.use('/assets', express.static('assets'));
app.use('/styles', express.static('styles'));
app.use('/utils', express.static('utils'));
app.use('/scripts', express.static('scripts'));
app.use('/views', express.static('views'));
app.use('/components/navbar', express.static('components/navbar'));

// Knex connection
const db = knex(knexConfig.development);
export { db };

// API routes
app.use('/', router)
app.use('/api/users', userRouter);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGame', ({ gameId, isSpectator, userId }) => {
    socket.join(gameId);
    
    if (!games.has(gameId)) {
      games.set(gameId, new Game(gameId));
    }
    
    const game = games.get(gameId);
    game.addPlayer(socket, isSpectator ? "spectator" : null, userId);
    
    const gameState = game.getGameState();
    io.to(gameId).emit('gameStateUpdate', gameState);
    
    if (game.status === "playing" && game.players.length === 2) {
      io.to(gameId).emit('gameStarted', {
        whitePlayer: game.players.find(p => p.role === 'white')?.id,
        blackPlayer: game.players.find(p => p.role === 'black')?.id
      });
    }
  });

  socket.on('makeMove', ({ gameId, from, to }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (!game.isPlayersTurn(socket.id)) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    if (game.makeMove(socket.id, { from, to })) {
      const gameState = game.getGameState();
      io.to(gameId).emit('gameStateUpdate', gameState);
    }
  });

  socket.on('gameEnded', ({ gameId, reason, winner }) => {
    const game = games.get(gameId);
    if (!game) return;

    game.status = "finished";
    game.winner = winner;
    game.endReason = reason;

    const gameState = game.getGameState();
    
    if (gameState.blackPlayerID == gameState.whitePlayerID) {
      return;
    }
    // Get the winner's socket ID
    const winnerSocketId = winner === 'white' ? 
        game.players.find(p => p.role === 'white')?.id :
        game.players.find(p => p.role === 'black')?.id;

    // Only save if this socket is the winner
    if (socket.id === winnerSocketId) {
        // Check if game is already saved
        db('games').where('game_id', gameId).first()
            .then(existingGame => {
                if (existingGame) {
                    console.log('Game already saved, skipping...');
                    return;
                }

                // Determine state based on reason
                let state;
                if (reason === 'checkmate') {
                    state = winner; // 'white' or 'black'
                } else if (reason === 'stalemate' || reason === 'insufficient_material') {
                    state = reason;
                }

                // Save game to database
                return db('games').insert({
                    game_id: gameId,
                    player_id_white: gameState.whitePlayerID,
                    player_id_black: gameState.blackPlayerID,
                    result: reason,
                    state: state,
                    moves: JSON.stringify(gameState.moves),
                    date_time_played: new Date()
                });
            })
            .then(() => {
                console.log('Game successfully saved by winner');
            })
            .catch(error => {
                console.error('Save game error:', error);
            });
    }

    io.to(gameId).emit('gameStateUpdate', gameState);
    io.to(gameId).emit('gameEnded', { reason, winner });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    
    for (const [gameId, game] of games.entries()) {
      if (game.removePlayer(socket.id)) {
        const gameState = game.getGameState();
        
        // Set winner if game was in progress
        if (game.status === "finished") {
          const remainingPlayer = game.players.find(p => p.role !== "spectator");
          if (remainingPlayer) {
            game.winner = remainingPlayer.role;
            game.endReason = "opponent left";

            if (gameState.blackPlayerID == gameState.whitePlayerID) {
              return;
            }

            // Save game to database
            db('games').where('game_id', gameId).first()
              .then(existingGame => {
                if (existingGame) {
                  console.log('Game already saved, skipping...');
                  return;
                }

                // Save game to database
                return db('games').insert({
                  game_id: gameId,
                  player_id_white: gameState.whitePlayerID,
                  player_id_black: gameState.blackPlayerID,
                  result: "opponent left",
                  state: remainingPlayer.role, // Winner's role as state
                  moves: JSON.stringify(gameState.moves),
                  date_time_played: new Date()
                });
              })
              .then(() => {
                console.log('Game successfully saved after opponent left');
              })
              .catch(error => {
                console.error('Save game error:', error);
              });
          }
        }
        
        io.to(gameId).emit('gameStateUpdate', gameState);
        
        if (game.status === "finished") {
          io.to(gameId).emit('gameEnded', { 
            reason: 'opponent left',
            winner: game.winner
          });
        }
        
        if (game.players.length === 0) {
          games.delete(gameId);
        }
        break;
      }
    }
  });
});

httpServer.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});