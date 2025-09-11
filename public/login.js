// public/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // 👁️ Toggle password visibility
  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.textContent = type === "password" ? "👁️" : "🙈";
    });
  }

  // 📌 Form submit
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // ✅ stop page refresh

      const emailOrUsername = document.getElementById("username").value.trim();
      const password = passwordInput.value.trim();

      if (!emailOrUsername || !password) {
        alert("❌ Please enter both username/email and password");
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrUsername, password }), // ✅ backend expects this
        });

        const data = await res.json();

        if (!res.ok) {
          alert("❌ " + (data.message || "Login failed"));
          return;
        }

        // Save user in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("✅ Login successful!");
        window.location.href = "welcome.html"; // ✅ redirect after login
      } catch (err) {
        console.error("Login error:", err);
        alert("❌ Network error. Please try again.");
      }
    });
  }
});
