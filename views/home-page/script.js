document.addEventListener("DOMContentLoaded", () => {
  const createGameBtn = document.getElementById("createGameBtn");
  const joinCodeInput = document.getElementById("joinCodeInput");
  const spectateCodeInput = document.getElementById("spectateCodeInput");

  createGameBtn?.addEventListener("click", () => {

    const user = JSON.parse(sessionStorage.getItem('currentUser'));
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

  joinCodeInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const user = JSON.parse(sessionStorage.getItem('currentUser'));
      const userId = user ? user.id : null;
      if (userId) {
        const code = joinCodeInput.value.trim();
        if (code !== "") {
          window.location.href = `/${code}`;
        }
      }
    }
  });

  spectateCodeInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const code = spectateCodeInput.value.trim();
      if (code !== "") {
        window.location.href = `/${code}?spectate=true`;
      }
    }
  });
});