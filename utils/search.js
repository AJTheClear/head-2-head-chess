/**
 * Search utility for H2H Chess
 * Provides search functionality that can be used across the site
 */

// Main search function that returns filtered results
function performSearch(query, data = null) {
	query = query.toLowerCase().trim();

	// If no data is provided, use default search data
	const searchData = data || getDefaultSearchData();

	// Filter results based on query
	return searchData.filter(
		(item) =>
			item.title.toLowerCase().includes(query) ||
			item.description.toLowerCase().includes(query)
	);
}

// Get default search data (mock data - replace with API call in production)
function getDefaultSearchData() {
	return [
		{
			title: "Magnus Carlsen",
			description: "World Chess Champion, ELO: 2850",
			icon: "../../assets/images/profile.png",
			url: "/players/magnus-carlsen",
			category: "player",
		},
		{
			title: "Queen's Gambit Opening",
			description: "Chess opening strategy",
			icon: "../../assets/images/profile.png",
			url: "/openings/queens-gambit",
			category: "opening",
		},
		{
			title: "Tournament Rules",
			description: "Official H2H Chess tournament guidelines",
			icon: "../../assets/images/help-web-button.png",
			url: "/rules/tournament",
			category: "help",
		},
		{
			title: "Nick Georgiev",
			description: "Chess player from Bulgaria, ELO: 1850",
			icon: "../../assets/images/profile.png",
			url: "/players/nick-georgiev",
			category: "player",
		},
		{
			title: "Sicilian Defense",
			description: "Popular chess opening strategy",
			icon: "../../assets/images/profile.png",
			url: "/openings/sicilian-defense",
			category: "opening",
		},
	];
}

// Format search results as HTML
function formatSearchResults(results, query = "") {
	if (results.length === 0) {
		return `
            <div class="search-results-empty">
                No results found for "${query}"
            </div>
        `;
	}

	// Group results by category
	const groupedResults = {};
	results.forEach((result) => {
		const category = result.category || "other";
		if (!groupedResults[category]) {
			groupedResults[category] = [];
		}
		groupedResults[category].push(result);
	});

	// Generate HTML for each category
	let html = "";
	Object.entries(groupedResults).forEach(([category, items]) => {
		// Add category header
		html += `<div class="search-category-header">${formatCategoryName(
			category
		)}</div>`;

		// Add items
		items.forEach((item) => {
			html += `
                <div class="search-result-item" data-url="${item.url}">
                    <div class="search-result-icon">
                        <img src="${item.icon}" width="20" height="20" alt="">
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">${item.title}</div>
                        <div class="search-result-description">${item.description}</div>
                    </div>
                </div>
            `;
		});
	});

	return html;
}

// Format category name
function formatCategoryName(category) {
	const categoryNames = {
		player: "Players",
		opening: "Chess Openings",
		help: "Help & Support",
		other: "Other Results",
	};

	return categoryNames[category] || "Results";
}

// Initialize search UI
function initSearchUI(inputSelector, resultsSelector) {
	const searchInput = document.querySelector(inputSelector);
	const searchResults = document.querySelector(resultsSelector);

	if (!searchInput || !searchResults) return;

	// Handle input changes
	searchInput.addEventListener("input", function () {
		const query = this.value.trim();

		if (query.length === 0) {
			// Show empty state
			searchResults.innerHTML = `
                <div class="search-results-empty">
                    Type to search for players, games, or tournaments
                </div>
            `;
		} else if (query.length >= 2) {
			// Perform search
			const results = performSearch(query);
			searchResults.innerHTML = formatSearchResults(results, query);

			// Add click handlers to results
			document.querySelectorAll(".search-result-item").forEach((item) => {
				item.addEventListener("click", function () {
					const url = this.getAttribute("data-url");
					handleSearchResultClick(url);
				});
			});
		}
	});
}

// Handle search result click
function handleSearchResultClick(url) {
	console.log("Navigating to:", url);
	// In a real implementation, navigate to the URL
	// window.location.href = url;

	// Close search overlay - this needs to be called from the navbar.js
	if (window.closeSearchOverlay) {
		window.closeSearchOverlay();
	}
}

// Export functions for use in other files
window.searchUtils = {
	performSearch,
	formatSearchResults,
	initSearchUI,
	handleSearchResultClick,
};
