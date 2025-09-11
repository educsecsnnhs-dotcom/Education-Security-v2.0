document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  const schoolSection = document.getElementById("school");
  const deptSection = document.getElementById("department");
  const sectionSection = document.getElementById("section");
  const newAnnouncementBtn = document.getElementById("newAnnouncementBtn");

  // 🔹 Role-based posting rights
  const canPostSchool = ["SSG", "Registrar"].includes(user.role);
  const canPostDept = ["Admin", "Moderator"].includes(user.role);
  const canPostSection = ["Moderator"].includes(user.role);

  if (canPostSchool || canPostDept || canPostSection) {
    newAnnouncementBtn.style.display = "inline-block";
  }

  // 🔹 Tabs switching
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");

      // Adjust modal scope based on tab
      document.getElementById("scope").value = tab.dataset.tab;
    });
  });

  // 🔹 Fetch announcements
  async function loadAnnouncements() {
    const announcements = await apiFetch("/api/announcements");

    schoolSection.innerHTML = "";
    deptSection.innerHTML = "";
    sectionSection.innerHTML = "";

    announcements.forEach(a => {
      const card = document.createElement("div");
      card.className = "announcement-card";
      card.innerHTML = `
        <h3>${a.title}</h3>
        <p>${a.content}</p>
        ${a.imageUrl ? `<img src="${a.imageUrl}" alt="announcement image">` : ""}
        <small>📅 ${new Date(a.createdAt).toLocaleString()} | 👤 ${a.createdBy?.name || "Unknown"}</small>
      `;

      if (a.scope === "school") {
        schoolSection.appendChild(card);
      } else if (a.scope === "department" && a.target === user.department) {
        deptSection.appendChild(card);
      } else if (a.scope === "section" && a.target === user.section) {
        sectionSection.appendChild(card);
      }
    });
  }
  loadAnnouncements();

  // 🔹 Modal logic
  const modal = document.getElementById("announcementModal");
  const closeModal = modal.querySelector(".close");

  newAnnouncementBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 🔹 Show target input only when needed
  const scopeSelect = document.getElementById("scope");
  const targetInput = document.getElementById("target");
  const targetLabel = document.getElementById("targetLabel");

  scopeSelect.addEventListener("change", () => {
    if (scopeSelect.value === "school") {
      targetInput.style.display = "none";
      targetLabel.style.display = "none";
    } else {
      targetInput.style.display = "block";
      targetLabel.style.display = "block";
    }
  });

  // 🔹 Submit announcement
  document.getElementById("announcementForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("content", document.getElementById("content").value);
    formData.append("scope", scopeSelect.value);
    if (scopeSelect.value !== "school") {
      formData.append("target", targetInput.value);
    }
    if (document.getElementById("image").files[0]) {
      formData.append("image", document.getElementById("image").files[0]);
    }

    try {
      await apiFetch("/api/announcements", {
        method: "POST",
        body: formData
      });
      alert("✅ Announcement posted!");
      modal.classList.add("hidden");
      loadAnnouncements();
    } catch (err) {
      console.error("Error posting:", err);
      alert("❌ Failed to post announcement.");
    }
  });
});
