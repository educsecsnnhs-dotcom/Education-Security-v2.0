document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Moderator") {
    alert("Access denied. Teachers only.");
    window.location.href = "welcome.html";
    return;
  }

  const classSelect = document.getElementById("classSelect");
  const loadBtn = document.getElementById("loadRecordBook");
  const recordHead = document.getElementById("recordHead");
  const recordBody = document.getElementById("recordBody");
  const saveBtn = document.getElementById("saveGrades");
  const finalizeBtn = document.getElementById("finalizeGrades");

  let currentRecordBook = null;
  let currentRange = "Sheet1!A1:Z50"; // default visible range
  let gradesMatrix = []; // local copy for edits

  // Load teacher’s assigned classes
  async function loadClasses() {
    const classes = await apiFetch(`/api/classes/teacher/${user._id}`);
    classes.forEach(cls => {
      const opt = document.createElement("option");
      opt.value = cls._id;
      opt.textContent = cls.name;
      classSelect.appendChild(opt);
    });
  }

  // Load record book from backend
  async function loadRecordBook() {
    const classId = classSelect.value;
    if (!classId) return alert("Select a class first!");

    const cls = await apiFetch(`/api/classes/${classId}`);
    if (!cls.recordBookId) {
      // Auto-create if none exists
      const created = await apiFetch(`/api/recordbook/create`, {
        method: "POST",
        body: JSON.stringify({ classId }),
      });
      currentRecordBook = created.recordBook;
    } else {
      currentRecordBook = await apiFetch(`/api/recordbook/${cls.recordBookId}`);
    }

    // Fetch spreadsheet data
    const data = await apiFetch(
      `/api/recordbook/grades?recordBookId=${currentRecordBook._id}&range=${encodeURIComponent(currentRange)}`
    );

    gradesMatrix = data.grades || [];
    renderTable();
  }

  // Render table into editable cells
  function renderTable() {
    recordHead.innerHTML = "";
    recordBody.innerHTML = "";

    if (!gradesMatrix.length) {
      recordBody.innerHTML = "<tr><td>No data found</td></tr>";
      return;
    }

    // Header row
    const headerRow = document.createElement("tr");
    gradesMatrix[0].forEach(cell => {
      const th = document.createElement("th");
      th.textContent = cell || "";
      headerRow.appendChild(th);
    });
    recordHead.appendChild(headerRow);

    // Body rows
    for (let i = 1; i < gradesMatrix.length; i++) {
      const tr = document.createElement("tr");
      gradesMatrix[i].forEach((cell, j) => {
        const td = document.createElement("td");
        td.contentEditable = j > 0; // allow editing except first column (student name/LRN)
        td.textContent = cell || "";
        td.dataset.row = i;
        td.dataset.col = j;
        tr.appendChild(td);
      });
      recordBody.appendChild(tr);
    }

    // Capture edits
    recordBody.addEventListener("input", e => {
      const td = e.target;
      const row = parseInt(td.dataset.row);
      const col = parseInt(td.dataset.col);
      gradesMatrix[row][col] = td.textContent;
    });
  }

  // Save updated grades
  async function saveGrades() {
    if (!currentRecordBook) return;

    await apiFetch(`/api/recordbook/input`, {
      method: "POST",
      body: JSON.stringify({
        recordBookId: currentRecordBook._id,
        range: currentRange,
        values: gradesMatrix,
      }),
    });

    alert("Grades saved to Google Sheets ✅");
  }

  // Finalize grades
  async function finalizeGrades() {
    if (!currentRecordBook) return;

    await apiFetch(`/api/recordbook/finalize`, {
      method: "POST",
      body: JSON.stringify({ recordBookId: currentRecordBook._id }),
    });

    alert("Grades finalized ✅");
  }

  // Bind events
  loadBtn.addEventListener("click", loadRecordBook);
  saveBtn.addEventListener("click", saveGrades);
  finalizeBtn.addEventListener("click", finalizeGrades);

  // Init
  await loadClasses();
});
