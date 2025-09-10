// public/js/announcements.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  const deptSelect = document.getElementById("deptSelect");
  const container = document.getElementById("deptAnnouncements");
  const postSection = document.getElementById("postSection");
  const postForm = document.getElementById("postForm");

  // Only SuperAdmin, Admin, Moderator can post
  if (["SuperAdmin", "Admin", "Moderator"].includes(user.role)) {
    postSection.style.display = "block";
  }

  // Load departments (JHS = per subject, SHS = per strand)
  async function loadDepartments() {
    const depts = await apiFetch("/api/departments"); 
    depts.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d._id;
      opt.textContent = d.name;
      deptSelect.appendChild(opt);
    });
  }

  // Load announcements for selected department
  async function loadAnnouncements() {
    const deptId = deptSelect.value;
    if (!deptId) return;

    container.innerHTML = "<p>Loading...</p>";

    const anns = await apiFetch(`/api/announcements/department/${deptId}`);
    container.innerHTML = "";

    if (anns.length === 0) {
      container.innerHTML = "<p>No announcements for this department yet.</p>";
      return;
    }

    anns.forEach(a => {
      const div = document.createElement("div");
      div.className = "announcement-card";
      div.innerHTML = `
        <h3>${a.title}</h3>
        <p>${a.content}</p>
        <small>Posted: ${new Date(a.createdAt).toLocaleString()}</small>
        <hr/>
      `;
      container.appendChild(div);
    });
  }

  // Handle post form submit
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const deptId = deptSelect.value;
    if (!deptId) return alert("Select a department first!");

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

    await apiFetch("/api/announcements/department", {
      method: "POST",
      body: JSON.stringify({ deptId, title, content }),
    });

    alert("Announcement posted ✅");
    postForm.reset();
    await loadAnnouncements();
  });

  // Bind dept change event
  deptSelect.addEventListener("change", loadAnnouncements);

  // Init
  await loadDepartments();
});
