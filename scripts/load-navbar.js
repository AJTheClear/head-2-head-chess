document.addEventListener("DOMContentLoaded", async () => {
	try {
		// Load the HTML content of the Navbar
		const response = await fetch("/components/navbar/index.html");
		if (!response.ok) {
			throw new Error("Failed to fetch navbar");
		}
		const navbarHTML = await response.text();
		const navbarContainer = document.getElementById("navbar-container");

		if (navbarContainer) {
			navbarContainer.innerHTML = navbarHTML;

			// Dynamically load styles
			if (!document.querySelector('link[href*="navbar/styles.css"]')) {
				const navbarCSS = document.createElement("link");
				navbarCSS.rel = "stylesheet";
				navbarCSS.href = "/components/navbar/styles.css";
				document.head.appendChild(navbarCSS);
			}

			// Dynamically load script
			if (!document.querySelector('script[src*="navbar/script.js"]')) {
				const navbarScript = document.createElement("script");
				navbarScript.src = "/components/navbar/script.js";
				document.body.appendChild(navbarScript);
			}
			
		} else {
			console.error("Navbar container not found in the document");
		}
	} catch (error) {
		console.error("Error loading navbar:", error);

		// Fallback: try loading navbar directly
		try {
			document.getElementById("navbar-container").innerHTML = `
				<nav class="navbar">
					<div class="logo">
						<a href="../../views/home-page/index.html">H2H Chess</a>
					</div>
					<ul class="nav-links">
						<li><a href="../../views/play-page/index.html">Play</a></li>
						<li><a href="../../views/about-page/index.html">About</a></li>
					</ul>
					<div class="nav-right">
						<img src="../../assets/images/search.png" class="search-icon" onclick="toggleSearch()">
						<img src="../../assets/images/SungJinWoo_ProfilePic.png" class="user-pic" onclick="toggleMenu()">
					</div>
				</nav>`;
		} catch (fallbackError) {
			console.error("Error applying fallback navbar:", fallbackError);
		}
	}
});
