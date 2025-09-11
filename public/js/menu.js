document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.getUser();
  const menuList = document.getElementById("menuList");
  if (!user || !user.role) return;

  const role = user.role;

  // Menu definitions
  const menus = {
    User: [{ name: "Enrollment", link: "pages/enrollment.html" }],
    Student: [
      { name: "Grades", link: "pages/grades.html" },
      { name: "Attendance", link: "pages/attendance.html" },
      { name: "Vote", link: "pages/vote.html" },
    ],
    Moderator: [{ name: "Record Book", link: "pages/recordbook.html" }],
    Registrar: [
      { name: "Enrollee", link: "pages/registrar.html" },
      { name: "Enrolled", link: "pages/enrolled.html" },
      { name: "Archives", link: "pages/archives.html" },
    ],
    Admin: [
      { name: "Management", link: "pages/admin.html" },
      { name: "Announcements", link: "pages/announcements.html" },
    ],
    SSG: [{ name: "SSG Management", link: "pages/ssg.html" }],
    SuperAdmin: [
      { name: "Role Management", link: "pages/role-management.html" }, // new
    ],
  };

  let finalMenu = [];

  if (role === "SuperAdmin") {
    // SuperAdmin = full access: merge ALL menus
    Object.values(menus).forEach(arr => {
      finalMenu.push(...arr);
    });
  } else {
    // Start with base User menu
    finalMenu = [...menus.User];

    // Merge role menus
    if (menus[role]) {
      finalMenu = [...finalMenu, ...menus[role]];
    }

    // Allow stacking extraRoles
    if (user.extraRoles && Array.isArray(user.extraRoles)) {
      user.extraRoles.forEach(r => {
        if (menus[r]) finalMenu.push(...menus[r]);
      });
    }

    // Special case: SSG (flag or role)
    if (user.isSSG || role === "SSG") {
      finalMenu.push(...menus.SSG);
    }
  }

  // Remove duplicates (by name)
  const uniqueMenu = [];
  const seen = new Set();
  finalMenu.forEach(item => {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      uniqueMenu.push(item);
    }
  });

  // Inject menu items
  uniqueMenu.forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.link;
    a.textContent = item.name;
    a.classList.add("menu-link");
    li.appendChild(a);
    menuList.appendChild(li);
  });
});
