document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // Only Registrar or SuperAdmin can access
  if (!["Registrar", "SuperAdmin"].includes(user.role)) {
    alert("❌ Access denied");
    window.location.href = "welcome.html";
    return;
  }

  const enrolleeList = document.getElementById("enrolleeList");

  try {
    const enrollees = await apiFetch("/api/enrollment/pending");

    enrollees.forEach(enrollee => {
      const li = document.createElement("li");
      li.className = "enrollee-item";
      li.innerHTML = `
        <div class="summary">
          <strong>${enrollee.name}</strong> (${enrollee.level.toUpperCase()} - ${enrollee.strand || "N/A"})
        </div>
        <div class="details" style="display:none;">
          <p><b>LRN:</b> ${enrollee.lrn}</p>
          <p><b>School Year:</b> ${enrollee.schoolYear}</p>
          <p><b>Uploaded Docs:</b></p>
          <ul>
            ${enrollee.documents?.reportCard ? `<li><a href="${enrollee.documents.reportCard}" target="_blank">📄 Report Card</a></li>` : ""}
            ${enrollee.documents?.goodMoral ? `<li><a href="${enrollee.documents.goodMoral}" target="_blank">📄 Good Moral</a></li>` : ""}
            ${enrollee.documents?.birthCertificate ? `<li><a href="${enrollee.documents.birthCertificate}" target="_blank">📄 Birth Certificate</a></li>` : ""}
          </ul>
          <button class="approve-btn" data-id="${enrollee._id}">✅ Approve</button>
          <button class="reject-btn" data-id="${enrollee._id}">❌ Reject</button>
        </div>
      `;

      // Toggle details
      li.querySelector(".summary").addEventListener("click", () => {
        const details = li.querySelector(".details");
        details.style.display = details.style.display === "none" ? "block" : "none";
      });

      enrolleeList.appendChild(li);
    });

    // Approve/Reject buttons
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
    console.error(err);
    alert("Failed to load enrollees");
  }
});
