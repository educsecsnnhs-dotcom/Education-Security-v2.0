// js/auth.js

// Handle Registration
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch("https://education-security-v2-0.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Registration failed");
        }

        const data = await res.json();
        alert("✅ Registration successful! Please log in.");
        window.location.href = "login.html";
      } catch (err) {
        console.error("Registration error:", err);
        alert("❌ " + err.message);
      }
    });
  }

  // Handle Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch("https://education-security-v2-0.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        alert("✅ Login successful!");
        window.location.href = "welcome.html";
      } catch (err) {
        console.error("Login error:", err);
        alert("❌ " + err.message);
      }
    });
  }
});
