document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // Only Registrar or SuperAdmin can access
  if (!["Registrar", "SuperAdmin"].includes(user.role)) {
    alert("❌ Access denied");
    window.location.href = "../welcome.html";
    return;
  }

  const enrolleeList = document.getElementById("enrolleeList");
  const searchName = document.getElementById("searchName");
  const filterLevel = document.getElementById("filterLevel");
  const filterStrand = document.getElementById("filterStrand");
  const applyFiltersBtn = document.getElementById("applyFilters");

  const statTotal = document.getElementById("statTotal");
  const statJunior = document.getElementById("statJunior");
  const statSenior = document.getElementById("statSenior");

  let allEnrollees = [];

  async function loadEnrollees() {
    try {
      const enrollees = await apiFetch("/api/enrollment/pending");
      allEnrollees = enrollees;
      updateStats(enrollees);
      renderEnrollees(enrollees);
    } catch (err) {
      console.error("Failed to load enrollees:", err);
      enrolleeList.innerHTML = "<p>⚠ Failed to load pending enrollees.</p>";
    }
  }

  function updateStats(list) {
    statTotal.textContent = list.length;
    statJunior.textContent = list.filter((e) => e.level === "junior").length;
    statSenior.textContent = list.filter((e) => e.level === "senior").length;
  }

  function renderEnrollees(list) {
    enrolleeList.innerHTML = "";

    if (!list.length) {
      enrolleeList.innerHTML = "<p>No pending enrollees ✅</p>";
      return;
    }

    list.forEach((enrollee) => {
      const card = document.createElement("div");
      card.className = "enrollee-card";

      card.innerHTML = `
        <div class="summary">
          <h3>${enrollee.name}</h3>
          <p><b>Level:</b> ${enrollee.level.toUpperCase()} 
             ${enrollee.strand ? ` - ${enrollee.strand}` : ""}</p>
        </div>
        <div class="details" style="display:none;">
          <p><b>LRN:</b> ${enrollee.lrn}</p>
          <p><b>School Year:</b> ${enrollee.schoolYear}</p>

          <h4>📂 Uploaded Documents:</h4>
          <ul>
            ${
              enrollee.documents?.reportCard
                ? `<li><a href="/uploads/enrollments/${enrollee.documents.reportCard}" target="_blank">📄 Report Card</a></li>`
                : ""
            }
            ${
              enrollee.documents?.goodMoral
                ? `<li><a href="/uploads/enrollments/${enrollee.documents.goodMoral}" target="_blank">📄 Good Moral</a></li>`
                : ""
            }
            ${
              enrollee.documents?.birthCert
                ? `<li><a href="/uploads/enrollments/${enrollee.documents.birthCert}" target="_blank">📄 Birth Certificate</a></li>`
                : ""
            }
            ${
              enrollee.documents?.otherDocs?.length
                ? enrollee.documents.otherDocs
                    .map(
                      (doc, i) =>
                        `<li><a href="/uploads/enrollments/${doc}" target="_blank">📄 Other Document ${i + 1}</a></li>`
                    )
                    .join("")
                : ""
            }
          </ul>

          <div class="actions">
            <button class="approve-btn" data-id="${enrollee._id}">✅ Approve</button>
            <button class="reject-btn" data-id="${enrollee._id}">❌ Reject</button>
          </div>
        </div>
      `;

      // Toggle details on summary click
      card.querySelector(".summary").addEventListener("click", () => {
        const details = card.querySelector(".details");
        details.style.display =
          details.style.display === "none" ? "block" : "none";
      });

      enrolleeList.appendChild(card);
    });
  }

  // Filter logic
  function applyFilters() {
    const search = searchName.value.toLowerCase();
    const level = filterLevel.value;
    const strand = filterStrand.value.toLowerCase();

    const filtered = allEnrollees.filter((e) => {
      const matchesName = e.name.toLowerCase().includes(search);
      const matchesLevel = !level || e.level === level;
      const matchesStrand =
        !strand || (e.strand && e.strand.toLowerCase().includes(strand));
      return matchesName && matchesLevel && matchesStrand;
    });

    updateStats(filtered);
    renderEnrollees(filtered);
  }

  applyFiltersBtn.addEventListener("click", applyFilters);

  // Approve/Reject buttons
  enrolleeList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("approve-btn")) {
      const id = e.target.dataset.id;
      if (confirm("✅ Approve this enrollee?")) {
        await apiFetch(`/api/enrollment/${id}/approve`, { method: "POST" });
        loadEnrollees();
      }
    }
    if (e.target.classList.contains("reject-btn")) {
      const id = e.target.dataset.id;
      if (confirm("❌ Reject this enrollee?")) {
        await apiFetch(`/api/enrollment/${id}/reject`, { method: "POST" });
        loadEnrollees();
      }
    }
  });

  // Initial load
  loadEnrollees();
});
