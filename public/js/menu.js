document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.getUser();
  const menuList = document.getElementById("menuList");
  if (!user || !user.role) return;

  const role = user.role;

  // Menu definitions
  const menus = {
    User: [{ name: "Enrollment", link: "enrollment.html" }],
    Student: [
      { name: "Grades", link: "grades.html" },
      { name: "Attendance", link: "attendance.html" },
      { name: "Vote", link: "vote.html" },
    ],
    Moderator: [{ name: "Record Book", link: "recordbook.html" }],
    Registrar: [
      { name: "Enrollee", link: "registrar.html" },
      { name: "Enrolled", link: "enrolled.html" },
      { name: "Archives", link: "archives.html" },
    ],
    Admin: [
      { name: "Management", link: "admin.html" },
      { name: "Announcements", link: "announcements.html" },
    ],
    SuperAdmin: [
      { name: "Principal (Full Access)", link: "principal.html" },
    ],
    SSG: [{ name: "SSG Management", link: "ssg.html" }],
  };

  // Start with base User menu
  let finalMenu = [...menus.User];

  // Merge role menus
  if (menus[role]) {
    finalMenu = [...finalMenu, ...menus[role]];
  }

  // Allow stacking extraRoles (new!)
  if (user.extraRoles && Array.isArray(user.extraRoles)) {
    user.extraRoles.forEach(r => {
      if (menus[r]) finalMenu.push(...menus[r]);
    });
  }

  // Special case: SSG (flag or role)
  if (user.isSSG || role === "SSG") {
    finalMenu.push(...menus.SSG);
  }

  // Inject menu items with smooth styling
  finalMenu.forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.link;
    a.textContent = item.name;
    a.classList.add("menu-link");
    li.appendChild(a);
    menuList.appendChild(li);
  });
});
