document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Moderator") {
    alert("Access denied. Teachers only.");
    window.location.href = "welcome.html";
    return;
  }

  const classSelect = document.getElementById("classSelect");
  const openBtn = document.getElementById("openAttendance");
  const closeBtn = document.getElementById("closeAttendance");
  const recordsBody = document.getElementById("attendanceRecords");

  let currentSession = null;

  // Load teacher’s classes
  const classes = await apiFetch(`/api/classes/teacher/${user._id}`);
  classes.forEach(cls => {
    const opt = document.createElement("option");
    opt.value = cls._id;
    opt.textContent = cls.name;
    classSelect.appendChild(opt);
  });

  async function loadRecords(sessionId) {
    recordsBody.innerHTML = "";
    const session = await apiFetch(`/api/attendance/session/${sessionId}`);
    session.records.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.studentId.name}</td><td>${r.status}</td>`;
      recordsBody.appendChild(tr);
    });
  }

  openBtn.onclick = async () => {
    const classId = classSelect.value;
    const res = await apiFetch("/api/attendance/open", {
      method: "POST",
      body: JSON.stringify({ classId }),
    });
    currentSession = res.session;
    alert("Attendance opened ✅");
    await loadRecords(currentSession._id);
  };

  closeBtn.onclick = async () => {
    if (!currentSession) return alert("No open session");
    await apiFetch("/api/attendance/close", {
      method: "POST",
      body: JSON.stringify({ sessionId: currentSession._id }),
    });
    alert("Attendance closed ✅");
  };
});
