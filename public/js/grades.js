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
  const partialBody = document.getElementById("partialGrades");
  const officialBody = document.getElementById("officialGrades");

  // Load student info
  nameEl.textContent = user.name || "Unknown";
  lrnEl.textContent = user.lrn || "N/A";
  sectionEl.textContent = user.section || "Unassigned";

  // Fetch partial grades
  async function loadPartialGrades() {
    partialBody.innerHTML = "";
    const grades = await apiFetch(`/api/grades/partial/${user._id}`);

    grades.forEach((subj, idx) => {
      // Calculate average if available
      const quarters = [subj.q1, subj.q2, subj.q3, subj.q4].filter(v => v !== null && v !== undefined);
      const avg = quarters.length ? (quarters.reduce((a, b) => a + b, 0) / quarters.length).toFixed(2) : "-";

      // Expandable subject row
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

      // Details row (quizzes/activities/exams breakdown from backend if available)
      const detailsTr = document.createElement("tr");
      detailsTr.classList.add("details-row");
      detailsTr.dataset.index = idx;
      detailsTr.innerHTML = `
        <td colspan="6">
          <div><b>Quizzes:</b> ${subj.breakdown?.quizzes || "N/A"}</div>
          <div><b>Activities:</b> ${subj.breakdown?.activities || "N/A"}</div>
          <div><b>Exams:</b> ${subj.breakdown?.exams || "N/A"}</div>
        </td>
      `;
      partialBody.appendChild(detailsTr);
    });

    // Toggle details on click
    document.querySelectorAll(".expandable").forEach(row => {
      row.addEventListener("click", () => {
        const idx = row.dataset.index;
        const detailsRow = document.querySelector(`.details-row[data-index="${idx}"]`);
        detailsRow.style.display = detailsRow.style.display === "table-row" ? "none" : "table-row";
      });
    });
  }

  // Fetch official grades
  async function loadOfficialGrades() {
    officialBody.innerHTML = "";
    const grades = await apiFetch(`/api/grades/official/${user._id}`);

    grades.forEach(subj => {
      const tr = document.createElement("tr");
      const remarks = subj.finalGrade >= 75 ? "PASSED" : "FAILED";
      tr.innerHTML = `
        <td>${subj.subject}</td>
        <td>${subj.finalGrade || "-"}</td>
        <td>${remarks}</td>
      `;
      officialBody.appendChild(tr);
    });
  }

  // Initialize
  await loadPartialGrades();
  await loadOfficialGrades();
});
