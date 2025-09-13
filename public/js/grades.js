//public/js/grades.js

document.addEventListener("DOMContentLoaded", () => {
  checkAccess(["Student"], { redirectTo: "/welcome.html" });
  }

  const nameEl = document.getElementById("studentName");
  const lrnEl = document.getElementById("studentLRN");
  const sectionEl = document.getElementById("studentSection");
  const partialBody = document.getElementById("partialGrades");
  const officialBody = document.getElementById("officialGrades");
  const lastUpdated = document.getElementById("lastUpdated");

  // 🔹 Student Info
  nameEl.textContent = user.name || "Unknown";
  lrnEl.textContent = user.lrn || "N/A";
  sectionEl.textContent = user.section?.name || "Unassigned";

  // 🔹 Load Partial Grades (live monitoring)
  async function loadPartialGrades(showLoading = true) {
    if (showLoading) partialBody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
    try {
      const grades = await apiFetch(`/api/grades/partial/${user._id}`);
      partialBody.innerHTML = "";

      if (!grades || !grades.length) {
        partialBody.innerHTML = `<tr><td colspan="6">No partial grades available.</td></tr>`;
        return;
      }

      grades.forEach((subj, idx) => {
        const quarters = [subj.q1, subj.q2, subj.q3, subj.q4].filter(v => v != null);
        const avg = quarters.length
          ? (quarters.reduce((a, b) => a + b, 0) / quarters.length).toFixed(2)
          : "-";

        const tr = document.createElement("tr");
        tr.classList.add("expandable");
        tr.dataset.index = idx;
        tr.innerHTML = `
          <td>${subj.subject}</td>
          <td>${subj.q1 ?? "-"}</td>
          <td>${subj.q2 ?? "-"}</td>
          <td>${subj.q3 ?? "-"}</td>
          <td>${subj.q4 ?? "-"}</td>
          <td>${avg}</td>
        `;
        partialBody.appendChild(tr);

        // expandable breakdown row
        const detailsTr = document.createElement("tr");
        detailsTr.classList.add("details-row");
        detailsTr.dataset.index = idx;
        detailsTr.style.display = "none";
        detailsTr.innerHTML = `
          <td colspan="6">
            <div><b>Quizzes:</b> ${subj.breakdown?.quizzes ?? "N/A"}</div>
            <div><b>Activities:</b> ${subj.breakdown?.activities ?? "N/A"}</div>
            <div><b>Exams:</b> ${subj.breakdown?.exams ?? "N/A"}</div>
          </td>
        `;
        partialBody.appendChild(detailsTr);
      });

      // toggle breakdown on click (reset before binding)
      partialBody.querySelectorAll(".expandable").forEach(row => {
        row.onclick = () => {
          const idx = row.dataset.index;
          const detailsRow = partialBody.querySelector(`.details-row[data-index="${idx}"]`);
          if (detailsRow) {
            detailsRow.style.display =
              detailsRow.style.display === "table-row" ? "none" : "table-row";
          }
        };
      });
    } catch (err) {
      console.error("Partial grades error:", err);
      partialBody.innerHTML = `<tr><td colspan="6">⚠️ Error loading partial grades</td></tr>`;
    }
  }

  // 🔹 Load Official Grades (finalized only)
  async function loadOfficialGrades(showLoading = true) {
    if (showLoading) officialBody.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;
    try {
      const grades = await apiFetch(`/api/grades/official/${user._id}`);
      officialBody.innerHTML = "";

      if (!grades || !grades.length) {
        officialBody.innerHTML = `<tr><td colspan="3">No official grades available.</td></tr>`;
        return;
      }

      grades.forEach(subj => {
        const remarks =
          subj.finalGrade != null
            ? subj.finalGrade >= 75
              ? "PASSED"
              : "FAILED"
            : "-";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${subj.subject}</td>
          <td class="${subj.finalGrade >= 75 ? "pass" : "fail"}">
            ${subj.finalGrade ?? "-"}
          </td>
          <td>${remarks}</td>
        `;
        officialBody.appendChild(tr);
      });
    } catch (err) {
      console.error("Official grades error:", err);
      officialBody.innerHTML = `<tr><td colspan="3">⚠️ Error loading official grades</td></tr>`;
    }
  }

  // 🔹 Refresh both + update timestamp
  async function refreshGrades(showLoading = false) {
    await loadPartialGrades(showLoading);
    await loadOfficialGrades(showLoading);
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }

  // 🔹 Auto-refresh every 60s
  setInterval(() => refreshGrades(false), 60000);

  // 🔹 First load (with loading indicators)
  await refreshGrades(true);
});
