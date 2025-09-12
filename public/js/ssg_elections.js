// ssg-results.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // Access control
  if (!["SSG", "Registrar", "SuperAdmin"].includes(user.role)) {
    alert("Access denied: SSG/Registrar only");
    window.location.href = "/welcome.html";
    return;
  }

  // UI refs
  const scopeEl = document.getElementById("scope");
  const targetEl = document.getElementById("target");
  const positionFilter = document.getElementById("positionFilter");
  const applyBtn = document.getElementById("apply");
  const resultsDiv = document.getElementById("results");
  const exportBtn = document.getElementById("exportCsv");

  /* ---------------- Load Positions ---------------- */
  async function loadPositions() {
    try {
      const cands = await apiFetch("/api/ssg/candidates");
      if (!cands || !cands.length) {
        positionFilter.innerHTML = `<option value="">All positions</option>`;
        return;
      }
      const positions = Array.from(new Set(cands.map(c => c.position).filter(Boolean)));
      positionFilter.innerHTML =
        `<option value="">All positions</option>` +
        positions.map(p => `<option value="${p}">${p}</option>`).join("");
    } catch (err) {
      console.error("❌ Failed to load positions:", err);
      alert("⚠️ Could not load candidate positions.");
    }
  }

  /* ---------------- Load Results ---------------- */
  async function loadResults() {
    resultsDiv.innerHTML = "Loading...";
    try {
      const qs = new URLSearchParams();
      if (scopeEl.value) qs.set("scope", scopeEl.value);
      if (targetEl.value) qs.set("target", targetEl.value);
      if (positionFilter.value) qs.set("position", positionFilter.value);

      const url = "/api/ssg/results?" + qs.toString();
      const res = await apiFetch(url);

      resultsDiv.innerHTML = "";
      if (!res.results || !res.results.length) {
        resultsDiv.innerHTML = "<p>No results yet.</p>";
        return;
      }

      res.results.forEach(r => {
        const el = document.createElement("div");
        el.className = "result-row";
        el.innerHTML = `
          <div style="display:flex;gap:12px;align-items:center;">
            <img src="${r.candidate?.photoUrl || "/images/avatar.png"}"
                 alt=""
                 style="width:48px;height:48px;border-radius:6px;object-fit:cover;">
            <div>
              <strong>${r.candidate?.name || "Unknown"}</strong> — ${r.candidate?.position || "-"}
              <div>Votes: ${r.votes ?? 0}</div>
            </div>
          </div>
        `;
        resultsDiv.appendChild(el);
      });
    } catch (err) {
      console.error("❌ Failed to load results:", err);
      resultsDiv.innerHTML = "<p>⚠️ Error loading results.</p>";
    }
  }

  /* ---------------- Event Listeners ---------------- */
  applyBtn.addEventListener("click", loadResults);

  exportBtn.addEventListener("click", () => {
    const qs = new URLSearchParams();
    if (scopeEl.value) qs.set("scope", scopeEl.value);
    if (targetEl.value) qs.set("target", targetEl.value);
    if (positionFilter.value) qs.set("position", positionFilter.value);

    const url = "/api/ssg/results/export?" + qs.toString();
    // Trigger download
    window.location.href = url;
  });

  /* ---------------- Init ---------------- */
  await loadPositions();
  await loadResults();
});
