// registrar.js
document.addEventListener("DOMContentLoaded", () => {
  Auth.requireLogin();
  const user = Auth.getUser();
  if (user.role !== "Registrar" && user.role !== "SuperAdmin") {
    alert("Access denied. Registrar only.");
    window.location.href = "/welcome.html";
    return;
  }

  const enrolledCountEl = document.getElementById("enrolledCount");
  const pendingCountEl = document.getElementById("pendingCount");
  const pendingTable = document.getElementById("pendingTable");
  const sectionList = document.getElementById("sectionList");
  const sectionForm = document.getElementById("sectionForm");

  // Load dashboard data
  async function loadStats() {
    const stats = await apiFetch("/api/registrar/stats");
    enrolledCountEl.textContent = stats.enrolled || 0;
    pendingCountEl.textContent = stats.pending || 0;
  }

  async function loadPending() {
    pendingTable.innerHTML = "";
    const enrollees = await apiFetch("/api/registrar/pending");

    enrollees.forEach(enrollee => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${enrollee.name}</td>
        <td>${enrollee.lrn}</td>
        <td>${enrollee.level}</td>
        <td>${enrollee.strand}</td>
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

    // Bind approve/reject
    document.querySelectorAll(".approveBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const section = document.getElementById(`section-${id}`).value;
        if (!section) return alert("Please assign a section.");
        await apiFetch(`/api/registrar/approve/${id}`, {
          method: "POST",
          body: JSON.stringify({ section }),
        });
        loadStats();
        loadPending();
      });
    });

    document.querySelectorAll(".rejectBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await apiFetch(`/api/registrar/reject/${id}`, { method: "POST" });
        loadStats();
        loadPending();
      });
    });
  }

  async function loadSections() {
    sectionList.innerHTML = "";
    const sections = await apiFetch("/api/registrar/sections");
    sections.forEach(sec => {
      const li = document.createElement("li");
      li.textContent = `${sec.level.toUpperCase()} - ${sec.strand} - Section ${sec.section} (Limit: ${sec.limit})`;
      sectionList.appendChild(li);
    });
  }

  // Handle new section form
  sectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(sectionForm));
    await apiFetch("/api/registrar/sections", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    sectionForm.reset();
    loadSections();
  });

  // Init load
  loadStats();
  loadPending();
  loadSections();
});
