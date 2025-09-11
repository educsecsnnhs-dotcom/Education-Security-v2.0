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
  const partialBody = document.getElementById("partialGrades");
  const officialBody = document.getElementById("officialGrades");

  // 🔹 Student Info
  nameEl.textContent = user.name || "Unknown";
  lrnEl.textContent = user.lrn || "N/A";
  sectionEl.textContent = user.section?.name || "Unassigned";

  // 🔹 Load Partial Grades (live monitoring)
  async function loadPartialGrades() {
    partialBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
    try {
      const grades = await apiFetch(`/api/grades/partial/${user._id}`);
      partialBody.innerHTML = "";

      grades.forEach((subj, idx) => {
        const quarters = [subj.q1, subj.q2, subj.q3, subj.q4].filter(v => v !== null && v !== undefined);
        const avg = quarters.length ? (quarters.reduce((a, b) => a + b, 0) / quarters.length).toFixed(2) : "-";

        const tr = document.createElement("tr");
        tr.classList.add("expandable");
        tr.dataset.index = idx;
        tr.innerHTML = `
          <td>${subj.subject}</td>
          <td>${subj.q1 || "-"}</td>
          <td>${subj.q2 || "-"}</td>
          <td>${subj.q3 || "-"}</td>
          <td>${subj.q4 || "-"}</td>
          <td>${avg}</td>
        `;
        partialBody.appendChild(tr);

        // expandable breakdown
        const detailsTr = document.createElement("tr");
        detailsTr.classList.add("details-row");
        detailsTr.dataset.index = idx;
        detailsTr.style.display = "none";
        detailsTr.innerHTML = `
          <td colspan="6">
            <div><b>Quizzes:</b> ${subj.breakdown?.quizzes || "N/A"}</div>
            <div><b>Activities:</b> ${subj.breakdown?.activities || "N/A"}</div>
            <div><b>Exams:</b> ${subj.breakdown?.exams || "N/A"}</div>
          </td>
        `;
        partialBody.appendChild(detailsTr);
      });

      // toggle
      document.querySelectorAll(".expandable").forEach(row => {
        row.addEventListener("click", () => {
          const idx = row.dataset.index;
          const detailsRow = document.querySelector(`.details-row[data-index="${idx}"]`);
          detailsRow.style.display = detailsRow.style.display === "table-row" ? "none" : "table-row";
        });
      });
    } catch (err) {
      partialBody.innerHTML = `<tr><td colspan="6">⚠️ Error loading partial grades</td></tr>`;
    }
  }

  // 🔹 Load Official Grades (finalized only)
  async function loadOfficialGrades() {
    officialBody.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;
    try {
      const grades = await apiFetch(`/api/grades/official/${user._id}`);
      officialBody.innerHTML = "";

      grades.forEach(subj => {
        const remarks = subj.finalGrade >= 75 ? "PASSED" : "FAILED";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${subj.subject}</td>
          <td>${subj.finalGrade || "-"}</td>
          <td>${remarks}</td>
        `;
        officialBody.appendChild(tr);
      });
    } catch (err) {
      officialBody.innerHTML = `<tr><td colspan="3">⚠️ Error loading official grades</td></tr>`;
    }
  }

  // 🔹 Auto-refresh every 60s (real-time feel)
  setInterval(() => {
    loadPartialGrades();
    loadOfficialGrades();
  }, 60000);

  // First load
  await loadPartialGrades();
  await loadOfficialGrades();
});
