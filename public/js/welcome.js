// public/js/welcome.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const container = document.getElementById("schoolAnnouncements");

  try {
    // Fetch announcements (backend auto-filters by role)
    const anns = await apiFetch("/api/announcements");

    if (anns.length === 0) {
      container.innerHTML = "<p>No schoolwide announcements yet.</p>";
      return;
    }

    anns.forEach(a => {
      if (a.scope !== "schoolwide") return; // ignore dept-level here
      const div = document.createElement("div");
      div.className = "announcement-card";
      div.innerHTML = `
        <h3>${a.title}</h3>
        <p>${a.content}</p>
        <small>Posted: ${new Date(a.createdAt).toLocaleString()}</small>
        <hr/>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading announcements.</p>";
  }
});
