// vote.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Student") {
    alert("Access denied. Students only.");
    window.location.href = "welcome.html";
    return;
  }

  // Show student info
  document.getElementById("studentName").textContent = user.name || "Unknown";
  document.getElementById("studentLRN").textContent = user.lrn || "N/A";
  document.getElementById("studentGrade").textContent = user.grade || "N/A";
  document.getElementById("studentSection").textContent = user.section || "N/A";

  const ssgForm = document.getElementById("ssgForm");
  const gradeForm = document.getElementById("gradeForm");
  const sectionForm = document.getElementById("sectionForm");

  // Fetch candidates (school-wide, grade-level, section-level)
  const candidates = await apiFetch(`/api/ssg/candidates?grade=${user.grade}&section=${user.section}`);

  // Populate SSG candidates
  if (candidates.ssg && candidates.ssg.length > 0) {
    candidates.ssg.forEach(c => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="ssgVote" value="${c._id}" />
        ${c.name} - ${c.position}
      `;
      ssgForm.appendChild(label);
      ssgForm.appendChild(document.createElement("br"));
    });
  } else {
    ssgForm.innerHTML = "<p>No SSG candidates available.</p>";
  }

  // Populate Grade-level candidates
  if (candidates.grade && candidates.grade.length > 0) {
    candidates.grade.forEach(c => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="gradeVote" value="${c._id}" />
        ${c.name} - ${c.position}
      `;
      gradeForm.appendChild(label);
      gradeForm.appendChild(document.createElement("br"));
    });
  } else {
    gradeForm.innerHTML = "<p>No grade-level candidates available.</p>";
  }

  // Populate Section candidates
  if (candidates.section && candidates.section.length > 0) {
    candidates.section.forEach(c => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="sectionVote" value="${c._id}" />
        ${c.name} - ${c.position}
      `;
      sectionForm.appendChild(label);
      sectionForm.appendChild(document.createElement("br"));
    });
  } else {
    sectionForm.innerHTML = "<p>No section-level candidates available.</p>";
  }

  // Submit vote
  document.getElementById("submitVote").addEventListener("click", async () => {
    const selectedSSG = document.querySelector("input[name='ssgVote']:checked")?.value;
    const selectedGrade = document.querySelector("input[name='gradeVote']:checked")?.value;
    const selectedSection = document.querySelector("input[name='sectionVote']:checked")?.value;

    if (!selectedSSG && !selectedGrade && !selectedSection) {
      alert("Please select at least one candidate.");
      return;
    }

    const payload = {
      studentId: user._id,
      ssgVote: selectedSSG,
      gradeVote: selectedGrade,
      sectionVote: selectedSection,
    };

    try {
      const res = await apiFetch("/api/ssg/vote", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("✅ Vote submitted successfully!");
      window.location.href = "welcome.html";
    } catch (err) {
      console.error("Vote failed:", err);
      alert("❌ Failed to submit vote.");
    }
  });
});
