document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });

  // Handle login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("⚠️ Email and password are required");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("❌ " + (data.message || "Login failed"));
        return;
      }

      // Save user info in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("✅ Login successful!");
      window.location.href = "welcome.html"; // or dashboard
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Network error. Try again.");
    }
  });
});
