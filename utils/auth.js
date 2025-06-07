/**
 * Authentication Service
 * Handles user authentication, registration, and profile management
 * Provides methods for login, logout, registration, and user data validation
 */
class AuthService {
	
	/**
	 * Authenticates a user with username and password
	 * @param {string} username - User's username
	 * @param {string} password - User's password
	 * @returns {Promise<Object>} Object containing success status and user data or error
	 */
	async login(username, password) {
		try {
			// Send login request to server
			const response = await fetch('/api/users/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();
			if (!response.ok) {
				return {
					success: false,
					error: data.error || "Invalid login credentials"
				};
			}

			// Store user data in session storage
			this.setCurrentUser(data.user);
			return { success: true, user: data.user };
		} catch (error) {
			return {
				success: false,
				error: "An error occurred during login"
			};
		}
	}

	/**
	 * Registers a new user
	 * @param {Object} userData - User registration data
	 * @returns {Promise<Object>} Object containing success status and any validation errors
	 */
	async register(userData) {
		// Validate user input data
		const { isValid, errors } = validateUserData(userData);
		if (!isValid) {
			return { success: false, errors };
		}

		try {
			// Send registration request to server
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

			// Redirect to login page on successful registration
			window.location.href = '/views/login-page/index.html';
			return { success: true };
		} catch (error) {
			console.error('Registration error:', error);
			return {
				success: false,
				errors: {
					general: 'An error occurred during registration'
				}
			};
		}
	}

	/**
	 * Updates user profile information
	 * @param {Object} userData - Updated user profile data
	 * @returns {Promise<Object>} Object containing success status and updated user data or error
	 */
	async updateUserProfile(userData) {
		const currentUser = this.getCurrentUser();

		// Check if user is logged in
		if (!currentUser) {
			return { success: false, error: "Not logged in" };
		}

		// Validate userData object
		if (!userData || typeof userData !== 'object') {
			console.error('Invalid userData:', userData);
			return { success: false, error: "Invalid profile data" };
		}

		try {
			// Send profile update request to server
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

			if (!response.ok) {
				const data = await response.json();
				return { success: false, error: data.error};
			}

			const data = await response.json();
			// Update session storage with new user data
			this.setCurrentUser(data.user);
			return { success: true, user: data.user };
		} catch (error) {
			return {
				success: false,
				error: "An error occurred while updating the profile"
			};
		}
	}

	/**
	 * Stores user data in session storage
	 * @param {Object} user - User object to store
	 */
	setCurrentUser(user) {
		// Remove sensitive data before storing
		const { password, ...userInfo } = user;
		sessionStorage.setItem("currentUser", JSON.stringify(userInfo));
	}

	/**
	 * Retrieves current user data from session storage
	 * @returns {Object|null} User object or null if not logged in
	 */
	getCurrentUser() {
		return JSON.parse(sessionStorage.getItem("currentUser"));
	}

	/**
	 * Checks if a user is currently logged in
	 * @returns {boolean} True if user is logged in, false otherwise
	 */
	isLoggedIn() {
		return !!this.getCurrentUser();
	}

	/**
	 * Logs out the current user by clearing session storage
	 */
	logout() {
		sessionStorage.removeItem("currentUser");
	}
}

/**
 * Validates user registration data
 * @param {Object} userData - User data to validate
 * @returns {Object} Object containing validation status and any errors
 */
function validateUserData(userData) {
	const errors = {};

	// Validate first name (minimum 2 characters)
	if (!userData.firstName || userData.firstName.trim().length < 2) {
		errors.firstName = "First name must be at least 2 characters";
	}

	// Validate last name (minimum 2 characters)
	if (!userData.lastName || userData.lastName.trim().length < 2) {
		errors.lastName = "Last name must be at least 2 characters";
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!userData.email || !emailRegex.test(userData.email)) {
		errors.email = "Please enter a valid email address";
	}

	// Validate username (minimum 3 characters)
	if (!userData.username || userData.username.trim().length < 3) {
		errors.username = "Username must be at least 3 characters";
	}

	// Validate country selection
	if (!userData.country) {
		errors.country = "Please select a country";
	}

	// Validate password (minimum 6 characters)
	if (!userData.password || userData.password.length < 6) {
		errors.password = "Password must be at least 6 characters";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

// Create global instance for use throughout the application
window.authService = new AuthService();
