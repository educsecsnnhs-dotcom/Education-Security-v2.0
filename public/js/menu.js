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
  SuperAdmin: [
    { name: "Principal (Full Access)", link: "pages/principal.html" },
  ],
  SSG: [{ name: "SSG Management", link: "pages/ssg.html" }],
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
