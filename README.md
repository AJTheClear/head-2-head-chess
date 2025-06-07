# Head 2 Head Chess

A real-time multiplayer chess game built with Node.js and Socket.IO.

## Technologies

- Node.js
- Express.js
- Socket.IO
- HTML/CSS/JavaScript
- Knex.js (SQL Query Builder)
- PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone [repository URL]
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run migrate
```

4. Start the server:
```bash
node --loader ts-node/esm index.js
```

The server will start on port 3001.

## Project Structure

```
head-2-head-chess/
├── index.js              # Main server file
├── knexfile.ts           # Database configuration
├── tsconfig.json         # TypeScript configuration
├── assets/              # Static assets
│   ├── audio/          # Sound effects
│   ├── images/         # General images
│   └── pieces/         # Chess piece images
├── components/          # Reusable components
│   └── navbar/         # Navigation bar component
├── migrations/          # Database migrations
├── routes/             # Express routes
├── server/             # Server-side code
├── styles/             # CSS styles
├── utils/              # Utility functions
│   └── game.js         # Game logic
└── views/              # Frontend views
    ├── home-page/      # Home page
    └── game-page/      # Game page
```

## Features

- Real-time multiplayer chess
- User authentication
- Spectator mode
- User profiles
- Match history

## How to Play

1. Open your browser and navigate to `http://localhost:3001`
2. Create a new game or join an existing one
3. Wait for a second player to join
4. Start playing!

## Game Rules

- First player gets white pieces
- Second player gets black pieces
- Players take turns making moves
- Spectators can only watch the game
- Standard chess rules apply

## API Endpoints

### User Routes
- `POST /api/users` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id` - Update user profile
- `POST /api/users/:id/contact` - Update contact info
- `POST /api/users/:id/names` - Update user names
- `POST /api/users/:id/password` - Change password
- `GET /api/users/:id/matches` - Get user's match history

### Game Routes
- `POST /api/users/games` - Save game
- `GET /api/users/:id/matches` - Get match history

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
