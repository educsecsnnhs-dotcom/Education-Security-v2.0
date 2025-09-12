document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();
  if (!["SSG","Registrar"].includes(user.role)) {
    alert("Access denied: SSG/Registrar only");
    window.location.href = "../welcome.html";
    return;
  }

  const scopeEl = document.getElementById("scope");
  const targetEl = document.getElementById("target");
  const positionFilter = document.getElementById("positionFilter");
  const applyBtn = document.getElementById("apply");
  const resultsDiv = document.getElementById("results");
  const exportBtn = document.getElementById("exportCsv");

  async function loadPositions() {
    const cands = await apiFetch("/api/ssg/candidates");
    const positions = Array.from(new Set(cands.map(c => c.position)));
    positionFilter.innerHTML = `<option value="">All positions</option>` + positions.map(p => `<option value="${p}">${p}</option>`).join("");
  }

  async function loadResults() {
    resultsDiv.innerHTML = "Loading...";
    const qs = new URLSearchParams();
    if (scopeEl.value) qs.set("scope", scopeEl.value);
    if (targetEl.value) qs.set("target", targetEl.value);
    if (positionFilter.value) qs.set("position", positionFilter.value);
    const url = "/api/ssg/results?" + qs.toString();
    const res = await apiFetch(url);
    resultsDiv.innerHTML = "";
    if (!res.results || !res.results.length) { resultsDiv.innerHTML = "<p>No results yet.</p>"; return; }

    res.results.forEach(r => {
      const el = document.createElement("div");
      el.className = "result-row";
      el.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;">
          <img src="${r.candidate.photoUrl || '/images/avatar.png'}" style="width:48px;height:48px;border-radius:6px;object-fit:cover;">
          <div>
            <strong>${r.candidate.name}</strong> — ${r.candidate.position}
            <div>Votes: ${r.votes}</div>
          </div>
        </div>
      `;
      resultsDiv.appendChild(el);
    });
  }

  applyBtn.addEventListener("click", loadResults);
  exportBtn.addEventListener("click", async () => {
    const qs = new URLSearchParams();
    if (scopeEl.value) qs.set("scope", scopeEl.value);
    if (targetEl.value) qs.set("target", targetEl.value);
    if (positionFilter.value) qs.set("position", positionFilter.value);
    const url = "/api/ssg/results/export?" + qs.toString();
    window.location.href = url;
  });

  await loadPositions();
  await loadResults();
});
