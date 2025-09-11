document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Student") {
    alert("Access denied. Students only.");
    window.location.href = "../welcome.html";
    return;
  }

  const nameEl = document.getElementById("studentName");
  const lrnEl = document.getElementById("studentLRN");
  const sectionEl = document.getElementById("studentSection");
  const attendanceBody = document.getElementById("attendanceBody");
  const lastUpdated = document.getElementById("lastUpdated");

  // 🔹 Student Info
  nameEl.textContent = user.name || "Unknown";
  lrnEl.textContent = user.lrn || "N/A";
  sectionEl.textContent = user.section?.name || "Unassigned";

  // 🔹 Load Attendance
  async function loadAttendance() {
    attendanceBody.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;
    try {
      const records = await apiFetch(`/api/attendance/${user._id}`);
      attendanceBody.innerHTML = "";

      if (!records.length) {
        attendanceBody.innerHTML = `<tr><td colspan="3">No attendance records found.</td></tr>`;
      }

      records.forEach(rec => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${new Date(rec.date).toLocaleDateString()}</td>
          <td class="${rec.status.toLowerCase()}">${rec.status}</td>
          <td>${rec.remarks || "-"}</td>
        `;
        attendanceBody.appendChild(tr);
      });

      lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
      attendanceBody.innerHTML = `<tr><td colspan="3">⚠️ Error loading attendance</td></tr>`;
    }
  }

  // 🔹 Auto-refresh every 60s
  setInterval(loadAttendance, 60000);

  // First load
  await loadAttendance();
});
