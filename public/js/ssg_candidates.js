document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();
  if (!["SSG","Registrar", "SuperAdmin"].includes(user.role)) {
    alert("Access denied: SSG/Registrar only");
    window.location.href = "/welcome.html";
    return;
  }

  const form = document.getElementById("candidateForm");
  const list = document.getElementById("candidatesList");

  const loadCandidates = async () => {
    list.innerHTML = "Loading...";
    try {
      const data = await apiFetch("/api/ssg/candidates");
      if (!data.length) { list.innerHTML = "<p>No candidates yet.</p>"; return; }
      list.innerHTML = "";
      data.forEach(c => {
        const d = document.createElement("div");
        d.className = "candidate-card";
        d.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${c.photoUrl || '/images/avatar.png'}" alt="" style="width:64px;height:64px;border-radius:6px;object-fit:cover;">
            <div style="flex:1;">
              <strong>${c.name}</strong> — ${c.position}
              <div>Scope: ${c.scope}${c.target ? " / "+c.target : ""}</div>
            </div>
            <div>
              <button class="edit" data-id="${c._id}">Edit</button>
              <button class="del" data-id="${c._id}">Delete</button>
            </div>
          </div>
        `;
        list.appendChild(d);
      });
    } catch (err) {
      console.error(err);
      list.innerHTML = "<p>Failed to load candidates.</p>";
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", document.getElementById("name").value);
    fd.append("position", document.getElementById("position").value);
    fd.append("scope", document.getElementById("scope").value);
    fd.append("target", document.getElementById("target").value || "");
    const file = document.getElementById("photo").files[0];
    if (file) fd.append("photo", file);

    try {
      await apiFetch("/api/ssg/candidates", { method: "POST", body: fd });
      alert("Candidate created");
      form.reset();
      await loadCandidates();
    } catch (err) {
      console.error(err);
      alert("Failed to create candidate");
    }
  });

  list.addEventListener("click", async (e) => {
    if (e.target.classList.contains("del")) {
      const id = e.target.dataset.id;
      if (!confirm("Delete candidate?")) return;
      try {
        await apiFetch(`/api/ssg/candidates/${id}`, { method: "DELETE" });
        await loadCandidates();
      } catch (err) { console.error(err); alert("Delete failed"); }
    }
    if (e.target.classList.contains("edit")) {
      const id = e.target.dataset.id;
      const name = prompt("New name?");
      if (!name) return;
      try {
        await apiFetch(`/api/ssg/candidates/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
        await loadCandidates();
      } catch (err) { console.error(err); alert("Update failed"); }
    }
  });

  await loadCandidates();
});
