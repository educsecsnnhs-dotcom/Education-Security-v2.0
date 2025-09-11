// script.js
// Shared helpers: Caesar cipher + fetch wrapper

// ==========================
//  Caesar Cipher (Password)
// ==========================
function caesarEncrypt(text, shift = 7) {
  return text
    .split("")
    .map(char => {
      const code = char.charCodeAt(0);
      // Uppercase A–Z
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // Lowercase a–z
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      // Digits 0–9
      if (code >= 48 && code <= 57) {
        return String.fromCharCode(((code - 48 + shift) % 10) + 48);
      }
      return char;
    })
    .join("");
}

// ==========================
//  Fetch Wrapper
// ==========================
async function apiFetch(url, options = {}) {
  const token = Auth.getToken();
  const defaultHeaders = { "Content-Type": "application/json" };
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
  options.headers = { ...defaultHeaders, ...(options.headers || {}) };

  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

// ==========================
//  Logout Handler
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.logout();
    });
  }
});
