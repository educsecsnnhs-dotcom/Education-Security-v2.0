document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (user.role !== "Student") {
    alert("Access denied. Students only.");
    window.location.href = "../welcome.html";
    return;
  }

  // Student Info
  document.getElementById("studentName").textContent = user.name || "Unknown";
  document.getElementById("studentLRN").textContent = user.lrn || "N/A";
  document.getElementById("studentGrade").textContent = user.grade || "N/A";
  document.getElementById("studentSection").textContent = user.section?.name || "N/A";

  const votingSection = document.getElementById("votingSection");
  const votedSection = document.getElementById("votedSection");
  const submitBtn = document.getElementById("submitVote");

  // 🔹 1. Check if student has already voted
  try {
    const alreadyVoted = await apiFetch(`/api/ssg/voted/${user._id}`);
    if (alreadyVoted?.voted) {
      votedSection.classList.remove("hidden");
      return;
    }
  } catch (err) {
    console.error("Vote check failed:", err);
  }

  // If not voted, show voting form
  votingSection.classList.remove("hidden");

  const ssgForm = document.getElementById("ssgForm");
  const gradeForm = document.getElementById("gradeForm");
  const sectionForm = document.getElementById("sectionForm");

  // 🔹 2. Fetch candidates
  let candidates;
  try {
    candidates = await apiFetch(`/api/ssg/candidates?grade=${user.grade}&section=${user.section?.name}`);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    alert("⚠️ Failed to load candidates.");
    return;
  }

  // Render candidates with nicer UI
  function renderCandidates(list, form, groupName, emptyMsg) {
    if (list && list.length > 0) {
      list.forEach(c => {
        const wrapper = document.createElement("label");
        wrapper.classList.add("candidate-item");
        wrapper.innerHTML = `
          <input type="radio" name="${groupName}" value="${c._id}" />
          <div class="candidate-card">
            <span class="candidate-name">${c.name}</span>
            <span class="candidate-position">${c.position}</span>
          </div>
        `;
        form.appendChild(wrapper);
      });
    } else {
      form.innerHTML = `<p class="empty">${emptyMsg}</p>`;
    }
  }

  renderCandidates(candidates?.ssg, ssgForm, "ssgVote", "No SSG candidates available.");
  renderCandidates(candidates?.grade, gradeForm, "gradeVote", "No grade-level candidates available.");
  renderCandidates(candidates?.section, sectionForm, "sectionVote", "No section-level candidates available.");

  // 🔹 3. Submit vote
  submitBtn.addEventListener("click", async () => {
    const selectedSSG = document.querySelector("input[name='ssgVote']:checked")?.value;
    const selectedGrade = document.querySelector("input[name='gradeVote']:checked")?.value;
    const selectedSection = document.querySelector("input[name='sectionVote']:checked")?.value;

    if (!selectedSSG || !selectedGrade || !selectedSection) {
      alert("⚠️ Please select a candidate in all categories.");
      return;
    }

    const payload = {
      studentId: user._id,
      ssgVote: selectedSSG,
      gradeVote: selectedGrade,
      sectionVote: selectedSection,
    };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      await apiFetch("/api/ssg/vote", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("✅ Your vote has been submitted successfully!");
      window.location.href = "../welcome.html";
    } catch (err) {
      console.error("Vote failed:", err);
      alert("❌ Failed to submit vote.");
      submitBtn.disabled = false;
      submitBtn.textContent = "✅ Submit Vote";
    }
  });
});
