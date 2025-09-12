// ssg-events.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  // ✅ Correct role check
  if (!["SSG", "SuperAdmin"].includes(user.role)) {
    alert("Access denied: SSG only");
    window.location.href = "/welcome.html";
    return;
  }

  const form = document.getElementById("eventForm");
  const list = document.getElementById("eventsList");

  /* ---------------- Load Events ---------------- */
  async function loadEvents() {
    list.innerHTML = "Loading...";
    try {
      const events = await apiFetch("/api/ssg/events");
      if (!events || !events.length) {
        list.innerHTML = "<p>No events yet.</p>";
        return;
      }
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
    } catch (err) {
      console.error("❌ Failed to load events:", err);
      list.innerHTML = "<p>⚠️ Error loading events.</p>";
    }
  }

  /* ---------------- Submit New Event ---------------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("desc").value.trim(),
      date: document.getElementById("date").value
    };

    if (!payload.title) {
      alert("⚠️ Title is required.");
      return;
    }

    try {
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
      alert("Failed to create event");
    }
  });

  /* ---------------- Init ---------------- */
  await loadEvents();
});
