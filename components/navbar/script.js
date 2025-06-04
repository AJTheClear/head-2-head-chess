const subMenu = document.getElementById("subMenu");
const searchOverlay = document.getElementById("searchOverlay");
const overlay = document.getElementById("overlay");

// Initialize authentication-related elements
document.addEventListener("DOMContentLoaded", function () {
	// Check if authService exists
	if (typeof authService === "undefined") {
		console.error(
			"authService is not defined. Make sure auth.js is loaded correctly."
		);
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

	// Check authentication state and update UI
	updateNavbarForAuthState();

	// Add event listener for logout button
	const logoutLink = document.querySelector(
		".sub-menu-link.logout-link.logout"
	);
	if (logoutLink) {
		logoutLink.addEventListener("click", function (e) {
			e.preventDefault();
			logout();
		});
	}

	// Initialize search functionality
	if (window.searchUtils) {
		// Initialize search UI
		window.searchUtils.initSearchUI("#searchInput", "#searchResults");

		// Expose function to close search overlay
		window.closeSearchOverlay = function () {
			searchOverlay.classList.remove("active");
			overlay.classList.remove("active");
		};
	}
});

// Update navbar based on authentication state
function updateNavbarForAuthState() {
	const userPic = document.querySelector(".user-pic");
	const userInfo = document.querySelector(".user-info");
	const profileLinks = document.querySelectorAll(
		".sub-menu-link:not(.logout-link)"
	);

	// Get current user
	const currentUser = getCurrentUser();

	if (currentUser) {
		// User is logged in
		if (userInfo) {
			const userImage = userInfo.querySelector("img");
			const userName = userInfo.querySelector("h3");

			// Update user name
			if (userName) {
				userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
			}
		}

		// Enable profile links
		profileLinks.forEach((link) => {
			link.classList.remove("disabled");
			link.style.opacity = 1;
			link.style.pointerEvents = "auto";
		});
	} else {
		// User is not logged in
		if (userInfo && userInfo.querySelector("h3")) {
			userInfo.querySelector("h3").textContent = "Guest User";
		}

		// Disable profile links except logout
		profileLinks.forEach((link) => {
			link.classList.add("disabled");
			link.style.opacity = 0.5;
			link.style.pointerEvents = "none";
		});
	}
}

// Get current user from session storage
function getCurrentUser() {
	if (window.authService) {
		return authService.getCurrentUser();
	}

	return JSON.parse(sessionStorage.getItem("currentUser"));
}

// Logout function
function logout() {
	console.log("Logout function called");
	// Use authService if available
	if (window.authService) {
		authService.logout();
	} else {
		// Fallback
		sessionStorage.removeItem("currentUser");
		window.location.href = "../../views/login-page/index.html";
	}
}

// ------ Toggle Functions ------
function toggleMenu() {
	const isOpen = subMenu.classList.toggle("open-menu");
	overlay.classList.toggle("active", isOpen);
	if (isOpen && searchOverlay.classList.contains("active")) {
		searchOverlay.classList.remove("active");
	}
}

// Enhanced search functionality
function toggleSearch() {
	const isOpen = searchOverlay.classList.toggle("active");
	overlay.classList.toggle("active", isOpen);

	if (isOpen) {
		// Focus the search input when opened
		setTimeout(() => {
			document.getElementById("searchInput").focus();
		}, 100);

		// Close the profile menu if it's open
		if (subMenu.classList.contains("open-menu")) {
			subMenu.classList.remove("open-menu");
		}
	}
}

// Close dropdown or search when clicking outside
window.addEventListener("click", (event) => {
	// Check if we're clicking outside the search container
	if (
		searchOverlay.classList.contains("active") &&
		!event.target.closest(".search-container") &&
		!event.target.closest(".search-icon")
	) {
		searchOverlay.classList.remove("active");
		overlay.classList.remove("active");
	}

	// Check if we're clicking outside the profile menu
	if (
		!event.target.closest(".user-pic") &&
		!event.target.closest(".sub-menu-wrap")
	) {
		subMenu.classList.remove("open-menu");
		// Also remove the overlay/blur effect
		overlay.classList.remove("active");
	}
});

// Prevent inside clicks from closing menus

const subMenuWrap = document.querySelector(".sub-menu-wrap");
if (subMenuWrap) {
	subMenuWrap.addEventListener("click", (e) => e.stopPropagation());
}

const searchOverlayEl = document.querySelector(".search-container");
if (searchOverlayEl) {
	searchOverlayEl.addEventListener("click", (e) => e.stopPropagation());
}

// Close on ESC key
window.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		subMenu.classList.remove("open-menu");
		searchOverlay.classList.remove("active");
		overlay.classList.remove("active");
	}
});

// allow search.js to close the overlay when a result is clicked
window.closeSearchOverlay = function () {
	searchOverlay.classList.remove("active");
	overlay.classList.remove("active");
};
