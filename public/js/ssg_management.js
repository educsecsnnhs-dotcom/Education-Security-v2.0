// public/js/ssg-events.js
document.addEventListener("DOMContentLoaded", () => {
  checkAccess(["SSG", "Registrar"], { redirectTo: "/welcome.html" });
  }

  const form = document.getElementById("eventForm");
  const list = document.getElementById("eventsList");
  const lastUpdated = document.getElementById("lastUpdated");

  /* ---------------- Load Events ---------------- */
  async function loadEvents() {
    list.innerHTML = "<p>Loading events...</p>";
    try {
      const events = await apiFetch("/api/ssg/events");
      if (!events || !events.length) {
        list.innerHTML = "<p>No events yet.</p>";
        return;
      }

      // Sort by date (descending)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      list.innerHTML = "";
      events.forEach(ev => {
        const d = document.createElement("div");
        d.className = "event-card";
        d.innerHTML = `
          <strong>${ev.title}</strong>
          <div>${ev.description || ""}</div>
          <div>${ev.date ? new Date(ev.date).toLocaleDateString() : ""}</div>
        `;
        list.appendChild(d);
      });

      updateTimestamp();
    } catch (err) {
      console.error("❌ Failed to load events:", err);
      list.innerHTML = "<p>⚠️ Error loading events.</p>";
    }
  }

  /* ---------------- Submit New Event ---------------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("title");
    const descInput = document.getElementById("desc");
    const dateInput = document.getElementById("date");

    const payload = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      date: dateInput.value
    };

    if (!payload.title) {
      alert("⚠️ Title is required.");
      return;
    }

    try {
      // Disable submit button during request
      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      await apiFetch("/api/ssg/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("✅ Event created");
      form.reset();
      await loadEvents();
    } catch (err) {
      console.error("❌ Failed to create event:", err);
      alert("⚠️ Failed to create event.");
    } finally {
      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------------- Helpers ---------------- */
  function updateTimestamp() {
    if (lastUpdated) {
      lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  }

  /* ---------------- Init ---------------- */
  await loadEvents();
});
