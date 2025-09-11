document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      togglePassword.textContent = type === "password" ? "👁️" : "🙈";
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value.trim();

      if (!fullName || !email || !password) {
        alert("⚠️ All fields are required");
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert("❌ " + (data.message || "Registration failed"));
          return;
        }

        alert("✅ Registered successfully! Please log in.");
        window.location.href = "login.html";
      } catch (err) {
        console.error("Register error:", err);
        alert("❌ Network error. Try again.");
      }
    });
  }
});
