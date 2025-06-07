import express from 'express';
import { db } from '../index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// POST /api/users - registering new user
router.post('/', async (req, res) => {
    console.log('Received registration request:', req.body);
    try {
        const { firstName, lastName, email, username, country, password } = req.body;

        const existingUser = await db('users')
            .where({ email })
            .orWhere({ username })
            .first();

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return res.status(400).json({
                errors: {
                    general: 'User with that email already exists'
                }
            });
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // creating new user
        const [user] = await db('users')
            .insert({
                first_name: firstName,
                last_name: lastName,
                email,
                username,
                country,
                password: hashedPassword,
                elo: 1200
            })
            .returning('*');

        console.log('User created successfully:', user);
        res.status(201).json({ message: 'Successful registration' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            errors: {
                general: 'Error registering'
            }
        });
    }
});

// GET /api/users - returns all users
router.get('/', async (req, res) => {
    try {
        const users = await db('users').select('id', 'username', 'email', 'elo');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error loading user' });
    }
});

// GET /api/users/:id - returns a specific user
router.get('/:id', async (req, res) => {
    try {
        const user = await db('users')
            .where('id', req.params.id)
            .select('id', 'username', 'email', 'elo')
            .first();
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error loading user' });
    }
});

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		// check if user exists
		const user = await db('users')
			.where('username', username)
			.orWhere('email', username)
			.first();

		if (!user) {
            console.log(user)
			return res.status(401).json({
				success: false,
				error: "User does not exist"
			});
		}

		// check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			console.log('Invalid password for user:', user.username);
			return res.status(401).json({
				success: false,
				error: "Wrong password"
			});
		}

		// Don't sent the user back their password
		const { password: _, ...userWithoutPassword } = user;
        console.log(user)

		res.json({
			success: true,
			user: userWithoutPassword
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			error: "Error logging in"
		});
	}
});

router.post('/games', async (req, res) => {
    console.log('POST /api/users/games - Received request');
    console.log('Body:', req.body);
    
    try {
        const { 
            gameId,
            whitePlayerId, 
            blackPlayerId, 
            result,
            state,
            moves
        } = req.body;

        // saving game
        const game = await db('games').insert({
            game_id: gameId,
            player_id_white: whitePlayerId,
            player_id_black: blackPlayerId,
            result: result,
            state: state,
            moves: JSON.stringify(moves),
            date_time_played: new Date()
        }).returning('*');

        res.json({
            success: true,
            game: game[0]
        });
        console.log('Game successfully saved');
    } catch (error) {
        console.error('Save game error:', error);
        res.status(500).json({
            success: false,
            error: "Error saving game"
        });
    }
});

router.post('/:id', async (req, res) => {
    console.log('PUT /api/users/:id - Received request');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    try {
        const { id } = req.params;
        const { username, bio, country } = req.body;
        console.log('Updating user:', { id, username, bio, country });
        
        // check if user exists
        const user = await db('users').where('id', id).first();
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }
        console.log('user was found')
        // Checking if new username is free
        if (username && username !== user.username) {
            const existingUser = await db('users')
                .where('username', username)
                .whereNot('id', id)
                .first();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: "This username is already in use"
                });
            }
        }
        console.log('no other user with that name')
        // update user
        const updatedUser = await db('users')
            .where('id', id)
            .update({
                username: username,
                bio: bio,
                country: country
            })
            .returning('*');

        res.json({
            success: true,
            user: updatedUser[0]
        });
        console.log('user successfully updated')
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: "Error updating profile"
        });
    }
});

router.post('/:id/contact', async (req, res) => {
    console.log('POST /api/users/:id/contact - Received request');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    try {
        const { id } = req.params;
        const { email, phoneNumber } = req.body;
        console.log('Updating user contact:', { id, email, phoneNumber });
        
        // check if user exists
        const user = await db('users').where('id', id).first();
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Check if the new email is already in use
        if (email && email !== user.email) {
            const existingUser = await db('users')
                .where('email', email)
                .whereNot('id', id)
                .first();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: "This email is already in use"
                });
            }
        }

        // Update user
        const updatedUser = await db('users')
            .where('id', id)
            .update({
                email: email,
                phone_number: phoneNumber
            })
            .returning('*');

        res.json({
            success: true,
            user: updatedUser[0]
        });
        console.log('User contact info successfully updated');
    } catch (error) {
        console.error('Update user contact error:', error);
        res.status(500).json({
            success: false,
            error: "Error updating contact information"
        });
    }
});

router.post('/:id/names', async (req, res) => {
    console.log('POST /api/users/:id/names - Received request');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    try {
        const { id } = req.params;
        const { firstName, middleName, lastName } = req.body;
        console.log('Updating user names:', { id, firstName, middleName, lastName });
        
        // Check if user exists
        const user = await db('users').where('id', id).first();
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Update user
        const updatedUser = await db('users')
            .where('id', id)
            .update({
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName
            })
            .returning('*');

        res.json({
            success: true,
            user: updatedUser[0]
        });
        console.log('User names successfully updated');
    } catch (error) {
        console.error('Update user names error:', error);
        res.status(500).json({
            success: false,
            error: "Error updating names"
        });
    }
});

router.post('/:id/password', async (req, res) => {
    console.log('POST /api/users/:id/password - Received request');
    
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;
        
        // Check if user exists
        const user = await db('users').where('id', id).first();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Check old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Incorrect current password"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and last changed date
        const updatedUser = await db('users')
            .where('id', id)
            .update({
                password: hashedPassword,
                password_last_changed_at: new Date()
            })
            .returning('*');

        res.json({
            success: true,
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            error: "Error changing password"
        });
    }
});

router.get('/:id/matches', async (req, res) => {
    console.log('GET /api/users/:id/matches - Received request');
    try {
        const userId = req.params.id;
        
        // Get all games where user was either white or black
        const matches = await db('games')
            .select(
                'games.*',
                db.raw('white.username as white_username'),
                db.raw('black.username as black_username')
            )
            .leftJoin('users as white', 'games.player_id_white', 'white.id')
            .leftJoin('users as black', 'games.player_id_black', 'black.id')
            .where('player_id_white', userId)
            .orWhere('player_id_black', userId)
            .orderBy('date_time_played', 'desc')
            .limit(3);

        console.log('Matches found:', matches); // Debug log

        // Format matches for frontend
        const formattedMatches = matches.map(match => {
            const isWhite = match.playerIdWhite == userId;
            const opponent = isWhite ? match.blackUsername : match.whiteUsername;
            let result;
            if (match.state === 'w' || match.state === 'b') {
                result = (match.state === 'w' && isWhite) || 
                        (match.state === 'b' && !isWhite) ? 'win' : 'loss';
            } else {
                result = 'draw';
            }

            return {
                result,
                opponent: `vs. ${opponent}`,
                date: new Date(match.dateTimePlayed).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };
        });

        res.json({
            success: true,
            matches: formattedMatches
        });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({
            success: false,
            error: "Error loading match history"
        });
    }
});

export default router;