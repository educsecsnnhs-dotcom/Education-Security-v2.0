document.addEventListener("DOMContentLoaded", () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  const enrolledTable = document.getElementById("enrolledTable");
  const searchName = document.getElementById("searchName");
  const filterGrade = document.getElementById("filterGrade");
  const filterSection = document.getElementById("filterSection");
  const applyFiltersBtn = document.getElementById("applyFilters");

  const modal = document.getElementById("studentModal");
  const closeModal = document.getElementById("closeModal");
  const studentName = document.getElementById("studentName");
  const detailLrn = document.getElementById("detailLrn");
  const detailGrade = document.getElementById("detailGrade");
  const detailStrand = document.getElementById("detailStrand");
  const detailSection = document.getElementById("detailSection");
  const detailYear = document.getElementById("detailYear");
  const detailDocs = document.getElementById("detailDocs");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  let enrolledStudents = [];

  // 🔹 Load students
  async function loadStudents() {
    try {
      const res = await apiFetch("/api/enrolled");
      enrolledStudents = res.students || [];
      renderTable(enrolledStudents);
    } catch (err) {
      console.error("❌ Failed to load students", err);
      enrolledTable.innerHTML = `<tr><td colspan="6">Error loading students</td></tr>`;
    }
  }

  // 🔹 Render Table
  function renderTable(students) {
    enrolledTable.innerHTML = "";

    if (students.length === 0) {
      enrolledTable.innerHTML = `<tr><td colspan="6">No students found</td></tr>`;
      return;
    }

    students.forEach((s) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.lrn || "—"}</td>
        <td>${s.name}</td>
        <td>${s.yearLevel || "—"}</td>
        <td>${s.strand || "—"}</td>
        <td>${s.section || "—"}</td>
        <td>${s.status || "Active"}</td>
      `;
      row.addEventListener("click", () => openModal(s));
      enrolledTable.appendChild(row);
    });
  }

  // 🔹 Apply Filters
  function applyFilters() {
    let filtered = [...enrolledStudents];

    const searchValue = searchName.value.toLowerCase();
    if (searchValue) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchValue) ||
          (s.lrn || "").toLowerCase().includes(searchValue)
      );
    }

    if (filterGrade.value) {
      filtered = filtered.filter(
        (s) => String(s.yearLevel) === filterGrade.value
      );
    }

    if (filterSection.value) {
      const secVal = filterSection.value.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.strand && s.strand.toLowerCase().includes(secVal)) ||
          (s.section && s.section.toLowerCase().includes(secVal))
      );
    }

    renderTable(filtered);
  }

  applyFiltersBtn.addEventListener("click", applyFilters);

  // 🔹 Open Modal
  function openModal(student) {
    studentName.textContent = `👤 ${student.name}`;
    detailLrn.textContent = student.lrn || "—";
    detailGrade.textContent = student.yearLevel || "—";
    detailStrand.textContent = student.strand || "—";
    detailSection.textContent = student.section || "—";
    detailYear.textContent = student.schoolYear || "—";

    // Docs
    detailDocs.innerHTML = "";
    if (student.documents && student.documents.length > 0) {
      student.documents.forEach((doc) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${doc.url}" target="_blank">📂 ${doc.name}</a>`;
        detailDocs.appendChild(li);
      });
    } else {
      detailDocs.innerHTML = "<li>No documents uploaded</li>";
    }

    modal.classList.remove("hidden");
  }

  // 🔹 Close Modal
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // 🔹 Tab Switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tabId = btn.dataset.tab;
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });
      document.getElementById(`tab-${tabId}`).classList.remove("hidden");
    });
  });

  // Load students on page load
  loadStudents();
});
