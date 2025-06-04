// simple-theme.js - Super minimal implementation
(function () {
	// Run when DOM is loaded
	document.addEventListener("DOMContentLoaded", function () {
		console.log("Simple theme JS loaded");

		// Get the toggle
		const themeToggle = document.getElementById("themeToggle");
		if (!themeToggle) {
			console.error("Theme toggle not found");
			return;
		}

		// Set up toggle function
		function toggleTheme() {
			// Check if toggle is checked
			const isDark = themeToggle.checked;

			// Apply or remove dark class
			document.body.classList.toggle("dark", isDark);

			// Store preference
			localStorage.setItem("isDark", isDark ? "true" : "false");

			console.log("Theme toggled to:", isDark ? "dark" : "light");
		}

		// Set initial state from localStorage
		const savedIsDark = localStorage.getItem("isDark") === "true";
		themeToggle.checked = savedIsDark;

		// Apply initial theme
		document.body.classList.toggle("dark", savedIsDark);

		// Set up event listener - use click not change
		themeToggle.addEventListener("click", toggleTheme);

		console.log("Theme toggle initialized with state:", savedIsDark);
	});
})();
