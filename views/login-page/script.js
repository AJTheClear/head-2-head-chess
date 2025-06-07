/**
 * Login Page Controller
 * Handles form submission, validation, and authentication
 */
document.addEventListener("DOMContentLoaded", function () {
	// DOM Elements
	const loginForm = document.getElementById("login-form");

	if (loginForm) {
		/**
		 * Form Submission Handler
		 * Validates and processes login attempt
		 */
		loginForm.addEventListener("submit", function (event) {
			event.preventDefault();

			// Clear previous error messages
			document.getElementById("username-error").textContent = "";
			document.getElementById("password-error").textContent = "";

			// Get form values
			const username = document.getElementById("username").value.trim();
			const password = document.getElementById("password").value;

			// Validate form fields
			let isValid = true;

			if (!username) {
				document.getElementById("username-error").textContent =
					"Please enter your username or email";
				isValid = false;
			}

			if (!password) {
				document.getElementById("password-error").textContent =
					"Please enter your password";
				isValid = false;
			}

			if (isValid) {
				// Attempt login
				authService.login(username, password).then((result) => {
					if (result.success) {
						// Redirect to home page
						window.location.href = "/";
					} else {
						document.getElementById("password-error").textContent =
							result.error;
					}
				});
			}
		});
	}

	// Check authentication state
	if (authService.isLoggedIn()) {
		// Redirect to home page if already logged in
		window.location.href = "/";
	}
});
