// Handle logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Simple vanilla logout (destroy session)
      fetch("/api/auth/logout", { method: "POST" })
        .then(() => {
          window.location.href = "login.html";
        })
        .catch(err => console.error("Logout failed:", err));
    });
  }
});
