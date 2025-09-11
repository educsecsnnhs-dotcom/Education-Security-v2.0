// public/js/enrollment.js
document.addEventListener("DOMContentLoaded", () => {
  Auth.requireLogin(); // ensure logged in
  const user = Auth.getUser();

  const levelSelect = document.getElementById("levelSelect");
  const strandSection = document.getElementById("strandSection");
  const strandSelect = document.getElementById("strandSelect");
  const form = document.getElementById("enrollmentForm");

  const juniorStrands = ["STE", "Regular", "TechVoc", "Sports", "SPA"];
  const seniorStrands = ["STEM", "CIT", "GAS", "HUMMS", "TVL", "ABM"];

  // Show strand options depending on level
  levelSelect.addEventListener("change", (e) => {
    strandSelect.innerHTML = "";
    if (e.target.value === "junior") {
      juniorStrands.forEach((s) => {
        strandSelect.innerHTML += `<option value="${s}">${s}</option>`;
      });
      strandSection.style.display = "block";
    } else if (e.target.value === "senior") {
      seniorStrands.forEach((s) => {
        strandSelect.innerHTML += `<option value="${s}">${s}</option>`;
      });
      strandSection.style.display = "block";
    } else {
      strandSection.style.display = "none";
    }
  });

  // Handle submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("userId", user._id);

    try {
      const res = await fetch("/api/lifecycle/enroll", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Show specific backend error if available
        if (data.error) {
          alert(`❌ Enrollment failed: ${data.error}`);
        } else if (data.message) {
          alert(`❌ Enrollment failed: ${data.message}`);
        } else {
          alert("❌ Enrollment failed. Please try again.");
        }
        return;
      }

      alert("✅ Enrollment submitted successfully! Please wait for registrar approval.");
      window.location.href = "../welcome.html";
    } catch (err) {
      console.error(err);
      alert("❌ Network error. Please check your connection and try again.");
    }
  });
});
