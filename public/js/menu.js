document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.getUser();
  const menuList = document.getElementById("menuList");
  if (!user || !user.role) return;

  const role = user.role;

  // -----------------------------
  // Role-based Menu Definitions
  // -----------------------------
  const menus = {
    User: [
      { name: "Enrollment", link: "pages/enrollment.html" },
    ],
    Student: [
      { name: "Grades", link: "pages/grades.html" },
      { name: "Attendance", link: "pages/attendance.html" },
      { name: "Vote", link: "pages/vote.html" },
    ],
    Moderator: [
      { name: "Record Book", link: "pages/recordbook.html" },
    ],
    Registrar: [
      { name: "Enrollee", link: "pages/registrar.html" },
      { name: "Enrolled", link: "pages/enrolled.html" },
      { name: "Archives", link: "pages/archives.html" },
    ],
    Admin: [
      { name: "Management", link: "pages/admin.html" },
      { name: "Announcements", link: "pages/announcements.html" },
    ],
    SuperAdmin: [
      // Full Access (includes everything)
      { name: "Enrollment", link: "pages/enrollment.html" },
      { name: "Grades", link: "pages/grades.html" },
      { name: "Attendance", link: "pages/attendance.html" },
      { name: "Vote", link: "pages/vote.html" },
      { name: "Record Book", link: "pages/recordbook.html" },
      { name: "Enrollee", link: "pages/registrar.html" },
      { name: "Enrolled", link: "pages/enrolled.html" },
      { name: "Archives", link: "pages/archives.html" },
      { name: "Management", link: "pages/admin.html" },
      { name: "Announcements", link: "pages/announcements.html" },
      { name: "SSG Management", link: "pages/ssg.html" },
    ],
    SSG: [
      { name: "SSG Management", link: "pages/ssg.html" },
    ],
  };

  // -----------------------------
  // Build Menu
  // -----------------------------
  let finalMenu = [...menus.User]; // Always include base User menu

  if (menus[role]) {
    finalMenu = [...finalMenu, ...menus[role]];
  }

  // Add extra roles if assigned
  if (user.extraRoles && Array.isArray(user.extraRoles)) {
    user.extraRoles.forEach(r => {
      if (menus[r]) finalMenu.push(...menus[r]);
    });
  }

  // Special case: SSG flag
  if (user.isSSG || role === "SSG") {
    finalMenu.push(...menus.SSG);
  }

  // Inject menu items into sidebar
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
