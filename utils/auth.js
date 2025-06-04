/**
 * Authentication Utility
 *
 * This file provides authentication-related functionality to be shared
 * across login, registration, and other pages that need authentication.
 */

class AuthService {
	constructor() {
		// Simulate database with localStorage
		this.initializeUserDatabase();
	}

	// Initialize user database with default users if none exist
	initializeUserDatabase() {
		if (!localStorage.getItem("userDatabase")) {
			const defaultUsers = [
				{
					username: "admin",
					email: "admin@h2hchess.com",
					password: "admin123",
					firstName: "Admin",
					lastName: "User",
					country: "Bulgaria",
					elo: 2000,
				},
				{
					username: "nick",
					email: "nick.georgiev@example.com",
					password: "chess123",
					firstName: "Nick",
					middleName: "Svetoslavov",
					lastName: "Georgiev",
					country: "Bulgaria",
					elo: 1850,
				},
			];
			localStorage.setItem("userDatabase", JSON.stringify(defaultUsers));
		}
	}

	// Get user database
	getUserDatabase() {
		return JSON.parse(localStorage.getItem("userDatabase")) || [];
	}

	// Save user database
	saveUserDatabase(database) {
		localStorage.setItem("userDatabase", JSON.stringify(database));
	}

	// Login user
	login(username, password) {
		const userDatabase = this.getUserDatabase();
		const user = userDatabase.find(
			(user) =>
				(user.username === username || user.email === username) &&
				user.password === password
		);

		if (user) {
			// Store current user info in session storage
			this.setCurrentUser(user);
			return { success: true, user };
		} else {
			return {
				success: false,
				error: "Invalid credentials",
			};
		}
	}

	// Register new user
	register(userData) {
		const userDatabase = this.getUserDatabase();

		// Check if username or email already exists
		const existingUserByUsername = userDatabase.find(
			(user) => user.username.toLowerCase() === userData.username.toLowerCase()
		);

		const existingUserByEmail = userDatabase.find(
			(user) => user.email.toLowerCase() === userData.email.toLowerCase()
		);

		if (existingUserByUsername) {
			return {
				success: false,
				errors: { username: "Username already exists" },
			};
		}

		if (existingUserByEmail) {
			return {
				success: false,
				errors: { email: "Email already exists" },
			};
		}

		// Add default ELO rating for new users
		userData.elo = 1200;

		// Add new user
		userDatabase.push(userData);
		this.saveUserDatabase(userDatabase);

		// Store current user info
		this.setCurrentUser(userData);

		return { success: true, user: userData };
	}

	// Update user profile
	updateUserProfile(userData) {
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

		// Update user data
		const updatedUser = { ...userDatabase[userIndex], ...userData };
		userDatabase[userIndex] = updatedUser;

		// Save updated database
		this.saveUserDatabase(userDatabase);

		// Update current user in session
		this.setCurrentUser(updatedUser);

		return { success: true, user: updatedUser };
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

// Create global instance of AuthService
const authService = new AuthService();
