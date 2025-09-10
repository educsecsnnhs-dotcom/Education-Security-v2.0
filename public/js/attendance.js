// attendance.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Student") {
    alert("Access denied. Students only.");
    window.location.href = "welcome.html";
    return;
  }

  const nameEl = document.getElementById("studentName");
  const lrnEl = document.getElementById("studentLRN");
  const sectionEl = document.getElementById("studentSection");
  const tableBody = document.getElementById("attendanceTable");

  const presentEl = document.getElementById("presentCount");
  const absentEl = document.getElementById("absentCount");
  const lateEl = document.getElementById("lateCount");
  const excusedEl = document.getElementById("excusedCount");
  const holidayEl = document.getElementById("holidayCount");

  const markBtn = document.getElementById("markPresentBtn");

  // Load student info
  nameEl.textContent = user.name || "Unknown";
  lrnEl.textContent = user.lrn || "N/A";
  sectionEl.textContent = user.section || "Unassigned";

  // Load attendance history
  async function loadAttendance() {
    tableBody.innerHTML = "";

    const records = await apiFetch(`/api/attendance/me`);

    let summary = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
      Holiday: 0,
    };

    records.forEach(rec => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(rec.date).toLocaleDateString()}</td>
        <td>${rec.status}</td>
        <td>${rec.remarks || "-"}</td>
      `;
      tableBody.appendChild(tr);

      if (summary[rec.status] !== undefined) {
        summary[rec.status]++;
      }
    });

    // Update summary UI
    presentEl.textContent = summary.Present;
    absentEl.textContent = summary.Absent;
    lateEl.textContent = summary.Late;
    excusedEl.textContent = summary.Excused;
    holidayEl.textContent = summary.Holiday;
  }

  // Check if there is an open attendance session for this student’s section
  async function checkOpenSession() {
    try {
      const openSession = await apiFetch(`/api/attendance/openSession/${user.sectionId}`);
      if (openSession && openSession.isOpen) {
        markBtn.style.display = "block";
        markBtn.onclick = async () => {
          await apiFetch("/api/attendance/mark", {
            method: "POST",
            body: JSON.stringify({ sessionId: openSession._id }),
          });
          alert("You are marked present ✅");
          await loadAttendance();
          markBtn.style.display = "none"; // hide after marking
        };
      } else {
        markBtn.style.display = "none";
      }
    } catch (err) {
      console.error("Error checking session:", err);
      markBtn.style.display = "none";
    }
  }

  // Initialize
  await loadAttendance();
  await checkOpenSession();
});
