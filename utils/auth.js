/**
 * Authentication Utility
 *
 * This file provides authentication-related functionality to be shared
 * across login, registration, and other pages that need authentication.
 */

class AuthService {
	// constructor() {
	// 	// Simulate database with localStorage
	// 	this.initializeUserDatabase();
	// }

	// Initialize user database with default users if none exist
	// initializeUserDatabase() {
	// 	if (!localStorage.getItem("userDatabase")) {
	// 		const defaultUsers = [
	// 			{
	// 				username: "admin",
	// 				email: "admin@h2hchess.com",
	// 				password: "admin123",
	// 				firstName: "Admin",
	// 				lastName: "User",
	// 				country: "Bulgaria",
	// 				elo: 2000,
	// 			},
	// 			{
	// 				username: "nick",
	// 				email: "nick.georgiev@example.com",
	// 				password: "chess123",
	// 				firstName: "Nick",
	// 				middleName: "Svetoslavov",
	// 				lastName: "Georgiev",
	// 				country: "Bulgaria",
	// 				elo: 1850,
	// 			},
	// 		];
	// 		localStorage.setItem("userDatabase", JSON.stringify(defaultUsers));
	// 	}
	// }

	// Get user database
	// getUserDatabase() {
	// 	return JSON.parse(localStorage.getItem("userDatabase")) || [];
	// }

	// Save user database
	// saveUserDatabase(database) {
	// 	localStorage.setItem("userDatabase", JSON.stringify(database));
	// }

	// Login user
	async login(username, password) {
		try {
			const response = await fetch('/api/users/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();
			console.log(data)
			if (!response.ok) {
				return {
					success: false,
					error: data.error || "Невалидни данни за вход"
				};
			}

			// Store current user info in session storage
			this.setCurrentUser(data.user);
			return { success: true, user: data.user };
		} catch (error) {
			console.error('Login error:', error);
			return {
				success: false,
				error: "Възникна грешка при влизането"
			};
		}
	}

	// Register new user
	async register(userData) {
		// Validate user data
		const { isValid, errors } = validateUserData(userData);
		if (!isValid) {
			return { success: false, errors };
		}

		try {
			const response = await fetch('/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData)
			});

			const data = await response.json();

			if (!response.ok) {
				return { success: false, errors: data.errors };
			}

			window.location.href = '/views/login-page/index.html';
			return { success: true };
		} catch (error) {
			console.error('Registration error:', error);
			return {
				success: false,
				errors: {
					general: 'Възникна грешка при регистрацията'
				}
			};
		}
		
	}

	// Update user profile
	async updateUserProfile(userData) {
		console.log('Received userData:', userData);
		const currentUser = this.getCurrentUser();
		console.log('Current user:', currentUser);

		if (!currentUser) {
			return { success: false, error: "Not logged in" };
		}

		// Validate userData
		if (!userData || typeof userData !== 'object') {
			console.error('Invalid userData:', userData);
			return { success: false, error: "Невалидни данни за профила" };
		}

		try {
			console.log('Sending request to:', `/api/users/${currentUser.id}`);
			console.log('Request data:', {
				username: userData.username,
				bio: userData.bio,
				country: userData.country
			});

			const response = await fetch(`/api/users/${currentUser.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: userData.username,
					bio: userData.bio,
					country: userData.country
				})
			});

			console.log('Response status:', response.status);
			if (!response.ok) {
				const data = await response.json();
				console.log('Error response:', data);
				return { success: false, error: data.error};
			}

			const data = await response.json();
			console.log('Success response:', data);
			// Update current user in session
			this.setCurrentUser(data.user);
			return { success: true, user: data.user };
		} catch (error) {
			console.error('Profile update error:', error);
			return {
				success: false,
				error: "Възникна грешка при обновяване на профила"
			};
		}
	}

	// Change password
	changePassword(currentPassword, newPassword) {
		const currentUser = this.getCurrentUser();

		if (!currentUser) {
			return { success: false, error: "Not logged in" };
		}

		const userDatabase = this.getUserDatabase();
		const userIndex = userDatabase.findIndex(
			(user) => user.username === currentUser.username
		);

		if (userIndex === -1) {
			return { success: false, error: "User not found" };
		}

		// Verify current password
		if (userDatabase[userIndex].password !== currentPassword) {
			return { success: false, error: "Current password is incorrect" };
		}

		// Update password
		userDatabase[userIndex].password = newPassword;

		// Save updated database
		this.saveUserDatabase(userDatabase);

		return { success: true };
	}

	// Set current user
	setCurrentUser(user) {
		// Don't store password in session
		const { password, ...userInfo } = user;
		sessionStorage.setItem("currentUser", JSON.stringify(userInfo));
	}

	// Get current user
	getCurrentUser() {
		return JSON.parse(sessionStorage.getItem("currentUser"));
	}

	// Check if user is logged in
	isLoggedIn() {
		return !!this.getCurrentUser();
	}

	// Logout user
	logout() {
		sessionStorage.removeItem("currentUser");
	}

	// Get user by username
	getUserByUsername(username) {
		const userDatabase = this.getUserDatabase();
		return userDatabase.find((user) => user.username === username);
	}
}

function validateUserData(userData) {
	const errors = {};

	// Validate first name
	if (!userData.firstName || userData.firstName.trim().length < 2) {
		errors.firstName = "Името трябва да е поне 2 символа";
	}

	// Validate last name
	if (!userData.lastName || userData.lastName.trim().length < 2) {
		errors.lastName = "Фамилията трябва да е поне 2 символа";
	}

	// Validate email
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!userData.email || !emailRegex.test(userData.email)) {
		errors.email = "Моля, въведете валиден имейл адрес";
	}

	// Validate username
	if (!userData.username || userData.username.trim().length < 3) {
		errors.username = "Потребителското име трябва да е поне 3 символа";
	}

	// Validate country
	if (!userData.country) {
		errors.country = "Моля, изберете държава";
	}

	// Validate password
	if (!userData.password || userData.password.length < 6) {
		errors.password = "Паролата трябва да е поне 6 символа";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

// Create global instance
window.authService = new AuthService();
