// public/js/recordbook.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // ✅ Allow only Moderator and SuperAdmin
  if (!["Moderator", "SuperAdmin"].includes(user.role)) {
    alert("❌ Access denied. Teachers only.");
    window.location.href = "/welcome.html";
    return;
  }

  const sectionSelect = document.getElementById("sectionSelect");
  const subjectSelect = document.getElementById("subjectSelect");
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
  const lastUpdated = document.getElementById("lastUpdated");

  let currentRecordBook = null;
  let currentSheet = "Sheet1";
  let currentRange = "A1:Z50";
  let gradesMatrix = []; // editable copy

  // 🔹 Load teacher’s assigned sections + subjects
  async function loadSections() {
    sectionSelect.innerHTML = ""; // reset
    try {
      const assignments = await apiFetch(`/api/sections/teacher/${user._id}`);
      if (!assignments.length) {
        sectionSelect.innerHTML = `<option disabled>No sections assigned</option>`;
        return;
      }
      assignments.forEach(asg => {
        const opt = document.createElement("option");
        opt.value = JSON.stringify({
          sectionId: asg.section._id,
          subject: asg.subject,
        });
        opt.textContent = `${asg.section.name} - ${asg.subject}`;
        sectionSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Error loading sections:", err);
      alert("⚠️ Failed to load sections.");
    }
  }

  // 🔹 Load available sheet tabs
  async function loadSheets(sheetId) {
    sheetSelect.innerHTML = "";
    try {
      const sheets = await apiFetch(`/api/recordbook/sheets/${sheetId}`);
      sheets.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        sheetSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Error loading sheets:", err);
      alert("⚠️ Could not load sheet tabs.");
    }
  }

  // 🔹 Load record book
  async function loadRecordBook() {
    const selected = sectionSelect.value;
    if (!selected) return alert("Select a section + subject first!");

    const { sectionId, subject } = JSON.parse(selected);

    recordBody.innerHTML = `<tr><td colspan="5">Loading record book...</td></tr>`;

    try {
      const existing = await apiFetch(
        `/api/recordbook/find?sectionId=${sectionId}&subject=${encodeURIComponent(subject)}`
      );

      if (!existing) {
        // Auto-create if none exists
        const created = await apiFetch(`/api/recordbook/create`, {
          method: "POST",
          body: JSON.stringify({ sectionId, subject, teacherId: user._id }),
        });
        currentRecordBook = created.recordBook;
      } else {
        currentRecordBook = existing;
      }

      await loadSheets(currentRecordBook.sheetId);

      currentSheet = sheetSelect.value || "Sheet1";
      currentRange = rangeInput.value || "A1:Z50";

      const data = await apiFetch(
        `/api/recordbook/grades?recordBookId=${currentRecordBook._id}&range=${encodeURIComponent(currentSheet + "!" + currentRange)}`
      );

      gradesMatrix = data.grades || [];
      renderTable();
      updateTimestamp();
    } catch (err) {
      console.error("Error loading record book:", err);
      recordBody.innerHTML = `<tr><td colspan="5">⚠️ Failed to load record book</td></tr>`;
    }
  }

  // 🔹 Render table
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

    // Rows
    for (let i = 1; i < gradesMatrix.length; i++) {
      const tr = document.createElement("tr");
      gradesMatrix[i].forEach((cell, j) => {
        const td = document.createElement("td");
        td.textContent = cell || "";
        td.dataset.row = i;
        td.dataset.col = j;

        // Freeze first two columns (LRN + Name)
        if (j > 1) {
          td.contentEditable = true;
        } else {
          td.style.backgroundColor = "#f0f0f0";
        }

        tr.appendChild(td);
      });
      recordBody.appendChild(tr);
    }

    // Avoid duplicate listeners
    recordBody.oninput = e => {
      const td = e.target;
      if (td.tagName !== "TD") return;
      const row = parseInt(td.dataset.row);
      const col = parseInt(td.dataset.col);
      gradesMatrix[row][col] = td.textContent;
    };
  }

  // 🔹 Save to Google Sheets
  async function saveGrades() {
    if (!currentRecordBook) return;
    try {
      saveBtn.disabled = true;
      await apiFetch(`/api/recordbook/input`, {
        method: "POST",
        body: JSON.stringify({
          recordBookId: currentRecordBook._id,
          range: currentSheet + "!" + currentRange,
          values: gradesMatrix,
        }),
      });
      alert("✅ Grades saved to Google Sheets");
      updateTimestamp();
    } catch (err) {
      console.error("Save error:", err);
      alert("⚠️ Failed to save grades.");
    } finally {
      saveBtn.disabled = false;
    }
  }

  // 🔹 Finalize
  async function finalizeGrades() {
    if (!currentRecordBook) return;
    const confirmFinalize = confirm("⚠️ Once finalized, grades cannot be edited. Continue?");
    if (!confirmFinalize) return;

    try {
      finalizeBtn.disabled = true;
      await apiFetch(`/api/recordbook/finalize`, {
        method: "POST",
        body: JSON.stringify({ recordBookId: currentRecordBook._id }),
      });
      alert("✅ Grades finalized");
      updateTimestamp();
    } catch (err) {
      console.error("Finalize error:", err);
      alert("⚠️ Failed to finalize grades.");
    } finally {
      finalizeBtn.disabled = false;
    }
  }

  // 🔹 Mark attendance
  async function markAttendance(status) {
    if (!currentRecordBook) return;

    try {
      const studentRows = gradesMatrix.slice(1); // exclude header
      if (!studentRows.length) return alert("⚠️ No students found.");

      const values = studentRows.map(row => [row[0], row[1], status]); // [LRN, Name, Status]

      await apiFetch(`/api/recordbook/attendance`, {
        method: "POST",
        body: JSON.stringify({
          recordBookId: currentRecordBook._id,
          range: `${currentSheet}!A2:C${studentRows.length + 1}`,
          values,
        }),
      });

      alert(`✅ Attendance marked: ${status}`);
      updateTimestamp();
    } catch (err) {
      console.error("Attendance error:", err);
      alert("⚠️ Failed to mark attendance.");
    }
  }

  // 🔹 Update timestamp
  function updateTimestamp() {
    if (lastUpdated) {
      lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  }

  // 🔹 Event bindings
  loadBtn.addEventListener("click", loadRecordBook);
  saveBtn.addEventListener("click", saveGrades);
  finalizeBtn.addEventListener("click", finalizeGrades);
  presentBtn.addEventListener("click", () => markAttendance("Present"));
  absentBtn.addEventListener("click", () => markAttendance("Absent"));
  excusedBtn.addEventListener("click", () => markAttendance("Excused"));

  // Init
  await loadSections();
});
