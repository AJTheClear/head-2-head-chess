import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { games } from '../index.js';
import { Game } from '../utils/game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/**
 * GET /
 * Serves the home page of the application
 * Returns the home page HTML file
 */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/home-page/index.html"));
});

/**
 * POST /
 * Creates a new game and redirects to the game page
 * Generates a unique game ID and initializes a new Game instance
 * Redirects to the game page with the generated game ID
 */
router.post("/", (req, res) => {
  const gameId = uuidv4().slice(0, 6);
  games.set(gameId, new Game(gameId));
  
  res.redirect(`/${gameId}`);
});

/**
 * GET /:gameID
 * Serves the game page for a specific game
 * @param {string} gameID - The unique identifier of the game
 * Returns 404 if game is not found, otherwise serves the game page
 */
router.get("/:gameID", (req, res) => {
    const { gameID } = req.params;
    
    if (!games.has(gameID)) {
        return res.status(404).send('Game not found');
    }
    
    res.sendFile(path.join(__dirname, "../views/game-page/index.html"));
});

export default router;
