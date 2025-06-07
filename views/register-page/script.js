/**
 * Registration Page Script
 * Handles user registration form validation, country selection, and form submission
 */

/**
 * Loads the list of countries from JSON file
 * returns Array of country objects
 */
async function loadCountries() {
	try {
		// Try to load from main location
		let response = await fetch("../../utils/iso-countries.json");

		// If that fails, try alternate location
		if (!response.ok) {
			response = await fetch("../../iso-countries.json");
		}

		if (!response.ok) {
			throw new Error("Failed to load countries");
		}

		const countries = await response.json();
		return countries;
	} catch (error) {
		console.error("Error loading countries:", error);
		return [];
	}
}

/**
 * Populates the country select dropdown with available countries
 * Falls back to a predefined list if loading fails
 */
async function populateCountrySelect() {
	const countrySelect = document.getElementById("country");
	if (!countrySelect) return;

	try {
		const countries = await loadCountries();

		// Sort countries by name
		countries.sort((a, b) => a.name.localeCompare(b.name));

		// Add options
		countries.forEach((country) => {
			const option = document.createElement("option");
			option.value = country.name;
			option.textContent = country.name;
			countrySelect.appendChild(option);
		});
	} catch (error) {
		console.error("Error populating countries:", error);

		// Fallback - add some common countries manually
		const commonCountries = [
			"Bulgaria",
			"United States",
			"United Kingdom",
			"Canada",
			"Germany",
			"France",
			"Spain",
			"Italy",
			"Russia",
			"China",
			"Japan",
		];

		commonCountries.forEach((country) => {
			const option = document.createElement("option");
			option.value = country;
			option.textContent = country;
			countrySelect.appendChild(option);
		});
	}
}

/**
 * Validates all registration form fields
 * returns Validation result and error messages
 */
function validateForm() {
	let isValid = true;
	const errors = {};

	// Clear all error messages
	document.querySelectorAll(".error-message").forEach((el) => {
		el.textContent = "";
	});

	// Validate first name
	const firstName = document.getElementById("firstName").value.trim();
	if (!firstName) {
		document.getElementById("firstName-error").textContent =
			"First name is required";
		errors.firstName = "First name is required";
		isValid = false;
	}

	// Validate last name
	const lastName = document.getElementById("lastName").value.trim();
	if (!lastName) {
		document.getElementById("lastName-error").textContent =
			"Last name is required";
		errors.lastName = "Last name is required";
		isValid = false;
	}

	// Validate email
	const email = document.getElementById("email").value.trim();
	if (!email) {
		document.getElementById("email-error").textContent = "Email is required";
		errors.email = "Email is required";
		isValid = false;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		document.getElementById("email-error").textContent =
			"Please enter a valid email address";
		errors.email = "Invalid email format";
		isValid = false;
	}

	// Validate username
	const username = document.getElementById("username").value.trim();
	if (!username) {
		document.getElementById("username-error").textContent =
			"Username is required";
		errors.username = "Username is required";
		isValid = false;
	} else if (username.length < 3) {
		document.getElementById("username-error").textContent =
			"Username must be at least 3 characters";
		errors.username = "Username too short";
		isValid = false;
	}

	// Validate country
	const country = document.getElementById("country").value;
	if (!country) {
		document.getElementById("country-error").textContent =
			"Please select your country";
		errors.country = "Country is required";
		isValid = false;
	}

	// Validate password
	const password = document.getElementById("password").value;
	if (!password) {
		document.getElementById("password-error").textContent =
			"Password is required";
		errors.password = "Password is required";
		isValid = false;
	} else if (password.length < 6) {
		document.getElementById("password-error").textContent =
			"Password must be at least 6 characters";
		errors.password = "Password too short";
		isValid = false;
	}

	// Validate password confirmation
	const confirmPassword = document.getElementById("confirmPassword").value;
	if (!confirmPassword) {
		document.getElementById("confirmPassword-error").textContent =
			"Please confirm your password";
		errors.confirmPassword = "Password confirmation required";
		isValid = false;
	} else if (confirmPassword !== password) {
		document.getElementById("confirmPassword-error").textContent =
			"Passwords do not match";
		errors.confirmPassword = "Passwords do not match";
		isValid = false;
	}

	return { isValid, errors };
}

// Initialize registration page
document.addEventListener("DOMContentLoaded", function () {
	// Populate the country dropdown
	populateCountrySelect();

	const registerForm = document.getElementById("register-form");

	if (registerForm) {
		registerForm.addEventListener("submit", function (event) {
			event.preventDefault();

			// Validate form
			const { isValid, errors } = validateForm();

			if (isValid) {
				// Prepare user data
				const userData = {
					firstName: document.getElementById("firstName").value.trim(),
					lastName: document.getElementById("lastName").value.trim(),
					email: document.getElementById("email").value.trim(),
					username: document.getElementById("username").value.trim(),
					country: document.getElementById("country").value,
					password: document.getElementById("password").value,
				};

				// Attempt registration
				const result = authService.register(userData);

				if (result.success) {
					// Redirect to home page
					window.location.href = "/";
				} else {
					// Display server-side validation errors
					if (result.errors) {
						Object.entries(result.errors).forEach(([field, message]) => {
							const errorElement = document.getElementById(`${field}-error`);
							if (errorElement) {
								errorElement.textContent = message;
							}
						});
					}
				}
			}
		});
	}

	// Check if user is already logged in
	if (authService.isLoggedIn()) {
		// Redirect to home page
		window.location.href = "/";
	}
});
