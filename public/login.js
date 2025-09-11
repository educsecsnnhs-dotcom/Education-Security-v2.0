// public/login.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js loaded ✅");

  const form = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const t = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", t);
      togglePassword.textContent = t === "password" ? "👁️" : "🙈";
    });
  }

  if (!form) {
    console.error("loginForm not found in DOM");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailOrUsername = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();

    if (!emailOrUsername || !password) {
      alert("Please fill both fields");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ " + (data.message || "Login failed"));
        return;
      }

      // save minimal user info
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("✅ Login successful!");
      window.location.href = "welcome.html";
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Network error. Please try again.");
    }
  });
});
