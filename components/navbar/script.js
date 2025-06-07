// DOM Elements
const subMenu = document.getElementById("subMenu");
const overlay = document.getElementById("overlay");

// Authentication Service Fallback
// Provides basic auth functionality if auth.js isn't loaded
if (typeof window.authService === "undefined") {
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

// Initialize navbar state and event listeners
updateNavbarForAuthState();

// Logout Button Event Listener
const logoutLink = document.querySelector(".sub-menu-link.logout-link.logout");
if (logoutLink) {
	logoutLink.addEventListener("click", function (e) {
		e.preventDefault();
		logout();
	});
}

/**
 * Updates the navbar UI based on user authentication state
 * - Shows/hides user information
 * - Enables/disables profile links
 * - Updates user display name
 */
function updateNavbarForAuthState() {
	const userPic = document.querySelector(".user-pic");
	const userInfo = document.querySelector(".user-info");
	const profileLinks = document.querySelectorAll(
		".sub-menu-link:not(.logout-link)"
	);

	const currentUser = authService.getCurrentUser();

	if (authService.isLoggedIn()) {
		// Update UI for logged-in user
		const userImage = userInfo.querySelector("img");
		const userName = userInfo.querySelector("h3");

		userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;

		// Enable all profile navigation links
		profileLinks.forEach((link) => {
			link.classList.remove("disabled");
			link.style.opacity = 1;
			link.style.pointerEvents = "auto";
		});
	} else {
		// Update UI for guest user
		if (userInfo && userInfo.querySelector("h3")) {
			userInfo.querySelector("h3").textContent = "Guest User";
		}

		// Disable profile navigation links
		profileLinks.forEach((link) => {
			link.classList.add("disabled");
			link.style.opacity = 0.5;
			link.style.pointerEvents = "none";
		});
	}
}

/**
 * Retrieves the current user from session storage
 * Falls back to direct session storage access if authService is unavailable
 */
function getCurrentUser() {
	if (window.authService) {
		return authService.getCurrentUser();
	}
	return JSON.parse(sessionStorage.getItem("currentUser"));
}

/**
 * Handles user logout
 * Uses authService if available, otherwise falls back to basic logout
 */
function logout() {
	console.log("Logout function called");
	if (window.authService) {
		authService.logout();
	} else {
		sessionStorage.removeItem("currentUser");
		window.location.href = "../../views/login-page/index.html";
	}
}

// ------ Menu Interaction Functions ------

/**
 * Toggles the profile menu visibility and overlay
 */
function toggleMenu() {
	const isOpen = subMenu.classList.toggle("open-menu");
	overlay.classList.toggle("active", isOpen);
}

// Close menu when clicking outside
window.addEventListener("click", (event) => {
	if (
		!event.target.closest(".user-pic") &&
		!event.target.closest(".sub-menu-wrap")
	) {
		subMenu.classList.remove("open-menu");
		overlay.classList.remove("active");
	}
});

// Prevent menu from closing when clicking inside
const subMenuWrap = document.querySelector(".sub-menu-wrap");
if (subMenuWrap) {
	subMenuWrap.addEventListener("click", (e) => e.stopPropagation());
}

// Close menu on ESC key press
window.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		subMenu.classList.remove("open-menu");
		overlay.classList.remove("active");
	}
});
