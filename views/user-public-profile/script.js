document.addEventListener("DOMContentLoaded", async () => {
	// Load country data from JSON file
	try {
		const response = await fetch("../../utils/iso-countries.json");
		if (!response.ok) {
			throw new Error("Failed to fetch country data");
		}
		const countryData = await response.json();
		populateCountrySelect(countryData);
	} catch (error) {
		console.error("Error loading country data:", error);
		// Fallback - try alternate path
		try {
			const response = await fetch("../../iso-countries.json");
			if (!response.ok) {
				throw new Error("Failed to fetch country data from alternate path");
			}
			const countryData = await response.json();
			populateCountrySelect(countryData);
		} catch (fallbackError) {
			console.error("Error with fallback country data:", fallbackError);
		}
	}

	// Set up event listeners
	setupEventListeners();

	// Initialize form validations
	initializeFormValidation();

	
});

if (typeof window.authService === "undefined") {
	// Create basic fallback functions if auth.js isn't loaded
	window.authService = {
		getCurrentUser: function () {
			return JSON.parse(sessionStorage.getItem("currentUser"));
		},
		logout: function () {
			sessionStorage.removeItem("currentUser");
			window.location.href = "../../views/login-page/index.html";
		},
		isLoggedIn: function () {
			return !!this.getCurrentUser();
		},
	};
}

const me = authService.getCurrentUser();
if (me) {
	// username
	document.getElementById("username").textContent = me.username;
	// bio
	document.getElementById("user-bio").textContent = me.bio || "";
	// country
	document.getElementById("country-value").textContent = me.country;
	// avatar
	document.getElementById("profile-avatar").src =
		me.avatarUrl || "../../assets/images/SungJinWoo_ProfilePic.png";
	// ELO
	document.getElementById("elo-value").textContent = me.elo;
}

function populateCountrySelect(countries) {
	const countrySelect = document.getElementById("edit-country");
	if (!countrySelect) return;

	// Sort countries by name
	countries.sort((a, b) => a.name.localeCompare(b.name));

	// Create options
	countries.forEach((country) => {
		const option = document.createElement("option");
		option.value = country.name;
		option.textContent = country.name;

		option.defaultSelected = undefined
		countrySelect.appendChild(option);
	});
}

// Initialize all form validations
function initializeFormValidation() {
	// Initialize bio character counter and validation
	initializeBioValidation();

	// Initialize username validation
	initializeUsernameValidation();

	// Add more validations as needed
}

function initializeUsernameValidation() {
	const usernameInput = document.getElementById("edit-username");
	if (!usernameInput) return;

	// Create validation message element
	const validationMessage = document.createElement("div");
	validationMessage.className = "validation-message";
	usernameInput.parentNode.appendChild(validationMessage);

	// Add input event listener
	usernameInput.addEventListener("input", function () {
		validateUsername(this, validationMessage);
	});

	// Add blur event listener
	usernameInput.addEventListener("blur", function () {
		validateUsername(this, validationMessage);
	});
}

function validateUsername(input, validationElement) {
	const value = input.value.trim();
	let isValid = true;
	let errorMessage = "";

	// Required field
	if (value.length === 0) {
		isValid = false;
		errorMessage = "Username is required";
	}
	// Length check
	else if (value.length < 3) {
		isValid = false;
		errorMessage = "Username must be at least 3 characters long";
	}
	// Alphanumeric check (allow spaces, dashes, and underscores)
	else if (!/^[a-zA-Z0-9 _-]+$/.test(value)) {
		isValid = false;
		errorMessage =
			"Username can only contain letters, numbers, spaces, underscores, and dashes";
	}

	// Update validation UI
	if (!isValid) {
		input.classList.add("invalid");
		validationElement.textContent = errorMessage;
		validationElement.style.display = "block";
	} else {
		input.classList.remove("invalid");
		validationElement.textContent = "";
		validationElement.style.display = "none";
	}

	return isValid;
}

function initializeBioValidation() {
	const bioTextarea = document.getElementById("edit-bio");
	if (!bioTextarea) return;

	const bioFormGroup = bioTextarea.closest(".form-group");
	const MAX_BIO_LENGTH = 100; // Increased from 50 to a more reasonable 100

	// Update maxlength attribute
	bioTextarea.setAttribute("maxlength", MAX_BIO_LENGTH);

	// Create character counter element
	const charCounter = document.createElement("div");
	charCounter.className = "char-counter";

	// Create validation message element
	const validationMessage = document.createElement("div");
	validationMessage.className = "validation-message";

	// Insert elements
	bioFormGroup.insertBefore(charCounter, bioTextarea.nextSibling);
	bioFormGroup.appendChild(validationMessage);

	// Initial count update
	updateCharacterCount(bioTextarea, charCounter, MAX_BIO_LENGTH);

	// Add event listener for input
	bioTextarea.addEventListener("input", function () {
		updateCharacterCount(this, charCounter, MAX_BIO_LENGTH);
		validateBio(this, validationMessage, MAX_BIO_LENGTH);
	});

	// Add event listener for blur
	bioTextarea.addEventListener("blur", function () {
		validateBio(this, validationMessage, MAX_BIO_LENGTH);
	});
}

function updateCharacterCount(textarea, counterElement, maxLength) {
	const currentLength = textarea.value.length;

	counterElement.textContent = `${currentLength}/${maxLength} characters`;

	// Apply visual styling based on character count
	if (currentLength >= maxLength * 0.9) {
		counterElement.classList.add("limit-approaching");
	} else {
		counterElement.classList.remove("limit-approaching");
	}

	if (currentLength >= maxLength) {
		textarea.classList.add("char-limit-reached");
		counterElement.classList.add("limit-reached");
	} else {
		textarea.classList.remove("char-limit-reached");
		counterElement.classList.remove("limit-reached");
	}
}

