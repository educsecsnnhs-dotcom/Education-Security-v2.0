document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Moderator") {
    alert("Access denied. Teachers only.");
    window.location.href = "welcome.html";
    return;
  }

  const classSelect = document.getElementById("classSelect");
  const sheetSelect = document.getElementById("sheetSelect");
  const rangeInput = document.getElementById("rangeInput");
  const loadBtn = document.getElementById("loadRecordBook");
  const recordHead = document.getElementById("recordHead");
  const recordBody = document.getElementById("recordBody");
  const saveBtn = document.getElementById("saveGrades");
  const finalizeBtn = document.getElementById("finalizeGrades");

  const presentBtn = document.getElementById("markPresent");
  const absentBtn = document.getElementById("markAbsent");
  const excusedBtn = document.getElementById("markExcused");

  let currentRecordBook = null;
  let currentSheet = "Sheet1";
  let currentRange = "A1:Z50";
  let gradesMatrix = []; // editable copy

  // 🔹 Load teacher’s assigned classes
  async function loadClasses() {
    const classes = await apiFetch(`/api/classes/teacher/${user._id}`);
    classes.forEach(cls => {
      const opt = document.createElement("option");
      opt.value = cls._id;
      opt.textContent = cls.name;
      classSelect.appendChild(opt);
    });
  }

  // 🔹 Load available sheet tabs
  async function loadSheets(sheetId) {
    sheetSelect.innerHTML = "";
    const sheets = await apiFetch(`/api/recordbook/sheets/${sheetId}`);
    sheets.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      sheetSelect.appendChild(opt);
    });
  }

  // 🔹 Load record book from backend
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

    await loadSheets(currentRecordBook.sheetId);

    currentSheet = sheetSelect.value || "Sheet1";
    currentRange = rangeInput.value || "A1:Z50";

    const data = await apiFetch(
      `/api/recordbook/grades?recordBookId=${currentRecordBook._id}&range=${encodeURIComponent(currentSheet + "!" + currentRange)}`
    );

    gradesMatrix = data.grades || [];
    renderTable();
  }

  // 🔹 Render table
  function renderTable() {
    recordHead.innerHTML = "";
    recordBody.innerHTML = "";

    if (!gradesMatrix.length) {
      recordBody.innerHTML = "<tr><td>No data found</td></tr>";
      return;
    }

    // Header
    const headerRow = document.createElement("tr");
    gradesMatrix[0].forEach(cell => {
      const th = document.createElement("th");
      th.textContent = cell || "";
      headerRow.appendChild(th);
    });
    recordHead.appendChild(headerRow);

    // Rows
    for (let i = 1; i < gradesMatrix.length; i++) {
      const tr = document.createElement("tr");
      gradesMatrix[i].forEach((cell, j) => {
        const td = document.createElement("td");
        td.textContent = cell || "";
        td.dataset.row = i;
        td.dataset.col = j;

        // Freeze first column (student name / LRN)
        if (j > 0) {
          td.contentEditable = true;
        } else {
          td.style.backgroundColor = "#f0f0f0";
        }

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

  // 🔹 Save to Google Sheets
  async function saveGrades() {
    if (!currentRecordBook) return;

    await apiFetch(`/api/recordbook/input`, {
      method: "POST",
      body: JSON.stringify({
        recordBookId: currentRecordBook._id,
        range: currentSheet + "!" + currentRange,
        values: gradesMatrix,
      }),
    });

    alert("Grades saved to Google Sheets ✅");
  }

  // 🔹 Finalize
  async function finalizeGrades() {
    if (!currentRecordBook) return;

    const confirmFinalize = confirm("⚠️ Once finalized, grades cannot be edited. Continue?");
    if (!confirmFinalize) return;

    await apiFetch(`/api/recordbook/finalize`, {
      method: "POST",
      body: JSON.stringify({ recordBookId: currentRecordBook._id }),
    });

    alert("Grades finalized ✅");
  }

  // 🔹 Mark attendance helper
  async function markAttendance(status) {
    if (!currentRecordBook) return;
    const selected = Array.from(recordBody.querySelectorAll("tr td:first-child"));
    const studentNames = selected.map(td => td.textContent);

    // Example: mark entire range as "Present"
    const values = studentNames.map(name => [name, status]);

    await apiFetch(`/api/recordbook/attendance`, {
      method: "POST",
      body: JSON.stringify({
        recordBookId: currentRecordBook._id,
        range: currentSheet + "!A2:B" + (studentNames.length + 1),
        values,
      }),
    });

    alert(`Attendance marked: ${status} ✅`);
  }

  // 🔹 Event bindings
  loadBtn.addEventListener("click", loadRecordBook);
  saveBtn.addEventListener("click", saveGrades);
  finalizeBtn.addEventListener("click", finalizeGrades);
  presentBtn.addEventListener("click", () => markAttendance("Present"));
  absentBtn.addEventListener("click", () => markAttendance("Absent"));
  excusedBtn.addEventListener("click", () => markAttendance("Excused"));

  // Init
  await loadClasses();
});
