// public/register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // 👁️ Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.textContent = type === "password" ? "👁️" : "🙈";
    });
  }

  if (!form) return;

  // 📌 Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    if (!fullName || !email || !password) {
      alert("❌ Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }), // ✅ backend handles encryption
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
