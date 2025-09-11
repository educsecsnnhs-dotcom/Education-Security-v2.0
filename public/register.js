document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // 👁️ Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });

  // 📌 Form submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("username").value.trim(); // ✅ match backend
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }), // ✅ correct field name
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ " + (data.message || "Registration failed"));
        return;
      }

      alert("✅ Registered successfully! Please login.");
      window.location.href = "login.html";
    } catch (err) {
      console.error("Network error:", err);
      alert("❌ Network error. Please try again.");
    }
  });
});
