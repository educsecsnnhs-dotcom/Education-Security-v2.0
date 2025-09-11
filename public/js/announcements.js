document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  const feed = document.getElementById("announcements");
  const postSection = document.getElementById("postSection");

  // Show post form only for allowed roles
  if (["Admin", "SSG", "Moderator"].includes(user.role)) {
    postSection.style.display = "block";

    // Init Quill
    const quill = new Quill("#editor", {
      theme: "snow",
      placeholder: "Write announcement...",
    });

    // Handle form submit
    document.getElementById("postForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      formData.set("content", quill.root.innerHTML);

      try {
        await apiFetch("/api/announcements", {
          method: "POST",
          body: formData
        });
        alert("✅ Announcement posted!");
        loadAnnouncements();
        e.target.reset();
        quill.setContents([]);
      } catch (err) {
        console.error(err);
        alert("❌ Failed to post announcement");
      }
    });
  }

  // Load announcements feed
  async function loadAnnouncements() {
    feed.innerHTML = "<p>Loading...</p>";
    try {
      const announcements = await apiFetch("/api/announcements");
      feed.innerHTML = "";

      announcements.forEach(post => {
        const div = document.createElement("div");
        div.className = "announcement-card";
        div.innerHTML = `
          <div class="post-header">
            <b>${post.author.name}</b> (${post.author.role})
            <span>📅 ${new Date(post.createdAt).toLocaleString()}</span>
            <span>🎯 ${post.visibility === "school" ? "School-wide" : post.target}</span>
          </div>
          <div class="post-content">${post.content}</div>
          ${
            post.images && post.images.length > 0
              ? `<div class="post-images">${post.images.map(img => `<img src="${img}" alt="post image">`).join("")}</div>`
              : ""
          }
        `;
        feed.appendChild(div);
      });
    } catch (err) {
      feed.innerHTML = "<p>⚠️ Failed to load announcements.</p>";
    }
  }

  loadAnnouncements();
});
