// public/auth.js
const Auth = {
  getToken() {
    return localStorage.getItem("token") || null;
  },

  setToken(token) {
    localStorage.setItem("token", token);
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  },

  requireLogin() {
    if (!this.getToken()) {
      window.location.href = "login.html";
    }
  }
};

// For index.html redirect check
function getUserSession() {
  const token = Auth.getToken();
  return token ? { token } : null;
}
