// auth.js (frontend helper)

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function getToken() {
  return localStorage.getItem("token") || null;
}

function requireLogin() {
  const user = getUser();
  if (!user) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// Export to global scope
window.Auth = { getUser, getToken, requireLogin, logout };
