import express from 'express';
import { db } from '../index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// POST /api/users - регистрира нов потребител
router.post('/', async (req, res) => {
    console.log('Received registration request:', req.body);
    try {
        const { firstName, lastName, email, username, country, password } = req.body;

        // Проверка дали потребителят вече съществува
        const existingUser = await db('users')
            .where({ email })
            .orWhere({ username })
            .first();

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return res.status(400).json({
                errors: {
                    general: 'Потребител с този имейл или потребителско име вече съществува'
                }
            });
        }

        // Хеширане на паролата
        const hashedPassword = await bcrypt.hash(password, 10);

        // Създаване на нов потребител
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
        res.status(201).json({ message: 'Успешна регистрация' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            errors: {
                general: 'Възникна грешка при регистрацията'
            }
        });
    }
});

// GET /api/users - взима всички потребители
router.get('/', async (req, res) => {
    try {
        const users = await db('users').select('id', 'username', 'email', 'elo');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Възникна грешка при зареждането на потребителите' });
    }
});

// GET /api/users/:id - взима конкретен потребител
router.get('/:id', async (req, res) => {
    try {
        const user = await db('users')
            .where('id', req.params.id)
            .select('id', 'username', 'email', 'elo')
            .first();
        
        if (!user) {
            return res.status(404).json({ error: 'Потребителят не е намерен' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Възникна грешка при зареждането на потребителя' });
    }
});

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		// Проверяваме дали потребителят съществува
		const user = await db('users')
			.where('username', username)
			.orWhere('email', username)
			.first();

		if (!user) {
            console.log(user)
			return res.status(401).json({
				success: false,
				error: "Потребителят не съществува"
			});
		}

		// Проверяваме паролата
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			console.log('Invalid password for user:', user.username);
			return res.status(401).json({
				success: false,
				error: "Грешна парола"
			});
		}

		// Не изпращаме паролата обратно към клиента
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
			error: "Възникна грешка при влизането"
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

        // Записваме играта
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
            error: "Възникна грешка при записване на играта"
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
        
        // Проверяваме дали потребителят съществува
        const user = await db('users').where('id', id).first();
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: "Потребителят не е намерен"
            });
        }
        console.log('user was found')
        // Проверяваме дали новото потребителско име вече не се използва
        if (username && username !== user.username) {
            const existingUser = await db('users')
                .where('username', username)
                .whereNot('id', id)
                .first();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: "Това потребителско име вече се използва"
                });
            }
        }
        console.log('no other user with that name')
        // Обновяваме потребителя
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
            error: "Възникна грешка при обновяване на профила"
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
        
        // Проверяваме дали потребителят съществува
        const user = await db('users').where('id', id).first();
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: "Потребителят не е намерен"
            });
        }

        // Проверяваме дали новият имейл вече не се използва
        if (email && email !== user.email) {
            const existingUser = await db('users')
                .where('email', email)
                .whereNot('id', id)
                .first();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: "Този имейл вече се използва"
                });
            }
        }

        // Обновяваме потребителя
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
            error: "Възникна грешка при обновяване на контактната информация"
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
        
        // Проверяваме дали потребителят съществува
        const user = await db('users').where('id', id).first();
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: "Потребителят не е намерен"
            });
        }

        // Обновяваме потребителя
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
            error: "Възникна грешка при обновяване на имената"
        });
    }
});

router.post('/:id/password', async (req, res) => {
    console.log('POST /api/users/:id/password - Received request');
    
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;
        
        // Проверяваме дали потребителят съществува
        const user = await db('users').where('id', id).first();
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Потребителят не е намерен"
            });
        }

        // Проверяваме старата парола
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Грешна текуща парола"
            });
        }

        // Хешираме новата парола
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Обновяваме паролата и датата на последна промяна
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
            error: "Възникна грешка при промяната на паролата"
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
            error: "Възникна грешка при зареждане на историята на мачовете"
        });
    }
});

export default router; 