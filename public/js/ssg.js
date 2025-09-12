// ssg.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (!["SSG", "Admin", "SuperAdmin"].includes(user.role)) {
    alert("Access denied. SSG/Admin only.");
    window.location.href = "/welcome.html";
    return;
  }

  /* ---------------- Tabs ---------------- */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  /* ---------------- Candidate Management ---------------- */
  const candidateForm = document.getElementById("candidateForm");
  const candidatesTable = document.getElementById("candidatesTable");

  async function loadCandidates() {
    candidatesTable.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;
    try {
      const data = await apiFetch("/api/ssg/candidates");
      if (!data || !data.length) {
        candidatesTable.innerHTML = `<tr><td colspan="4">No candidates yet.</td></tr>`;
        return;
      }
      candidatesTable.innerHTML = "";
      data.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.name}</td>
          <td>${c.position}</td>
          <td>${c.level}</td>
          <td>
            <button class="edit" data-id="${c._id}">✏ Edit</button>
            <button class="delete" data-id="${c._id}">🗑 Delete</button>
          </td>
        `;
        candidatesTable.appendChild(tr);
      });

      // Edit candidate
      candidatesTable.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", () => {
          const cand = data.find(c => c._id === btn.dataset.id);
          if (!cand) return;
          document.getElementById("candName").value = cand.name;
          document.getElementById("candPosition").value = cand.position;
          document.getElementById("candLevel").value = cand.level;
          candidateForm.dataset.editing = cand._id;
        });
      });

      // Delete candidate
      candidatesTable.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (!confirm("Delete this candidate?")) return;
          try {
            await apiFetch(`/api/ssg/candidates/${btn.dataset.id}`, { method: "DELETE" });
            loadCandidates();
          } catch (err) {
            alert("❌ Failed to delete candidate.");
          }
        });
      });

    } catch (err) {
      console.error(err);
      candidatesTable.innerHTML = `<tr><td colspan="4">⚠️ Error loading candidates</td></tr>`;
    }
  }

  candidateForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("candName").value.trim();
    const position = document.getElementById("candPosition").value.trim();
    const level = document.getElementById("candLevel").value;

    if (!name || !position || !level) {
      alert("Please fill all fields.");
      return;
    }

    const payload = { name, position, level };

    try {
      if (candidateForm.dataset.editing) {
        await apiFetch(`/api/ssg/candidates/${candidateForm.dataset.editing}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        delete candidateForm.dataset.editing;
      } else {
        await apiFetch("/api/ssg/candidates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      candidateForm.reset();
      loadCandidates();
    } catch (err) {
      alert("❌ Failed to save candidate.");
    }
  });

  /* ---------------- Election Monitoring ---------------- */
  const electionsTable = document.getElementById("electionsTable");

  async function loadElections() {
    electionsTable.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;
    try {
      const data = await apiFetch("/api/ssg/results");
      if (!data || !data.length) {
        electionsTable.innerHTML = `<tr><td colspan="3">No election data yet.</td></tr>`;
        return;
      }
      electionsTable.innerHTML = "";
      data.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.name}</td>
          <td>${r.position}</td>
          <td>${r.votes}</td>
        `;
        electionsTable.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      electionsTable.innerHTML = `<tr><td colspan="3">⚠️ Error loading results</td></tr>`;
    }
  }

  /* ---------------- Officers ---------------- */
  const officersTable = document.getElementById("officersTable");

  async function loadOfficers() {
    officersTable.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;
    try {
      const data = await apiFetch("/api/ssg/officers");
      if (!data || !data.length) {
        officersTable.innerHTML = `<tr><td colspan="3">No officers yet.</td></tr>`;
        return;
      }
      officersTable.innerHTML = "";
      data.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${o.name}</td>
          <td>${o.position}</td>
          <td>${o.department || "-"}</td>
        `;
        officersTable.appendChild(tr);
      });
    } catch (err) {
      console.error(err);
      officersTable.innerHTML = `<tr><td colspan="3">⚠️ Error loading officers</td></tr>`;
    }
  }

  /* ---------------- Auto-refresh ---------------- */
  await loadCandidates();
  await loadElections();
  await loadOfficers();

  setInterval(() => {
    loadElections();
    loadOfficers();
  }, 60000); // refresh every 60s
});
