// public/js/vote.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // ✅ Correct role check
  if (!["Student", "SuperAdmin"].includes(user.role)) {
    alert("Access denied. Students only.");
    window.location.href = "/welcome.html";
    return;
  }

  // Elements (ensure vote.html contains these IDs)
  const ssgForm = document.getElementById("ssgForm");
  const gradeForm = document.getElementById("gradeForm");
  const sectionForm = document.getElementById("sectionForm");
  const submitBtn = document.getElementById("submitVote");

  /* ---------------- Load Candidates ---------------- */
  async function loadCandidates() {
    try {
      // School-wide candidates
      const schoolCands = await apiFetch("/api/ssg/candidates?scope=school");
      renderCandidates(schoolCands, ssgForm, "school");

      // Grade-level
      const gradeCands = await apiFetch(`/api/ssg/candidates?scope=grade&target=${encodeURIComponent(user.grade || "")}`);
      renderCandidates(gradeCands, gradeForm, "grade");

      // Section-level
      const sectionCands = await apiFetch(`/api/ssg/candidates?scope=section&target=${encodeURIComponent(user.section || "")}`);
      renderCandidates(sectionCands, sectionForm, "section");
    } catch (err) {
      console.error("❌ Failed to load candidates:", err);
      ssgForm.innerHTML = gradeForm.innerHTML = sectionForm.innerHTML = "<p>⚠️ Error loading candidates.</p>";
    }
  }

  /* ---------------- Render Candidates ---------------- */
  function renderCandidates(list, container, scope) {
    container.innerHTML = "";
    if (!list || !list.length) {
      container.innerHTML = "<p>No candidates.</p>";
      return;
    }

    // group by position
    const byPos = {};
    list.forEach(c => {
      byPos[c.position] = byPos[c.position] || [];
      byPos[c.position].push(c);
    });

    Object.keys(byPos).forEach(position => {
      const h = document.createElement("h4");
      h.textContent = position;
      container.appendChild(h);

      byPos[position].forEach(c => {
        const label = document.createElement("label");
        label.style.display = "block";
        label.innerHTML = `
          <input type="radio" 
                 name="${scope}_${position}" 
                 value="${c._id}" 
                 data-position="${position}" 
                 data-scope="${scope}">
          ${c.name}
        `;
        container.appendChild(label);
      });
    });
  }

  /* ---------------- Check if already voted ---------------- */
  async function checkVoted() {
    try {
      const res = await apiFetch(`/api/ssg/voted/${user._id}`);
      if (res.voted && res.voted.length > 0) {
        submitBtn.disabled = true;
        submitBtn.textContent = "✅ You have already voted";
      }
    } catch (err) {
      console.error("❌ Failed to check vote status:", err);
    }
  }

  /* ---------------- Submit Votes ---------------- */
  submitBtn.addEventListener("click", async () => {
    const votes = [];
    const inputs = document.querySelectorAll("input[type='radio']:checked");

    inputs.forEach(inp => {
      votes.push({
        position: inp.dataset.position,
        candidateId: inp.value,
        scope: inp.dataset.scope,
        target:
          inp.dataset.scope === "school"
            ? null
            : inp.dataset.scope === "grade"
            ? user.grade
            : user.section
      });
    });

    if (!votes.length) {
      alert("⚠️ Select at least one candidate.");
      return;
    }

    try {
      await apiFetch("/api/ssg/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes })
      });
      alert("✅ Vote submitted!");
      await checkVoted();
    } catch (err) {
      console.error("❌ Failed to submit vote:", err);
      alert("❌ Failed to submit vote.");
    }
  });

  /* ---------------- Init ---------------- */
  await loadCandidates();
  await checkVoted();
});
