document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();
  if (user.role !== "SSG", "SuperAdmin") {
    alert("Access denied: SSG only");
    window.location.href = "/welcome.html";
    return;
  }

  const form = document.getElementById("eventForm");
  const list = document.getElementById("eventsList");

  async function loadEvents() {
    list.innerHTML = "Loading...";
    const events = await apiFetch("/api/ssg/events");
    if (!events.length) { list.innerHTML = "<p>No events</p>"; return; }
    list.innerHTML = "";
    events.forEach(ev => {
      const d = document.createElement("div");
      d.className = "event-card";
      d.innerHTML = `<strong>${ev.title}</strong> <div>${ev.description || ""}</div><div>${ev.date ? new Date(ev.date).toLocaleDateString() : ""}</div>`;
      list.appendChild(d);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = { title: document.getElementById("title").value, description: document.getElementById("desc").value, date: document.getElementById("date").value };
    try {
      await apiFetch("/api/ssg/events", { method: "POST", body: JSON.stringify(payload) });
      alert("Event created");
      form.reset();
      await loadEvents();
    } catch (err) { console.error(err); alert("Failed to create event"); }
  });

  await loadEvents();
});
