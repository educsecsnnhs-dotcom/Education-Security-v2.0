// public/js/admin.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // ✅ Role check using accessGuard
  checkAccess(["Admin"], { redirectTo: "/welcome.html" });

  // ================= TAB SWITCHING =================
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // ================= ANNOUNCEMENTS =================
  const annForm = document.getElementById("announcementForm");
  const annText = document.getElementById("announcementText");
  const annList = document.getElementById("announcementList");

  async function loadAnnouncements() {
    annList.innerHTML = "<li>Loading...</li>";
    try {
      const announcements = await apiFetch(`/api/announcements/department/${user.department}`);
      annList.innerHTML = "";
      if (announcements.length === 0) {
        annList.innerHTML = "<li>No announcements yet.</li>";
      }
      announcements.forEach(a => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${a.author?.name || "Unknown"}:</strong> ${a.text}
          <br><small>${new Date(a.createdAt).toLocaleString()}</small>
        `;
        annList.appendChild(li);
      });
    } catch (err) {
      annList.innerHTML = "<li>⚠️ Failed to load announcements.</li>";
    }
  }

  annForm.addEventListener("submit", async e => {
    e.preventDefault();
    const text = annText.value.trim();
    if (!text) return;

    try {
      await apiFetch("/api/announcements", {
        method: "POST",
        body: JSON.stringify({ text, scope: "Department", department: user.department }),
      });
      annText.value = "";
      await loadAnnouncements();
    } catch (err) {
      alert("❌ Failed to post announcement");
    }
  });

  // ================= MEMBERS =================
  const memberSearch = document.getElementById("memberSearch");
  const memberList = document.getElementById("memberList");

  async function loadMembers() {
    memberList.innerHTML = "Loading...";
    try {
      const members = await apiFetch(`/api/users?department=${user.department}`);
      renderMembers(members);

      memberSearch.addEventListener("input", () => {
        const q = memberSearch.value.toLowerCase();
        const filtered = members.filter(m =>
          m.name.toLowerCase().includes(q) || (m.section?.name || "").toLowerCase().includes(q)
        );
        renderMembers(filtered);
      });
    } catch (err) {
      memberList.innerHTML = "⚠️ Failed to load members.";
    }
  }

  function renderMembers(members) {
    memberList.innerHTML = "";
    if (members.length === 0) {
      memberList.innerHTML = "<p>No members found.</p>";
      return;
    }
    members.forEach(m => {
      const div = document.createElement("div");
      div.classList.add("member-card");
      div.innerHTML = `
        <strong>${m.name}</strong> (${m.role})
        <br>Section: ${m.section?.name || "N/A"}
      `;
      memberList.appendChild(div);
    });
  }

  // ================= REPORTS =================
  async function loadReports() {
    try {
      const gradesSummary = await apiFetch(`/api/reports/grades/${user.department}`);
      const attSummary = await apiFetch(`/api/reports/attendance/${user.department}`);

      // Grades chart
      const gctx = document.getElementById("gradesChart").getContext("2d");
      new Chart(gctx, {
        type: "bar",
        data: {
          labels: ["Passed", "Failed"],
          datasets: [{
            label: "Grades Summary",
            data: [gradesSummary.passed, gradesSummary.failed],
            backgroundColor: ["#28a745", "#dc3545"]
          }]
        }
      });

      // Attendance chart
      const actx = document.getElementById("attendanceChart").getContext("2d");
      new Chart(actx, {
        type: "pie",
        data: {
          labels: ["Present", "Absent", "Late"],
          datasets: [{
            label: "Attendance",
            data: [attSummary.present, attSummary.absent, attSummary.late],
            backgroundColor: ["#28a745", "#dc3545", "#ffc107"]
          }]
        }
      });
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  }

  // ================= EVENTS =================
  const eventForm = document.getElementById("eventForm");
  const eventList = document.getElementById("eventList");

  async function loadEvents() {
    eventList.innerHTML = "<li>Loading...</li>";
    try {
      const events = await apiFetch(`/api/events/department/${user.department}`);
      eventList.innerHTML = "";
      if (events.length === 0) {
        eventList.innerHTML = "<li>No events yet.</li>";
      }
      events.forEach(ev => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${ev.title}</strong> - ${new Date(ev.date).toLocaleDateString()}
          <br>${ev.details}
        `;
        eventList.appendChild(li);
      });
    } catch (err) {
      eventList.innerHTML = "<li>⚠️ Failed to load events.</li>";
    }
  }

  eventForm.addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("eventTitle").value.trim();
    const date = document.getElementById("eventDate").value;
    const details = document.getElementById("eventDetails").value.trim();

    if (!title || !date || !details) return;

    try {
      await apiFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({ title, date, details, department: user.department }),
      });
      eventForm.reset();
      await loadEvents();
    } catch (err) {
      alert("❌ Failed to add event");
    }
  });

  // ================= INIT =================
  await loadAnnouncements();
  await loadMembers();
  await loadReports();
  await loadEvents();
});
