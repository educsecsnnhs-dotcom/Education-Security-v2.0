const Auth = {
  async requireLogin() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Not logged in");
      return await res.json();
    } catch {
      window.location.href = "/index.html"; // back to login
    }
  },

  async getUser() {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/index.html";
  }
};
