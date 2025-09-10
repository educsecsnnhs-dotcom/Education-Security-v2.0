document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const user = Auth.getUser();

  if (!user.isSSG && user.role !== "SuperAdmin") {
    alert("Access denied. Only SSG officers.");
    window.location.href = "welcome.html";
    return;
  }

  const createSection = document.getElementById("createSection");
  const postTitle = document.getElementById("postTitle");
  const postContent = document.getElementById("postContent");
  const createBtn = document.getElementById("createPostBtn");
  const postsList = document.getElementById("postsList");

  // Allow posting if SSG or SuperAdmin
  if (user.isSSG || user.role === "SuperAdmin") {
    createSection.style.display = "block";
  }

  async function loadPosts() {
    postsList.innerHTML = "<p>Loading...</p>";
    const posts = await apiFetch("/api/ssg");

    postsList.innerHTML = "";
    if (posts.length === 0) {
      postsList.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    posts.forEach(post => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <small>Posted by ${post.authorName} on ${new Date(post.createdAt).toLocaleString()}</small>
      `;
      postsList.appendChild(div);
    });
  }

  createBtn.addEventListener("click", async () => {
    if (!postTitle.value || !postContent.value) {
      alert("Please fill in all fields");
      return;
    }

    await apiFetch("/api/ssg/create", {
      method: "POST",
      body: JSON.stringify({
        title: postTitle.value,
        content: postContent.value,
      }),
    });

    postTitle.value = "";
    postContent.value = "";
    await loadPosts();
  });

  await loadPosts();
});
