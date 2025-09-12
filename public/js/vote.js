// public/js/vote.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Student", "SuperAdmin") {
    alert("Access denied. Students only.");
    window.location.href = "../welcome.html";
    return;
  }

  // Elements (create your vote.html to contain these ids)
  const ssgForm = document.getElementById("ssgForm");
  const gradeForm = document.getElementById("gradeForm");
  const sectionForm = document.getElementById("sectionForm");
  const submitBtn = document.getElementById("submitVote");

  // Load candidates for scopes:
  async function loadCandidates() {
    // School-wide candidates
    const schoolCands = await apiFetch("/api/ssg/candidates?scope=school");
    renderCandidates(schoolCands, ssgForm, "school");

    // Grade-level (use user.grade)
    const gradeCands = await apiFetch(`/api/ssg/candidates?scope=grade&target=${user.grade || ""}`);
    renderCandidates(gradeCands, gradeForm, "grade");

    // Section-level (use user.section)
    const sectionCands = await apiFetch(`/api/ssg/candidates?scope=section&target=${encodeURIComponent(user.section || "")}`);
    renderCandidates(sectionCands, sectionForm, "section");
  }

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
        const id = `${scope}_${position}_${c._id}`;
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="radio" name="${scope}_${position}" value="${c._id}" data-position="${position}" data-scope="${scope}" />
          ${c.name}
        `;
        container.appendChild(label);
        container.appendChild(document.createElement("br"));
      });
    });
  }

  // Check if user already voted
  async function checkVoted() {
    const res = await apiFetch(`/api/ssg/voted/${user._id}`);
    if (res.voted && res.voted.length) {
      // disable voting if already voted for anything (more advanced: check per position/scope)
      // We'll disable submit if they have at least one vote matching the current scopes.
      // For now: warn and let them see selections if they haven't for that position.
      // Simpler UX: if any vote exists, hide submit.
      submitBtn.disabled = res.voted.length > 0;
      if (res.voted.length > 0) {
        submitBtn.textContent = "You have already voted";
      }
    }
  }

  // Submit votes
  submitBtn.addEventListener("click", async () => {
    const votes = [];
    // gather radio groups by name
    const inputs = document.querySelectorAll("input[type='radio']:checked");
    inputs.forEach(inp => {
      votes.push({
        position: inp.dataset.position,
        candidateId: inp.value,
        scope: inp.dataset.scope,
        target: inp.dataset.scope === "school" ? null : (inp.dataset.scope === "grade" ? user.grade : user.section)
      });
    });

    if (!votes.length) return alert("Select at least one candidate.");

    try {
      await apiFetch("/api/ssg/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes })
      });
      alert("✅ Vote submitted!");
      await checkVoted();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit vote.");
    }
  });

  // Init
  await loadCandidates();
  await checkVoted();
});
