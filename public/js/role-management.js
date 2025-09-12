// public/js/role-management.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const me = Auth.getUser();

  // ✅ Only Registrar & SuperAdmin
  if (!["SuperAdmin", "Registrar"].includes(me.role)) {
    alert("❌ Access denied");
    window.location.href = "/welcome.html";
    return;
  }

  // 🔹 Dropdown options
  const ROLE_OPTIONS = ["User", "Student", "Moderator", "Admin", "Registrar", "SuperAdmin"];
  const EXTRA_OPTIONS = ["SSG"];
  const BULK_ACTIONS = [
    { value: "promoteModerator", label: "Promote → Moderator" },
    { value: "promoteAdmin", label: "Promote → Admin" },
    { value: "assignSection", label: "Assign Section" },
    { value: "assignStrand", label: "Assign Strand" },
    { value: "toggleSSG", label: "Toggle SSG" }
  ];

  populateSelect(document.getElementById("filterRole"), ["All roles", ...ROLE_OPTIONS]);
  populateSelect(document.getElementById("filterExtra"), ["All extra roles", ...EXTRA_OPTIONS]);
  populateSelect(document.getElementById("filterSection"), ["All sections"]);
  populateSelect(document.getElementById("filterStrand"), ["All strands"]);
  populateSelect(document.getElementById("bulkAction"), ["Bulk actions", ...BULK_ACTIONS.map(a => a.label)], BULK_ACTIONS);

  function populateSelect(select, items, mapArr = null) {
    select.innerHTML = "";
    items.forEach((item, i) => {
      const opt = document.createElement("option");
      if (Array.isArray(mapArr)) {
        opt.value = mapArr[i].value;
        opt.textContent = mapArr[i].label;
      } else {
        opt.value = i === 0 ? "" : item;
        opt.textContent = item;
      }
      select.appendChild(opt);
    });
  }

  // 🔹 UI refs
  const usersTableBody = document.querySelector("#usersTable tbody");
  const globalSearch = document.getElementById("globalSearch");
  const filterRole = document.getElementById("filterRole");
  const filterExtra = document.getElementById("filterExtra");
  const filterSection = document.getElementById("filterSection");
  const filterStrand = document.getElementById("filterStrand");
  const applyFilters = document.getElementById("applyFilters");
  const clearFilters = document.getElementById("clearFilters");
  const statTotal = document.getElementById("statTotal");
  const statTeachers = document.getElementById("statTeachers");
  const statHeads = document.getElementById("statHeads");
  const statStudents = document.getElementById("statStudents");
  const selectAll = document.getElementById("selectAll");
  const bulkAction = document.getElementById("bulkAction");
  const bulkInput = document.getElementById("bulkInput");
  const runBulk = document.getElementById("runBulk");
  const exportCsv = document.getElementById("exportCsv");
  const openAudit = document.getElementById("openAudit");
  const auditModal = document.getElementById("auditModal");
  const auditList = document.getElementById("auditList");
  const closeAudit = document.getElementById("closeAudit");
  const openNotif = document.getElementById("openNotif");
  const notifModal = document.getElementById("notifModal");
  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");
  const closeNotif = document.getElementById("closeNotif");

  let allUsers = [];
  let visibleUsers = [];

  // 🔹 Load metadata
  async function loadMeta() {
    try {
      const [sectionsRes, strandsRes] = await Promise.all([
        apiFetch("/api/meta/sections"),
        apiFetch("/api/meta/strands"),
      ]);
      populateSelect(filterSection, ["All sections", ...(sectionsRes.sections || [])]);
      populateSelect(filterStrand, ["All strands", ...(strandsRes.strands || [])]);
    } catch (err) {
      console.error("Meta load error:", err);
    }
  }

  // 🔹 Load users
  async function loadUsers() {
    try {
      const res = await apiFetch("/api/auth/users");
      allUsers = res.users || [];
      visibleUsers = allUsers;
      renderTable(visibleUsers);
      updateStats(visibleUsers);
    } catch (err) {
      console.error("User load error:", err);
      usersTableBody.innerHTML = `<tr><td colspan="10">⚠️ Error loading users</td></tr>`;
    }
  }

  // 🔹 Render table
  function renderTable(users) {
    usersTableBody.innerHTML = "";
    if (!users.length) {
      document.getElementById("emptyNotice").style.display = "block";
      return;
    }
    document.getElementById("emptyNotice").style.display = "none";

    users.forEach(u => {
      const tr = document.createElement("tr");
      tr.dataset.id = u._id;

      const workload = computeWorkload(u);
      tr.innerHTML = `
        <td><input type="checkbox" class="rowCheckbox" data-id="${u._id}" /></td>
        <td>${u.lrn || u._id.slice(0,8)}</td>
        <td>${u.name || "-"}</td>
        <td>${u.email || "-"}</td>
        <td><span class="role-badge ${u.role.toLowerCase()}">${u.role}</span></td>
        <td>${(u.extraRoles || []).join(", ") || "-"}</td>
        <td>${(u.sections || []).join(", ") || "-"}</td>
        <td>${(u.strands || []).join(", ") || "-"}</td>
        <td>${workload}</td>
        <td class="actions-cell"></td>
      `;

      const actionsCell = tr.querySelector(".actions-cell");
      if (me.role === "SuperAdmin") {
        actionsCell.innerHTML += btn("Promote→Registrar", "promoteRegistrar");
        actionsCell.innerHTML += btn("Promote→Admin", "promoteAdmin");
        actionsCell.innerHTML += btn("Promote→Moderator", "promoteModerator");
        if (u.role !== "User") actionsCell.innerHTML += btn("Demote→User", "demoteUser", "danger");
        actionsCell.innerHTML += btn("Delete", "deleteUser", "danger");
      } else if (me.role === "Registrar") {
        if (u.role === "User") {
          actionsCell.innerHTML += btn("Promote→Admin", "promoteAdmin");
          actionsCell.innerHTML += btn("Promote→Moderator", "promoteModerator");
        }
        if (u.role === "Student") {
          actionsCell.innerHTML += btn(
            u.extraRoles?.includes("SSG") ? "Remove SSG" : "Add SSG",
            "toggleSSG"
          );
        }
      }

      usersTableBody.appendChild(tr);
    });
  }

  function btn(label, action, type="") {
    return `<button class="btn small ${type}" data-action="${action}">${label}</button>`;
  }

  function computeWorkload(u) {
    if (u.role === "Moderator") return `${(u.sections||[]).length} section(s)`;
    if (u.role === "Admin") return `${(u.strands||[]).length} strand(s)`;
    return "-";
  }

  function updateStats(users) {
    statTotal.textContent = users.length;
    statTeachers.textContent = users.filter(u => u.role==="Moderator").length;
    statHeads.textContent = users.filter(u => u.role==="Admin").length;
    statStudents.textContent = users.filter(u => u.role==="Student").length;
  }

  // 🔹 Filtering
  applyFilters.addEventListener("click", () => {
    const q = globalSearch.value.toLowerCase();
    visibleUsers = allUsers.filter(u => {
      return (!q || `${u.name} ${u.email} ${u.lrn}`.toLowerCase().includes(q)) &&
             (!filterRole.value || u.role === filterRole.value) &&
             (!filterExtra.value || (u.extraRoles||[]).includes(filterExtra.value)) &&
             (!filterSection.value || (u.sections||[]).includes(filterSection.value)) &&
             (!filterStrand.value || (u.strands||[]).includes(filterStrand.value));
    });
    renderTable(visibleUsers);
    updateStats(visibleUsers);
  });

  clearFilters.addEventListener("click", () => {
    globalSearch.value="";
    filterRole.value="";
    filterExtra.value="";
    filterSection.value="";
    filterStrand.value="";
    visibleUsers = allUsers;
    renderTable(allUsers);
    updateStats(allUsers);
  });

  // 🔹 Select all
  selectAll.addEventListener("change", e => {
    document.querySelectorAll(".rowCheckbox").forEach(cb => cb.checked=e.target.checked);
  });

  // 🔹 Export CSV (safe escaping)
  exportCsv.addEventListener("click", () => {
    const escapeCsv = (val) => {
      if (val == null) return "";
      val = String(val);
      return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
    };
    const rows = [
      ["id","name","email","role","extraRoles","sections","strands"].map(escapeCsv).join(","),
      ...visibleUsers.map(u => [
        u._id,
        u.name,
        u.email,
        u.role,
        (u.extraRoles||[]).join("|"),
        (u.sections||[]).join("|"),
        (u.strands||[]).join("|")
      ].map(escapeCsv).join(","))
    ];
    const blob = new Blob([rows.join("\n")], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `role-management-${Date.now()}.csv`;
    a.click();
  });

  // 🔹 Audit modal
  openAudit.addEventListener("click", async () => {
    try {
      const res = await apiFetch("/api/roles/audit");
      auditList.innerHTML = (res.logs||[])
        .map(l => `<div class="audit-row">[${new Date(l.date).toLocaleString()}] ${l.by}: ${l.action} — ${JSON.stringify(l.details)}</div>`)
        .join("") || "<div>No audit logs found</div>";
      auditModal.classList.remove("hidden");
    } catch (err) {
      console.error("Audit error:", err);
      auditList.innerHTML = "<div>⚠️ Failed to load audit logs</div>";
      auditModal.classList.remove("hidden");
    }
  });
  closeAudit.addEventListener("click", () => auditModal.classList.add("hidden"));

  // 🔹 Notifications
  openNotif.addEventListener("click", async () => {
    try {
      const res = await apiFetch("/api/notifications");
      notifList.innerHTML = (res.notifications||[])
        .map(n => `<div class="notif-row">[${new Date(n.date).toLocaleString()}] ${n.message}</div>`)
        .join("") || "<div>No notifications</div>";
      notifModal.classList.remove("hidden");
    } catch (err) {
      console.error("Notif error:", err);
      notifList.innerHTML = "<div>⚠️ Failed to load notifications</div>";
      notifModal.classList.remove("hidden");
    }
  });
  closeNotif.addEventListener("click", () => notifModal.classList.add("hidden"));

  // 🔹 Init
  await loadMeta();
  await loadUsers();
});
