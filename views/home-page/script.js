/**
 * Home Page Game Controls
 * Handles game creation, joining, and spectating functionality
 */
document.addEventListener("DOMContentLoaded", () => {
	// DOM Elements
	const createGameBtn = document.getElementById("createGameBtn");
	const joinCodeInput = document.getElementById("joinCodeInput");
	const spectateCodeInput = document.getElementById("spectateCodeInput");

	/**
	 * Create New Game
	 * Redirects to new game page if user is authenticated
	 */
	createGameBtn?.addEventListener("click", () => {
		const user = JSON.parse(sessionStorage.getItem("currentUser"));
		const userId = user ? user.id : null;
		console.log(userId);
		if (userId) {
			fetch("/", {
				method: "POST",
			}).then((res) => {
				if (res.redirected) {
					window.location.href = res.url;
				}
			});
		}
	});

	/**
	 * Join Game Handler
	 * Redirects to game page with entered code if user is authenticated
	 */
	joinCodeInput?.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			const user = JSON.parse(sessionStorage.getItem("currentUser"));
			const userId = user ? user.id : null;
			if (userId) {
				const code = joinCodeInput.value.trim();
				if (code !== "") {
					window.location.href = `/${code}`;
				}
			}
		}
	});

	/**
	 * Spectate Game Handler
	 * Redirects to game page in spectator mode
	 */
	spectateCodeInput?.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			const code = spectateCodeInput.value.trim();
			if (code !== "") {
				window.location.href = `/${code}?spectate=true`;
			}
		}
	});
});