function validateBio(textarea, validationElement, maxLength) {
	const value = textarea.value.trim();
	let isValid = true;
	let errorMessage = "";

	// Length check - bioTextArea should already limit this via maxlength attribute
	if (value.length > maxLength) {
		isValid = false;
		errorMessage = `Bio cannot exceed ${maxLength} characters`;
	}

	// Optional: Check for minimum length
	if (value.length > 0 && value.length < 10) {
		isValid = false;
		errorMessage =
			"Bio should be at least 10 characters for a better profile presentation";
	}

	// Optional: Check for excessive repetition
	if (/(.)\1{5,}/.test(value)) {
		// Checks for 6+ repetitions of any character
		isValid = false;
		errorMessage = "Please avoid excessive repetition of characters";
	}

	// Update validation UI
	if (!isValid) {
		textarea.classList.add("invalid");
		validationElement.textContent = errorMessage;
		validationElement.style.display = "block";
	} else {
		textarea.classList.remove("invalid");
		validationElement.textContent = "";
		validationElement.style.display = "none";
	}

	return isValid;
}

async function setupEventListeners() {
	// Edit profile button
	const editProfileBtn = document.getElementById("edit-profile-btn");
	const editProfileModal = document.getElementById("edit-profile-modal");

	if (editProfileBtn) {
		editProfileBtn.addEventListener("click", () => {
			editProfileModal.classList.add("active");
		});
	}

	// Edit avatar button
	const editAvatarBtn = document.getElementById("edit-avatar-btn");
	const avatarUploadModal = document.getElementById("avatar-upload-modal");

	if (editAvatarBtn) {
		editAvatarBtn.addEventListener("click", () => {
			avatarUploadModal.classList.add("active");
		});
	}

	// Close modals
	const closeButtons = document.querySelectorAll(".close-modal");
	closeButtons.forEach((button) => {
		button.addEventListener("click", () => {
			document.querySelectorAll(".modal").forEach((modal) => {
				modal.classList.remove("active");
			});
		});
	});

	// Cancel buttons
	const cancelEditBtn = document.getElementById("cancel-edit");
	if (cancelEditBtn) {
		cancelEditBtn.addEventListener("click", () => {
			editProfileModal.classList.remove("active");
		});
	}

	const cancelAvatarBtn = document.getElementById("cancel-avatar");
	if (cancelAvatarBtn) {
		cancelAvatarBtn.addEventListener("click", () => {
			avatarUploadModal.classList.remove("active");
			// Reset the preview image
			document.getElementById("avatar-preview-img").src =
				document.getElementById("profile-avatar").src;
		});
	}

	// Avatar upload preview
	const avatarUploadInput = document.getElementById("avatar-upload");
	const avatarPreviewImg = document.getElementById("avatar-preview-img");
	const saveAvatarBtn = document.getElementById("save-avatar");

	if (avatarUploadInput) {
		avatarUploadInput.addEventListener("change", (event) => {
			const file = event.target.files[0];
			if (file) {
				// File type validation
				if (!file.type.match("image.*")) {
					alert("Please select an image file");
					return;
				}

				// File size validation
				if (file.size > 2 * 1024 * 1024) {
					alert("File size exceeds 2MB limit");
					return;
				}

				const reader = new FileReader();
				reader.onload = (e) => {
					avatarPreviewImg.src = e.target.result;
					saveAvatarBtn.disabled = false;
				};
				reader.readAsDataURL(file);
			}
		});
	}

	// Save avatar
	if (saveAvatarBtn) {
		saveAvatarBtn.addEventListener("click", () => {
			// Update the main profile avatar with the preview image
			document.getElementById("profile-avatar").src = avatarPreviewImg.src;

			// Close the modal
			avatarUploadModal.classList.remove("active");

			// Reset the save button
			saveAvatarBtn.disabled = true;
		});
	}

	// Edit profile form submission with validation
	const editProfileForm = document.getElementById("edit-profile-form");
	if (editProfileForm) {
		editProfileForm.addEventListener("submit", (event) => {
			event.preventDefault();

			// Get form values
			const username = document.getElementById("edit-username").value.trim();
			const bio = document.getElementById("edit-bio").value.trim();
			const country = document.getElementById("edit-country").value;
			

			// Validate form
			const usernameInput = document.getElementById("edit-username");
			const bioTextarea = document.getElementById("edit-bio");

			const usernameValidationMsg = usernameInput.parentNode.querySelector(
				".validation-message"
			);
			const bioValidationMsg = bioTextarea.parentNode.querySelector(
				".validation-message"
			);

			const isUsernameValid = validateUsername(
				usernameInput,
				usernameValidationMsg
			);
			const isBioValid = validateBio(
				bioTextarea,
				bioValidationMsg,
				parseInt(bioTextarea.getAttribute("maxlength") || 200)
			);

			if (!isUsernameValid || !isBioValid) {
				// Form is invalid
				return;
			}

			// Update the profile information
			document.getElementById("username").textContent = username;
			document.getElementById("user-bio").textContent = bio;
			document.getElementById("country-value").textContent = country;

			// Close the modal
			editProfileModal.classList.remove("active");

			//db and session
			authService.updateUserProfile({ username, bio, country })
		});
	}

	// Close modals when clicking outside
	window.addEventListener("click", (event) => {
		document.querySelectorAll(".modal").forEach((modal) => {
			if (event.target === modal) {
				modal.classList.remove("active");
			}
		});
	});
}
