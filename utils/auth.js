class AuthService {
	
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
			if (!response.ok) {
				return {
					success: false,
					error: data.error || "Invalid login credentials"
				};
			}

			// Store current user info in session storage
			this.setCurrentUser(data.user);
			return { success: true, user: data.user };
		} catch (error) {
			return {
				success: false,
				error: "An error occurred during login"
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
					general: 'An error occurred during registration'
				}
			};
		}
		
	}

	// Update user profile
	async updateUserProfile(userData) {
		const currentUser = this.getCurrentUser();

		if (!currentUser) {
			return { success: false, error: "Not logged in" };
		}

		// Validate userData
		if (!userData || typeof userData !== 'object') {
			console.error('Invalid userData:', userData);
			return { success: false, error: "Invalid profile data" };
		}

		try {
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
			// Update current user in session
			this.setCurrentUser(data.user);
			return { success: true, user: data.user };
		} catch (error) {
			return {
				success: false,
				error: "An error occurred while updating the profile"
			};
		}
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
}

function validateUserData(userData) {
	const errors = {};

	// Validate first name
	if (!userData.firstName || userData.firstName.trim().length < 2) {
		errors.firstName = "First name must be at least 2 characters";
	}

	// Validate last name
	if (!userData.lastName || userData.lastName.trim().length < 2) {
		errors.lastName = "Last name must be at least 2 characters";
	}

	// Validate email
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!userData.email || !emailRegex.test(userData.email)) {
		errors.email = "Please enter a valid email address";
	}

	// Validate username
	if (!userData.username || userData.username.trim().length < 3) {
		errors.username = "Username must be at least 3 characters";
	}

	// Validate country
	if (!userData.country) {
		errors.country = "Please select a country";
	}

	// Validate password
	if (!userData.password || userData.password.length < 6) {
		errors.password = "Password must be at least 6 characters";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	};
}

// Create global instance
window.authService = new AuthService();
