// public/register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const t = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", t);
      togglePassword.textContent = t === "password" ? "👁️" : "🙈";
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    if (!fullName || !email || !password) {
      alert("Please fill all fields");
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
      alert("❌ Network error. Please try again.");
    }
  });
});
