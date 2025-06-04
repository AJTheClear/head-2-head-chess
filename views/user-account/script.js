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

					// Update displayed values
					document.getElementById("first-name-display").textContent = firstName;
					document.getElementById("middle-name-display").textContent =
						middleName;
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
					// In a real application, this would send the password update to the server

					// Update last changed date
					const today = new Date();
					const formattedDate = new Intl.DateTimeFormat("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					}).format(today);

					document.getElementById("last-password-change").textContent =
						formattedDate;

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

	if (contactInfoForm) {
		contactInfoForm.addEventListener("submit", (e) => {
			e.preventDefault();

			// Phone validation
			const phoneInput = document.getElementById("phone");
			if (!validatePhoneNumber(phoneInput)) {
				return;
			}

			showConfirmationModal(
				"Update Contact Information",
				"Are you sure you want to update your contact information?",
				() => {
					// Get form values
					const email = document.getElementById("email").value;
					const phone = document.getElementById("phone").value;

					// Update displayed values
					document.getElementById("email-display").textContent = email;
					document.getElementById("phone-display").textContent = phone;

					// Hide edit mode and show view mode
					contactInfoView.classList.remove("hidden");
					contactInfoEdit.classList.add("hidden");

					// Show the edit button again
					editContactInfoBtn.style.display = "";

					showSuccessModal(
						"Your contact information has been updated successfully."
					);
				}
			);
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

	function validatePhoneNumber(phoneInput) {
		const phoneValue = phoneInput.value.trim(); // Removes whitespaces from the string

		if (!phoneValue.startsWith("+")) {
			alert('Phone number must start with a "+" symbol');
			return false;
		}

		if (phoneValue.length <= 1) {
			alert(
				'Please enter a valid phone number with digits after the "+" symbol'
			);
			return false;
		}

		return true;
	}

	// function validatePhoneNumber(phoneInput) {
	// 	const phoneValue = phoneInput.value.trim();

	// 	if (phoneValue && !phoneValue.startsWith("+")) {
	// 		alert('Phone number must start with a "+" symbol');
	// 		return false;
	// 	}

	// 	return true;
	// }

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

	function initializePhoneInput() {
		const phoneInput = document.getElementById("phone");
		if (!phoneInput) return;

		// Ensure the "+" is always present at the beginning
		function ensurePlusSign() {
			if (!phoneInput.value.startsWith("+")) {
				phoneInput.value = "+" + phoneInput.value.replace(/\D/g, "");
			}
		}

		// Initialize with "+" if empty
		phoneInput.addEventListener("focus", function () {
			if (!this.value) {
				this.value = "+";
			}
		});

		// Prevent cursor from moving before the "+"
		phoneInput.addEventListener("click", function () {
			if (this.selectionStart === 0) {
				this.setSelectionRange(1, 1);
			}
		});

		// Handle keydown to control what can be entered
		phoneInput.addEventListener("keydown", function (e) {
			// Allow: navigation keys, backspace, delete, tab
			if ([8, 9, 35, 36, 37, 38, 39, 40, 46].indexOf(e.keyCode) !== -1) {
				// Prevent cursor from deleting the "+"
				if (e.keyCode === 8 && this.selectionStart <= 1) {
					e.preventDefault();
				}
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

		// Clean up any non-digit characters that might get pasted
		phoneInput.addEventListener("input", function () {
			const cursorPos = this.selectionStart;
			this.value = "+" + this.value.substring(1).replace(/\D/g, "");
			this.setSelectionRange(cursorPos, cursorPos);
		});

		// Ensure the "+" is always there when losing focus
		phoneInput.addEventListener("blur", ensurePlusSign);
	}

	initializePhoneInput();
});
