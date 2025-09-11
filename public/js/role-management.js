document.addEventListener("DOMContentLoaded", async () => {
  const user = Auth.getUser();
  if (!user) {
    alert("Not logged in");
    window.location.href = "../index.html";
    return;
  }

  const tableBody = document.querySelector("#usersTable tbody");

  // Fetch all users
  const res = await fetch("/api/auth/users");
  const data = await res.json();
  const users = data.users || [];

  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.extraRoles.join(", ") || "-"}</td>
      <td class="actions"></td>
    `;

    const actionsTd = tr.querySelector(".actions");

    // SuperAdmin actions
    if (user.role === "SuperAdmin") {
      if (u.role === "User") {
        actionsTd.innerHTML = `
          <button class="btn promote" data-id="${u._id}" data-role="Registrar">Make Registrar</button>
          <button class="btn promote" data-id="${u._id}" data-role="Admin">Make Admin</button>
        `;
      }
    }

    // Registrar actions
    if (user.role === "Registrar") {
      if (u.role === "User") {
        actionsTd.innerHTML = `<button class="btn promote" data-id="${u._id}" data-role="Student">Make Student</button>`;
      }
      if (u.role === "Student") {
        actionsTd.innerHTML += `
          <button class="btn toggle-ssg" data-id="${u._id}">
            ${u.extraRoles.includes("SSG") ? "Remove SSG" : "Add SSG"}
          </button>
        `;
      }
    }

    tableBody.appendChild(tr);
  });

  // Handle promotions
  tableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("promote")) {
      const userId = e.target.dataset.id;
      const role = e.target.dataset.role;

      let url;
      if (role === "Registrar" || role === "Admin") {
        url = "/api/roles/promote/superadmin";
      } else {
        url = "/api/roles/promote/registrar";
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      const result = await res.json();
      alert(result.message);
      location.reload();
    }

    // Handle SSG toggle
    if (e.target.classList.contains("toggle-ssg")) {
      const userId = e.target.dataset.id;

      const res = await fetch("/api/roles/ssg/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();
      alert(result.message);
      location.reload();
    }
  });
});
