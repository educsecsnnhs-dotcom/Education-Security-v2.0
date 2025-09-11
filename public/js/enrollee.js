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

  try {
    const enrollees = await apiFetch("/api/enrollment/pending");

    if (!enrollees.length) {
      enrolleeList.innerHTML = "<p>No pending enrollees ✅</p>";
      return;
    }

    enrollees.forEach((enrollee) => {
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

    // Handle approve/reject
    enrolleeList.addEventListener("click", async (e) => {
      if (e.target.classList.contains("approve-btn")) {
        const id = e.target.dataset.id;
        await apiFetch(`/api/enrollment/${id}/approve`, { method: "POST" });
        alert("✅ Enrollee approved");
        location.reload();
      }
      if (e.target.classList.contains("reject-btn")) {
        const id = e.target.dataset.id;
        await apiFetch(`/api/enrollment/${id}/reject`, { method: "POST" });
        alert("❌ Enrollee rejected");
        location.reload();
      }
    });
  } catch (err) {
    console.error("Failed to load enrollees:", err);
    enrolleeList.innerHTML = "<p>⚠ Failed to load pending enrollees.</p>";
  }
});
