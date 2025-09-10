// grades.js
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

    grades.forEach(subj => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${subj.subject}</td>
        <td>${subj.q1 || "-"}</td>
        <td>${subj.q2 || "-"}</td>
        <td>${subj.q3 || "-"}</td>
        <td>${subj.q4 || "-"}</td>
      `;
      partialBody.appendChild(tr);
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
