document.addEventListener("DOMContentLoaded", () => {
  const user = getUserSession();
  const menuList = document.getElementById("menuList");
  if (!user || !user.role) return;

  const role = user.role;

  // Menu definitions
  const menus = {
    User: [
      { name: "Enrollment", link: "enrollment.html" },
    ],
    Student: [
      { name: "Grades", link: "grades.html" },
      { name: "Attendance", link: "attendance.html" },
      { name: "Vote", link: "vote.html" },
    ],
    Moderator: [
      { name: "Record Book", link: "recordbook.html" },
    ],
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
      { name: "Full Access", link: "principal.html" },
    ],
    SSG: [
      { name: "SSG Management", link: "ssg.html" },
    ],
  };

  // Always include base User menu
  let finalMenu = [...menus.User];

  // Merge role menus
  if (menus[role]) {
    finalMenu = [...finalMenu, ...menus[role]];
  }

  // Special role: SSG can stack on Student or Moderator
  if (user.isSSG) {
    finalMenu.push(...menus.SSG);
  }

  // Inject menu items
  finalMenu.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${item.link}">${item.name}</a>`;
    menuList.appendChild(li);
  });
});
