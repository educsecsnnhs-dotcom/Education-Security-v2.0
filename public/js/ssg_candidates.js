// ssg-registrar-candidates.js
document.addEventListener("DOMContentLoaded", () => {
  checkAccess(["SSG". "Registrar"], { redirectTo: "/welcome.html" });
  }

  const form = document.getElementById("candidateForm");
  const list = document.getElementById("candidatesList");

  /* ---------------- Load Candidates ---------------- */
  async function loadCandidates() {
    list.innerHTML = "Loading...";
    try {
      const data = await apiFetch("/api/ssg/candidates");
      if (!data || !data.length) {
        list.innerHTML = "<p>No candidates yet.</p>";
        return;
      }
      list.innerHTML = "";
      data.forEach(c => {
        const d = document.createElement("div");
        d.className = "candidate-card";
        d.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${c.photoUrl || "/images/avatar.png"}" 
                 alt="" 
                 style="width:64px;height:64px;border-radius:6px;object-fit:cover;">
            <div style="flex:1;">
              <strong>${c.name}</strong> — ${c.position}
              <div>Scope: ${c.scope}${c.target ? " / " + c.target : ""}</div>
            </div>
            <div>
              <button class="edit" data-id="${c._id}">✏ Edit</button>
              <button class="del" data-id="${c._id}">🗑 Delete</button>
            </div>
          </div>
        `;
        list.appendChild(d);
      });
    } catch (err) {
      console.error("❌ Error loading candidates:", err);
      list.innerHTML = "<p>⚠️ Failed to load candidates.</p>";
    }
  }

  /* ---------------- Create / Update Candidate ---------------- */
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(form);

    try {
      if (form.dataset.editing) {
        // Update existing
        await apiFetch(`/api/ssg/candidates/${form.dataset.editing}`, {
          method: "PUT",
          body: fd
        });
        delete form.dataset.editing;
        alert("✅ Candidate updated");
      } else {
        // Create new
        await apiFetch("/api/ssg/candidates", {
          method: "POST",
          body: fd
        });
        alert("✅ Candidate created");
      }

      form.reset();
      await loadCandidates();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Failed to save candidate");
    }
  });

  /* ---------------- Delete / Edit Buttons ---------------- */
  list.addEventListener("click", async e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("del")) {
      if (!confirm("Delete candidate?")) return;
      try {
        await apiFetch(`/api/ssg/candidates/${id}`, { method: "DELETE" });
        await loadCandidates();
      } catch (err) {
        console.error("❌ Delete failed:", err);
        alert("Delete failed");
      }
    }

    if (e.target.classList.contains("edit")) {
      try {
        const cand = await apiFetch(`/api/ssg/candidates/${id}`);
        if (!cand) return;

        // Pre-fill form
        document.getElementById("name").value = cand.name;
        document.getElementById("position").value = cand.position;
        document.getElementById("scope").value = cand.scope;
        document.getElementById("target").value = cand.target || "";

        form.dataset.editing = id;
        window.scrollTo({ top: form.offsetTop, behavior: "smooth" });
      } catch (err) {
        console.error("❌ Failed to fetch candidate:", err);
        alert("Edit failed");
      }
    }
  });

  /* ---------------- Init ---------------- */
  await loadCandidates();
});
