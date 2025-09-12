document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // 🔹 Access helper: SuperAdmin always allowed
  function canAccessArchive(role) {
    if (role === "SuperAdmin") return true;
    return role === "Registrar"; // only Registrar otherwise
  }

  if (!canAccessArchive(user.role)) {
    alert("❌ Access denied");
    window.location.href = "/welcome.html";
    return;
  }

  const archiveList = document.getElementById("archiveList");
  const searchName = document.getElementById("searchName");
  const filterGrade = document.getElementById("filterGrade");
  const filterReason = document.getElementById("filterReason");
  const applyFiltersBtn = document.getElementById("applyFilters");
  const exportCsvBtn = document.getElementById("exportCsv");

  const statTotal = document.getElementById("statTotal");
  const statDropout = document.getElementById("statDropout");
  const statTransfer = document.getElementById("statTransfer");
  const statOthers = document.getElementById("statOthers");

  let allArchived = [];

  async function loadArchived() {
    try {
      const archived = await apiFetch("/api/enrollment/archived");
      allArchived = archived;
      updateStats(archived);
      renderArchived(archived);
    } catch (err) {
      console.error("Failed to load archives:", err);
      archiveList.innerHTML = "<p>⚠ Failed to load archived students.</p>";
    }
  }

  function updateStats(list) {
    statTotal.textContent = list.length;
    statDropout.textContent = list.filter((e) => e.archiveReason?.toLowerCase() === "dropout").length;
    statTransfer.textContent = list.filter((e) => e.archiveReason?.toLowerCase() === "transfer").length;
    statOthers.textContent = list.filter(
      (e) => e.archiveReason && !["dropout", "transfer"].includes(e.archiveReason.toLowerCase())
    ).length;
  }

  function renderArchived(list) {
    archiveList.innerHTML = "";

    if (!list.length) {
      archiveList.innerHTML = "<p>No archived students 🎉</p>";
      return;
    }

    list.forEach((student) => {
      const card = document.createElement("div");
      card.className = "archive-card";

      card.innerHTML = `
        <div class="summary">
          <h3>${student.name}</h3>
          <p><b>Grade:</b> ${student.yearLevel || "N/A"} | <b>Reason:</b> ${student.archiveReason || "Unknown"}</p>
        </div>
        <div class="details" style="display:none;">
          <p><b>LRN:</b> ${student.lrn}</p>
          <p><b>School Year:</b> ${student.schoolYear}</p>
          <div class="actions">
            <button class="restore-btn" data-id="${student._id}">♻ Restore</button>
          </div>
        </div>
      `;

      // Toggle details
      card.querySelector(".summary").addEventListener("click", () => {
        const details = card.querySelector(".details");
        details.style.display = details.style.display === "none" ? "block" : "none";
      });

      archiveList.appendChild(card);
    });
  }

  function applyFilters() {
    const search = searchName.value.toLowerCase();
    const grade = filterGrade.value;
    const reason = filterReason.value.toLowerCase();

    const filtered = allArchived.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(search);
      const matchesGrade = !grade || s.yearLevel?.toString() === grade;
      const matchesReason =
        !reason || (s.archiveReason && s.archiveReason.toLowerCase().includes(reason));
      return matchesName && matchesGrade && matchesReason;
    });

    updateStats(filtered);
    renderArchived(filtered);
  }

  applyFiltersBtn.addEventListener("click", applyFilters);

  archiveList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("restore-btn")) {
      const id = e.target.dataset.id;
      if (confirm("♻ Restore this student?")) {
        await apiFetch(`/api/enrollment/${id}/restore`, { method: "POST" });
        loadArchived();
      }
    }
  });

  // Export CSV
  exportCsvBtn.addEventListener("click", () => {
    if (!allArchived.length) return alert("⚠ No data to export");

    const csvRows = [
      ["Name", "LRN", "Grade", "Strand", "Reason", "School Year"].join(","),
      ...allArchived.map(
        (s) =>
          `"${s.name}","${s.lrn}","${s.yearLevel || ""}","${s.strand || ""}","${s.archiveReason || ""}","${s.schoolYear}"`
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "archived_students.csv";
    a.click();
  });

  // Initial load
  loadArchived();
});
