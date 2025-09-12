// public/js/registrar.js
document.addEventListener("DOMContentLoaded", () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // ✅ Allow only Registrar and SuperAdmin
  if (!["Registrar", "SuperAdmin"].includes(user.role)) {
    alert("❌ Access denied. Registrar only.");
    window.location.href = "/welcome.html";
    return;
  }

  const enrolledCountEl = document.getElementById("enrolledCount");
  const pendingCountEl = document.getElementById("pendingCount");
  const pendingTable = document.getElementById("pendingTable");
  const sectionList = document.getElementById("sectionList");
  const sectionForm = document.getElementById("sectionForm");

  // 🔹 Load dashboard data
  async function loadStats() {
    try {
      const stats = await apiFetch("/api/registrar/stats");
      enrolledCountEl.textContent = stats.enrolled || 0;
      pendingCountEl.textContent = stats.pending || 0;
    } catch (err) {
      console.error("Error loading stats:", err);
      enrolledCountEl.textContent = "⚠️";
      pendingCountEl.textContent = "⚠️";
    }
  }

  // 🔹 Load pending enrollees
  async function loadPending() {
    pendingTable.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
    try {
      const enrollees = await apiFetch("/api/registrar/pending");
      pendingTable.innerHTML = "";

      if (!enrollees.length) {
        pendingTable.innerHTML = `<tr><td colspan="7">✅ No pending enrollees</td></tr>`;
        return;
      }

      enrollees.forEach(enrollee => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${enrollee.name}</td>
          <td>${enrollee.lrn}</td>
          <td>${enrollee.level}</td>
          <td>${enrollee.strand || "-"}</td>
          <td>${enrollee.schoolYear}</td>
          <td>
            <input type="text" id="section-${enrollee._id}" placeholder="Section">
          </td>
          <td>
            <button data-id="${enrollee._id}" class="approveBtn">✅ Approve</button>
            <button data-id="${enrollee._id}" class="rejectBtn">❌ Reject</button>
          </td>
        `;
        pendingTable.appendChild(tr);
      });

      // Approve
      document.querySelectorAll(".approveBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          const section = document.getElementById(`section-${id}`).value.trim();
          if (!section) return alert("⚠️ Please assign a section first.");
          try {
            await apiFetch(`/api/registrar/approve/${id}`, {
              method: "POST",
              body: JSON.stringify({ section }),
            });
            alert("✅ Enrollee approved");
            await loadStats();
            await loadPending();
          } catch (err) {
            console.error("Approve error:", err);
            alert("❌ Failed to approve enrollee");
          }
        });
      });

      // Reject
      document.querySelectorAll(".rejectBtn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (!confirm("❌ Reject this enrollee?")) return;
          try {
            await apiFetch(`/api/registrar/reject/${id}`, { method: "POST" });
            alert("✅ Enrollee rejected");
            await loadStats();
            await loadPending();
          } catch (err) {
            console.error("Reject error:", err);
            alert("❌ Failed to reject enrollee");
          }
        });
      });
    } catch (err) {
      console.error("Error loading pending enrollees:", err);
      pendingTable.innerHTML = `<tr><td colspan="7">⚠️ Error loading pending enrollees</td></tr>`;
    }
  }

  // 🔹 Load sections list
  async function loadSections() {
    sectionList.innerHTML = `<li>Loading...</li>`;
    try {
      const sections = await apiFetch("/api/registrar/sections");
      sectionList.innerHTML = "";

      if (!sections.length) {
        sectionList.innerHTML = `<li>No sections created yet</li>`;
        return;
      }

      sections.forEach(sec => {
        const li = document.createElement("li");
        li.textContent = `${sec.level.toUpperCase()} - ${sec.strand} - Section ${sec.section} (Limit: ${sec.limit})`;
        sectionList.appendChild(li);
      });
    } catch (err) {
      console.error("Error loading sections:", err);
      sectionList.innerHTML = `<li>⚠️ Error loading sections</li>`;
    }
  }

  // 🔹 Handle new section form
  sectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(sectionForm));
    try {
      await apiFetch("/api/registrar/sections", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      alert("✅ Section created");
      sectionForm.reset();
      await loadSections();
    } catch (err) {
      console.error("Section create error:", err);
      alert("❌ Failed to create section");
    }
  });

  // 🔹 Initial load
  loadStats();
  loadPending();
  loadSections();
});
