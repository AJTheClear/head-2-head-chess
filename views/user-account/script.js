// DOM Elements
document.addEventListener("DOMContentLoaded", function () {
	// Navigation tabs
	const navItems = document.querySelectorAll(".account-nav-item");
	const sections = document.querySelectorAll(".account-section");

	// Edit buttons
	const editPersonalInfoBtn = document.getElementById("edit-personal-info");
	const editPasswordBtn = document.getElementById("edit-password");
	const editContactInfoBtn = document.getElementById("edit-contact-info");

	// Cancel buttons
	const cancelPersonalInfoBtn = document.getElementById("cancel-personal-info");
	const cancelPasswordBtn = document.getElementById("cancel-password");
	const cancelContactInfoBtn = document.getElementById("cancel-contact-info");

	// View and edit modes
	const personalInfoView = document.getElementById("personal-info-view");
	const personalInfoEdit = document.getElementById("personal-info-edit");
	const passwordView = document.getElementById("password-view");
	const passwordEdit = document.getElementById("password-edit");
	const contactInfoView = document.getElementById("contact-info-view");
	const contactInfoEdit = document.getElementById("contact-info-edit");

	// Forms
	const personalInfoForm = document.getElementById("personal-info-form");
	const passwordForm = document.getElementById("password-form");
	const contactInfoForm = document.getElementById("contact-info-form");

	// Modals
	const confirmationModal = document.getElementById("confirmation-modal");
	const successModal = document.getElementById("success-modal");
	const modalTitle = document.getElementById("modal-title");
	const modalMessage = document.getElementById("modal-message");
	const successMessage = document.getElementById("success-message");
	const confirmButton = document.getElementById("confirm-button");
	const cancelButton = document.getElementById("cancel-button");
	const okButton = document.getElementById("ok-button");
	const closeModalButtons = document.querySelectorAll(".close-modal");

	// Password validation elements
	const newPasswordInput = document.getElementById("new-password");
	const confirmPasswordInput = document.getElementById("confirm-password");
	const savePasswordBtn = document.getElementById("save-password-btn");
	const passwordStrengthBar = document.getElementById("password-strength-bar");
	const reqLength = document.getElementById("req-length");
	const reqUppercase = document.getElementById("req-uppercase");
	const reqLowercase = document.getElementById("req-lowercase");
	const reqNumber = document.getElementById("req-number");
	const reqSpecial = document.getElementById("req-special");

	// Add this variable to store country phone codes
	let countryPhoneCodes = [];

	document.getElementById("email-display").textContent = authService.getCurrentUser().email;
	document.getElementById("phone-display").textContent = authService.getCurrentUser().phoneNumber;
	document.getElementById("first-name-display").textContent = authService.getCurrentUser().firstName;
	document.getElementById("middle-name-display").textContent = authService.getCurrentUser().middleName;
	document.getElementById("last-name-display").textContent = authService.getCurrentUser().lastName;

	// Format last password change date
	const lastPasswordChange = authService.getCurrentUser().passwordLastChangedAt;
	if (lastPasswordChange) {
		const date = new Date(lastPasswordChange);
		const formattedDate = new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		}).format(date);
		document.getElementById("last-password-change").textContent = formattedDate;
	} else {
		document.getElementById("last-password-change").textContent = "Never";
	}

	// Add this function to load country phone codes
	async function loadCountryPhoneCodes() {
		try {
			const response = await fetch("../../utils/country-phone-codes.json");
			if (!response.ok) {
				throw new Error("Failed to fetch country phone codes");
			}
			countryPhoneCodes = await response.json();
			console.log("Country phone codes loaded successfully");
		} catch (error) {
			console.error("Error loading country phone codes:", error);
		}
	}

	// Add this function to update country code based on selected country
	function updateCountryCode(selectedCountry) {
		const countryCodeInput = document.getElementById("country-code");
		if (!countryCodeInput || !countryPhoneCodes.length) return;

		// Find the country in the phone codes data
		const countryData = countryPhoneCodes.find(
			(country) => country.name.toLowerCase() === selectedCountry.toLowerCase()
		);

		if (countryData) {
			countryCodeInput.value = countryData.dial_code;
		} else {
			// Fallback to a default if country not found
			countryCodeInput.value = "+1";
			console.warn(`Country code not found for: ${selectedCountry}`);
		}
	}

	// Modified phone validation function
	function validatePhoneNumber(phoneInput) {
		const phoneValue = phoneInput.value.trim();
		const countryCodeInput = document.getElementById("country-code");

		if (!phoneValue) {
			alert("Please enter a phone number");
			return false;
		}

		// Check if phone number contains only digits, spaces, and hyphens
		if (!/^[\d\s\-]+$/.test(phoneValue)) {
			alert("Phone number can only contain digits, spaces, and hyphens");
			return false;
		}

		// Check minimum length (without spaces and hyphens)
		const digitsOnly = phoneValue.replace(/[\s\-]/g, "");
		if (digitsOnly.length < 6) {
			alert("Please enter a valid phone number (minimum 6 digits)");
			return false;
		}

		if (digitsOnly.length > 15) {
			alert("Phone number is too long (maximum 15 digits)");
			return false;
		}

		return true;
	}

	// Modified initializePhoneInput function
	function initializePhoneInput() {
		const phoneInput = document.getElementById("phone");
		const countryCodeInput = document.getElementById("country-code");

		if (!phoneInput || !countryCodeInput) return;

		// Handle keydown to allow only digits, spaces, and hyphens
		phoneInput.addEventListener("keydown", function (e) {
			// Allow: navigation keys, backspace, delete, tab
			if ([8, 9, 35, 36, 37, 38, 39, 40, 46].indexOf(e.keyCode) !== -1) {
				return;
			}

			// Allow: space (32) and hyphen (189, 109)
			if ([32, 189, 109].indexOf(e.keyCode) !== -1) {
				return;
			}

			// Block any non-digit keys
			if (
				(e.keyCode < 48 || e.keyCode > 57) &&
				(e.keyCode < 96 || e.keyCode > 105)
			) {
				e.preventDefault();
			}
		});

		// Clean up any invalid characters that might get pasted
		phoneInput.addEventListener("input", function () {
			const cursorPos = this.selectionStart;
			const originalValue = this.value;
			this.value = this.value.replace(/[^\d\s\-]/g, "");

			// Restore cursor position if value changed
			if (originalValue !== this.value) {
				this.setSelectionRange(cursorPos - 1, cursorPos - 1);
			}
		});

		// Format phone number on blur
		phoneInput.addEventListener("blur", function () {
			// Remove extra spaces and format nicely
			this.value = this.value.replace(/\s+/g, " ").trim();
		});
	}

	// Add event listener for country selection change
	function setupCountryChangeListener() {
		const editContactInfoBtn = document.getElementById("edit-contact-info");
		if (!editContactInfoBtn) return;

		// Override the existing click handler to include country code update
		editContactInfoBtn.addEventListener("click", () => {
			// Default to Bulgaria since Account Settings doesn't have country selection
			// In the future, this could be integrated with user profile data
			updateCountryCode(authService.getCurrentUser().country);

			// Show edit mode (existing functionality)
			document.getElementById("contact-info-view").classList.add("hidden");
			document.getElementById("contact-info-edit").classList.remove("hidden");
			editContactInfoBtn.style.display = "none";
		});
	}

	// Modified contact info form submit handler
	async function setupContactFormHandler() {
		const contactInfoForm = document.getElementById("contact-info-form");
		if (!contactInfoForm) return;

		contactInfoForm.addEventListener("submit", (e) => {
			e.preventDefault();

			// Phone validation
			const phoneInput = document.getElementById("phone");
			if (!validatePhoneNumber(phoneInput)) {
				return;
			}

			const confirmationModal = document.getElementById("confirmation-modal");
			const modalTitle = document.getElementById("modal-title");
			const modalMessage = document.getElementById("modal-message");
			const confirmButton = document.getElementById("confirm-button");

			// Show confirmation modal
			modalTitle.textContent = "Update Contact Information";
			modalMessage.textContent =
				"Are you sure you want to update your contact information?";

			confirmButton.onclick = () => {
				// Get form values
				const email = document.getElementById("email").value;
				const countryCode = document.getElementById("country-code").value;
				const phoneNumber = phoneInput.value;
				const fullPhoneNumber = `${countryCode} ${phoneNumber}`;

				// Call API to update contact info
				const currentUser = authService.getCurrentUser();
				if (!currentUser) {
					throw new Error('Not logged in');
				}

				fetch(`/api/users/${currentUser.id}/contact`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email,
						phoneNumber: fullPhoneNumber
					})
				})
				.then(response => {
					if (!response.ok) {
						return response.json().then(data => {
							throw new Error(data.error || 'Грешка при обновяване на контактната информация');
						});
					}
					return response.json();
				})
				.then(data => {
					// Update session storage with new user data
					authService.setCurrentUser(data.user);
				})
				.catch(error => {
					console.error('Update contact error:', error);
					alert(error.message);
					return;
				});

				// Update displayed values
				document.getElementById("email-display").textContent = email;
				document.getElementById("phone-display").textContent = fullPhoneNumber;

				// Hide edit mode and show view mode
				document.getElementById("contact-info-view").classList.remove("hidden");
				document.getElementById("contact-info-edit").classList.add("hidden");

				// Show the edit button again
				document.getElementById("edit-contact-info").style.display = "";

				// Hide confirmation modal
				confirmationModal.classList.remove("active");

				// Show success modal
				const successModal = document.getElementById("success-modal");
				const successMessage = document.getElementById("success-message");
				successMessage.textContent =
					"Your contact information has been updated successfully.";
				successModal.classList.add("active");
			};

			confirmationModal.classList.add("active");
		});
	}

	// Tab Navigation
	navItems.forEach((item) => {
		item.addEventListener("click", function (e) {
			e.preventDefault();

			// Deactivate all nav items and sections
			navItems.forEach((navItem) => navItem.classList.remove("active"));
			sections.forEach((section) => section.classList.remove("active"));

			// Activate the clicked nav item and corresponding section
			item.classList.add("active");
			const sectionId = item.getAttribute("data-section") + "-section";
			document.getElementById(sectionId).classList.add("active");
		});
	});

	// Edit Mode Toggles
	if (editPersonalInfoBtn) {
		editPersonalInfoBtn.addEventListener("click", () => {
			personalInfoView.classList.add("hidden");
			personalInfoEdit.classList.remove("hidden");
		});
	}

	if (editPasswordBtn) {
		editPasswordBtn.addEventListener("click", () => {
			passwordView.classList.add("hidden");
			passwordEdit.classList.remove("hidden");
			// Hide the edit button while in edit mode
			editPasswordBtn.style.display = "none";
		});
	}

	if (editContactInfoBtn) {
		editContactInfoBtn.addEventListener("click", () => {
			contactInfoView.classList.add("hidden");
			contactInfoEdit.classList.remove("hidden");
			// Hide the edit button while in edit mode
			editContactInfoBtn.style.display = "none";
		});
	}

	// Cancel Button Handlers
	if (cancelPersonalInfoBtn) {
		cancelPersonalInfoBtn.addEventListener("click", () => {
			personalInfoView.classList.remove("hidden");
			personalInfoEdit.classList.add("hidden");
			personalInfoForm.reset();
		});
	}

	if (cancelPasswordBtn) {
		cancelPasswordBtn.addEventListener("click", () => {
			passwordView.classList.remove("hidden");
			passwordEdit.classList.add("hidden");
			passwordForm.reset();
			resetPasswordValidation();
			// Show the edit button again
			editPasswordBtn.style.display = "";
		});
	}

	if (cancelContactInfoBtn) {
		cancelContactInfoBtn.addEventListener("click", () => {
			contactInfoView.classList.remove("hidden");
			contactInfoEdit.classList.add("hidden");
			contactInfoForm.reset();
			// Show the edit button again
			editContactInfoBtn.style.display = "";
		});
	}

	// Form Submit Handlers
	if (personalInfoForm) {
		personalInfoForm.addEventListener("submit", (e) => {
			e.preventDefault();
			showConfirmationModal(
				"Update Personal Information",
				"Are you sure you want to update your personal information?",
				() => {
					// Get form values
					const firstName = document.getElementById("first-name").value;
					const middleName = document.getElementById("middle-name").value;
					const lastName = document.getElementById("last-name").value;

					// Call API to update names
					const currentUser = authService.getCurrentUser();
					if (!currentUser) {
						throw new Error('Not logged in');
					}

					fetch(`/api/users/${currentUser.id}/names`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							firstName,
							middleName,
							lastName
						})
					})
					.then(response => {
						if (!response.ok) {
							return response.json().then(data => {
								throw new Error(data.error || 'Грешка при обновяване на имената');
							});
						}
						return response.json();
					})
					.then(data => {
						// Update session storage with new user data
						authService.setCurrentUser(data.user);
					})
					.catch(error => {
						console.error('Update names error:', error);
						alert(error.message);
						return;
					});

					// Update displayed values
					document.getElementById("first-name-display").textContent = firstName;
					document.getElementById("middle-name-display").textContent = middleName;
					document.getElementById("last-name-display").textContent = lastName;

					// Hide edit mode and show view mode
					personalInfoView.classList.remove("hidden");
					personalInfoEdit.classList.add("hidden");

					showSuccessModal(
						"Your personal information has been updated successfully."
					);
				}
			);
		});
	}

	if (passwordForm) {
		passwordForm.addEventListener("submit", (e) => {
			e.preventDefault();
			showConfirmationModal(
				"Change Password",
				"Are you sure you want to change your password?",
				() => {
					// Update last changed date
					oldPass = document.getElementById("current-password");
					newPass = document.getElementById("new-password");
					confirmPass = document.getElementById("confirm-password");

					// Call API to update password
					const currentUser = authService.getCurrentUser();
					if (!currentUser) {
						throw new Error('Not logged in');
					}

					fetch(`/api/users/${currentUser.id}/password`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							oldPassword: oldPass.value,
							newPassword: newPass.value
						})
					})
					.then(response => {
						if (!response.ok) {
							return response.json().then(data => {
								throw new Error(data.error || 'Грешка при промяната на паролата');
							});
						}
						return response.json();
					})
					.then(data => {
						// Update session storage with new user data
						authService.setCurrentUser(data.user);
					})
					.catch(error => {
						console.error('Update password error:', error);
						alert(error.message);
						return;
					});

					// Hide edit mode and show view mode
					passwordView.classList.remove("hidden");
					passwordEdit.classList.add("hidden");

					// Reset the form
					passwordForm.reset();
					resetPasswordValidation();

					showSuccessModal("Your password has been changed successfully.");
				}
			);
			editPasswordBtn.style.display = "";
		});
	}

	// Password Validation
	if (newPasswordInput) {
		newPasswordInput.addEventListener("input", validatePassword);
		confirmPasswordInput.addEventListener("input", validatePassword);
	}

	// Modal Functions
	function showConfirmationModal(title, message, onConfirm) {
		modalTitle.textContent = title;
		modalMessage.textContent = message;

		confirmButton.onclick = () => {
			onConfirm();
			hideModal(confirmationModal);
		};

		showModal(confirmationModal);
	}

	function showSuccessModal(message) {
		successMessage.textContent = message;
		showModal(successModal);
	}

	function showModal(modal) {
		modal.classList.add("active");
	}

	function hideModal(modal) {
		modal.classList.remove("active");
	}

	// Close modal buttons
	closeModalButtons.forEach((btn) => {
		btn.addEventListener("click", function () {
			const modal = this.closest(".modal");
			hideModal(modal);
		});
	});

	// OK button in success modal
	if (okButton) {
		okButton.addEventListener("click", function () {
			hideModal(successModal);
		});
	}

	// Cancel button in confirmation modal
	if (cancelButton) {
		cancelButton.addEventListener("click", function () {
			hideModal(confirmationModal);
		});
	}

	// Close modals when clicking outside
	window.addEventListener("click", function (event) {
		if (event.target.classList.contains("modal")) {
			hideModal(event.target);
		}
	});

	// Password validation functions
	function validatePassword() {
		if (!newPasswordInput || !confirmPasswordInput) return;

		const password = newPasswordInput.value;
		const confirmPassword = confirmPasswordInput.value;
		let isValid = true;

		// Check requirements
		const hasLength = password.length >= 8;
		const hasUppercase = /[A-Z]/.test(password);
		const hasLowercase = /[a-z]/.test(password);
		const hasNumber = /[0-9]/.test(password);
		const hasSpecial = /[^A-Za-z0-9]/.test(password);

		// Update requirement indicators
		updateRequirementStatus(reqLength, hasLength);
		updateRequirementStatus(reqUppercase, hasUppercase);
		updateRequirementStatus(reqLowercase, hasLowercase);
		updateRequirementStatus(reqNumber, hasNumber);
		updateRequirementStatus(reqSpecial, hasSpecial);

		// Update strength bar
		let strength = 0;
		if (hasLength) strength++;
		if (hasUppercase) strength++;
		if (hasLowercase) strength++;
		if (hasNumber) strength++;
		if (hasSpecial) strength++;

		passwordStrengthBar.className = "strength-bar";
		passwordStrengthBar.style.width = (strength / 5) * 100 + "%";

		if (password.length === 0) {
			passwordStrengthBar.style.width = "0";
		} else if (strength <= 2) {
			passwordStrengthBar.classList.add("weak");
		} else if (strength === 3) {
			passwordStrengthBar.classList.add("medium");
		} else if (strength === 4) {
			passwordStrengthBar.classList.add("strong");
		} else {
			passwordStrengthBar.classList.add("very-strong");
		}

		// Check if all requirements are met
		isValid =
			hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

		// Check if passwords match
		const passwordsMatch = password === confirmPassword && password !== "";

		// Enable/disable save button
		savePasswordBtn.disabled = !(isValid && passwordsMatch);
	}

	function updateRequirementStatus(element, isValid) {
		if (!element) return;

		if (isValid) {
			element.classList.add("valid");
		} else {
			element.classList.remove("valid");
		}
	}

	function resetPasswordValidation() {
		if (!passwordStrengthBar) return;

		passwordStrengthBar.className = "strength-bar";
		passwordStrengthBar.style.width = "0";

		[reqLength, reqUppercase, reqLowercase, reqNumber, reqSpecial].forEach(
			(el) => {
				if (el) el.classList.remove("valid");
			}
		);

		if (savePasswordBtn) savePasswordBtn.disabled = true;
	}

	// Initialize the first section as active
	if (navItems.length > 0) {
		navItems[0].classList.add("active");
	}

	if (sections.length > 0) {
		sections[0].classList.add("active");
	}

	// Load country phone codes
	loadCountryPhoneCodes();

	// Setup country change listener
	setupCountryChangeListener();

	// Setup contact form handler (replaces existing)
	setupContactFormHandler();

	// Initialize phone input (replaces existing)
	initializePhoneInput();
});
