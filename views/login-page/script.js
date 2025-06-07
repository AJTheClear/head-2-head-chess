// Handle login form submission
document.addEventListener("DOMContentLoaded", function () {
	const loginForm = document.getElementById("login-form");

	if (loginForm) {
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
				authService.login(username, password).then(result => {
					if (result.success) {
						// Redirect to home page
						window.location.href = "/";
					} else {
						document.getElementById("password-error").textContent = result.error;
					}
				});
			}
		});
	}

	// Check if user is already logged in
	if (authService.isLoggedIn()) {
		// Redirect to home page
		window.location.href = "/";
	}
});
