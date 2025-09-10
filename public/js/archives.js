document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Registrar") {
    alert("Access denied. Registrar only.");
    window.location.href = "welcome.html";
    return;
  }

  const tableBody = document.getElementById("archiveTable");
  const searchName = document.getElementById("searchName");
  const searchBatch = document.getElementById("searchBatch");
  const applyBtn = document.getElementById("applySearch");

  async function loadArchives() {
    tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    const query = new URLSearchParams();
    if (searchName.value) query.append("name", searchName.value);
    if (searchBatch.value) query.append("batch", searchBatch.value);

    const students = await apiFetch(`/api/registrar/archives?${query.toString()}`);

    tableBody.innerHTML = "";
    if (students.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='5'>No archived students found</td></tr>";
      return;
    }

    students.forEach(stu => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${stu.lrn}</td>
        <td>${stu.name}</td>
        <td>${stu.grade || stu.strand}</td>
        <td>${stu.section}</td>
        <td>${stu.batch}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  applyBtn.addEventListener("click", loadArchives);

  await loadArchives();
});
