document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Registrar") {
    alert("Access denied. Registrar only.");
    window.location.href = "welcome.html";
    return;
  }

  const tableBody = document.getElementById("enrolledTable");
  const gradeFilter = document.getElementById("filterGrade");
  const sectionFilter = document.getElementById("filterSection");
  const applyBtn = document.getElementById("applyFilters");

  async function loadEnrolled() {
    tableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    const query = new URLSearchParams();
    if (gradeFilter.value) query.append("grade", gradeFilter.value);
    if (sectionFilter.value) query.append("section", sectionFilter.value);

    const students = await apiFetch(`/api/registrar/enrolled?${query.toString()}`);

    tableBody.innerHTML = "";
    if (students.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No records found</td></tr>";
      return;
    }

    students.forEach(stu => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${stu.lrn}</td>
        <td>${stu.name}</td>
        <td>${stu.grade}</td>
        <td>${stu.section}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  applyBtn.addEventListener("click", loadEnrolled);

  await loadEnrolled();
});
