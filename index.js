import express from 'express'
import cors from 'cors'
import router from './routes/defaultPageRouter.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './game.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

export const games = new Map();

app.use(cors())
app.use(express.json())
app.use(express.static("homePage"));
app.use(express.static("gamePage"));

app.use('/', router)

io.on('connection', (socket) => {
    console.log('New client connected');
  
    socket.on('joinGame', ({ gameId, isSpectator }) => {
      socket.join(gameId);
      
      if (!games.has(gameId)) {
        games.set(gameId, new Game(gameId));
      }
      
      const game = games.get(gameId);
      const role = game.addPlayer(socket, isSpectator ? "spectator" : null);
      
      const gameState = game.getGameState();
      io.to(gameId).emit('gameStateUpdate', gameState);
      
      if (game.status === "playing") {
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
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
      
      for (const [gameId, game] of games.entries()) {
        if (game.removePlayer(socket.id)) {
          const gameState = game.getGameState();
          io.to(gameId).emit('gameStateUpdate', gameState);
          
          if (game.status === "finished") {
            io.to(gameId).emit('gameEnded', { reason: 'player_left' });
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