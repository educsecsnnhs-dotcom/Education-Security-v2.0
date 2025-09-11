// public/js/role-management.js
document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireLogin();
  const me = Auth.getUser();

  // Page permission
  if (!["SuperAdmin", "Registrar"].includes(me.role)) {
    alert("Access denied");
    window.location.href = "../welcome.html";
    return;
  }

  // DOM refs
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

  // helper: fetch metadata (sections, strands) for allocations
  async function loadMeta() {
    const [sectionsRes, strandsRes] = await Promise.all([
      apiFetch("/api/meta/sections"),
      apiFetch("/api/meta/strands"),
    ]);
    // populate filter selects
    populateSelect(filterSection, sectionsRes.sections || []);
    populateSelect(filterStrand, strandsRes.strands || []);
  }

  function populateSelect(selectEl, arr) {
    // keep first option
    const start = selectEl.querySelector("option");
    selectEl.innerHTML = "";
    selectEl.appendChild(start);
    arr.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      selectEl.appendChild(opt);
    });
  }

  // load users
  async function loadUsers() {
    try {
      const res = await apiFetch("/api/auth/users"); // { users: [...] }
      allUsers = res.users || [];
      visibleUsers = allUsers;
      renderTable(allUsers);
      updateStats(allUsers);
    } catch (err) {
      console.error("Failed to load users", err);
      usersTableBody.innerHTML = "<tr><td colspan='10'>Failed to load users</td></tr>";
    }
  }

  // render table
  function renderTable(users) {
    usersTableBody.innerHTML = "";
    if (!users.length) {
      document.getElementById("emptyNotice").style.display = "block";
      return;
    } else {
      document.getElementById("emptyNotice").style.display = "none";
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.dataset.id = u._id;

      const workload = computeWorkload(u);

      tr.innerHTML = `
        <td><input type="checkbox" class="rowCheckbox" data-id="${u._id}" /></td>
        <td>${u.lrn || u._id.substring(0,8)}</td>
        <td>${u.name || "-"}</td>
        <td>${u.email || "-"}</td>
        <td>${u.role}</td>
        <td>${(u.extraRoles || []).join(", ") || "-"}</td>
        <td>${(u.sections || []).join(", ") || (u.section ? u.section : "-")}</td>
        <td>${(u.strands || []).join(", ") || (u.strand ? u.strand : "-")}</td>
        <td>${workload}</td>
        <td class="actions-cell"></td>
      `;

      // actions cell
      const actionsCell = tr.querySelector(".actions-cell");
      const canSuper = me.role === "SuperAdmin";
      const canRegistrar = me.role === "Registrar";

      // Promote buttons (Registrar can promote User -> Moderator/Admin; cannot demote)
      if (canSuper) {
        actionsCell.innerHTML += actionBtn("Promote→Registrar", "promoteRegistrar");
        actionsCell.innerHTML += actionBtn("Promote→Admin", "promoteAdmin");
        actionsCell.innerHTML += actionBtn("Promote→Moderator", "promoteModerator");
        // demote
        if (u.role !== "User") {
          actionsCell.innerHTML += actionBtn("Demote→User", "demoteUser");
        }
        // delete
        actionsCell.innerHTML += actionBtn("Delete", "deleteUser", "danger");
      } else if (canRegistrar) {
        // Registrar only sees promote to Admin/Moderator for Users
        if (u.role === "User") {
          actionsCell.innerHTML += actionBtn("Promote→Admin", "promoteAdmin");
          actionsCell.innerHTML += actionBtn("Promote→Moderator", "promoteModerator");
        }
        // SSG toggle visible for Students
        if (u.role === "Student") {
          actionsCell.innerHTML += actionBtn(u.extraRoles?.includes("SSG") ? "Remove SSG" : "Add SSG", "toggleSSG");
        }
      }

      // Allocation dropdowns if user is Moderator/Admin (editable by Registrar & SuperAdmin)
      if ((u.role === "Moderator" || u.role === "Admin") && (canRegistrar || canSuper)) {
        const allocContainer = document.createElement("div");
        allocContainer.className = "alloc-container";

        if (u.role === "Moderator") {
          // section multi-select (simple implementation: input + assign button)
          allocContainer.innerHTML = `
            <input class="alloc-input" placeholder="Assign sections (comma separated)" data-type="section" />
            <button class="btn small assignBtn" data-id="${u._id}" data-type="section">Assign</button>
          `;
        }
        if (u.role === "Admin") {
          allocContainer.innerHTML = `
            <input class="alloc-input" placeholder="Assign strands (comma separated)" data-type="strand" />
            <button class="btn small assignBtn" data-id="${u._id}" data-type="strand">Assign</button>
          `;
        }
        actionsCell.appendChild(allocContainer);
      }

      usersTableBody.appendChild(tr);
    });
  }

  function actionBtn(label, action, style = "") {
    return `<button class="btn small action" data-action="${action}">${label}</button>`;
  }

  // compute workload (simple display for now)
  function computeWorkload(u) {
    const sections = (u.sections || (u.section ? [u.section] : [])).length || 0;
    const strands = (u.strands || (u.strand ? [u.strand] : [])).length || 0;
    if (u.role === "Moderator") return `${sections} section(s)`;
    if (u.role === "Admin") return `${strands} strand(s)`;
    return "-";
  }

  // update stats
  function updateStats(users) {
    statTotal.textContent = users.length;
    statTeachers.textContent = users.filter((u) => u.role === "Moderator").length;
    statHeads.textContent = users.filter((u) => u.role === "Admin").length;
    statStudents.textContent = users.filter((u) => u.role === "Student").length;
  }

  // apply filters / search
  function applyFilterLogic() {
    const q = (globalSearch.value || "").toLowerCase();
    const role = filterRole.value;
    const extra = filterExtra.value;
    const section = filterSection.value;
    const strand = filterStrand.value;

    visibleUsers = allUsers.filter((u) => {
      const text = `${u.name || ""} ${u.email || ""} ${u.lrn || ""}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      if (role && u.role !== role) return false;
      if (extra && !(u.extraRoles || []).includes(extra)) return false;
      if (section) {
        const sections = u.sections || (u.section ? [u.section] : []);
        if (!sections.map(s => s.toLowerCase()).includes(section.toLowerCase())) return false;
      }
      if (strand) {
        const strands = u.strands || (u.strand ? [u.strand] : []);
        if (!strands.map(s => s.toLowerCase()).includes(strand.toLowerCase())) return false;
      }
      return true;
    });

    renderTable(visibleUsers);
    updateStats(visibleUsers);
  }

  applyFilters.addEventListener("click", applyFilterLogic);
  clearFilters.addEventListener("click", () => {
    globalSearch.value = "";
    filterRole.value = "";
    filterExtra.value = "";
    filterSection.value = "";
    filterStrand.value = "";
    visibleUsers = allUsers;
    renderTable(allUsers);
    updateStats(allUsers);
  });

  // select all visible
  selectAll.addEventListener("change", (e) => {
    document.querySelectorAll(".rowCheckbox").forEach(cb => cb.checked = e.target.checked);
  });

  // table actions handler (promote/demote/assign/delete/ssg/assignBtn)
  usersTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button.action, button.assignBtn");
    if (!btn) return;

    // handle assign button
    if (btn.classList.contains("assignBtn")) {
      const id = btn.dataset.id;
      const type = btn.dataset.type; // section / strand
      const input = btn.parentElement.querySelector(".alloc-input");
      const values = input.value.split(",").map(s => s.trim()).filter(Boolean);
      if (!values.length) return alert("Enter at least one value");
      // API: POST /api/roles/allocate with { userId, type, values }
      try {
        await apiFetch("/api/roles/allocate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, type, values }),
        });
        alert("Allocation updated");
        await refresh();
      } catch (err) {
        console.error(err);
        alert("Allocation failed");
      }
      return;
    }

    const action = btn.dataset.action;
    const row = btn.closest("tr");
    const id = row?.dataset.id;

    // Promote actions
    if (action === "promoteModerator") {
      return doPromote(id, "Moderator");
    }
    if (action === "promoteAdmin") {
      return doPromote(id, "Admin");
    }
    if (action === "promoteRegistrar") {
      if (me.role !== "SuperAdmin") return alert("Only SuperAdmin can add registrars");
      return doPromote(id, "Registrar");
    }

    // demote
    if (action === "demoteUser") {
      if (me.role !== "SuperAdmin") return alert("Only SuperAdmin can demote");
      return doDemote(id);
    }

    // toggle SSG
    if (action === "toggleSSG") {
      return toggleSSG(id);
    }

    // delete
    if (action === "deleteUser") {
      if (me.role !== "SuperAdmin") return alert("Only SuperAdmin can delete users");
      if (!confirm("Delete user permanently?")) return;
      try {
        await apiFetch(`/api/auth/users/${id}`, { method: "DELETE" });
        alert("User deleted");
        await refresh();
      } catch (err) {
        console.error(err);
        alert("Delete failed");
      }
    }
  });

  // promote helper
  async function doPromote(userId, role) {
    // Registrar cannot promote existing Student to Moderator/Admin (rule: only User -> staff)
    const target = allUsers.find(u => u._id === userId);
    if (!target) return alert("User not found");
    if (me.role === "Registrar" && target.role !== "User") {
      return alert("Registrar can only promote plain Users to staff roles");
    }

    try {
      await apiFetch("/api/roles/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      alert(`Promoted to ${role}`);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Promote failed");
    }
  }

  // demote helper
  async function doDemote(userId) {
    if (!confirm("Are you sure you want to demote this user to plain User?")) return;
    try {
      await apiFetch("/api/roles/demote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      alert("Demoted to User");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Demote failed");
    }
  }

  // toggle SSG helper
  async function toggleSSG(userId) {
    try {
      await apiFetch("/api/roles/ssg/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      alert("SSG toggled");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Toggle SSG failed");
    }
  }

  // BULK actions
  runBulk.addEventListener("click", async () => {
    const action = bulkAction.value;
    const input = bulkInput.value.trim();
    const selected = Array.from(document.querySelectorAll(".rowCheckbox:checked")).map(cb => cb.dataset.id);
    if (!action) return alert("Choose a bulk action");
    if (!selected.length) return alert("Select users first");

    try {
      if (action === "promoteModerator" || action === "promoteAdmin") {
        const role = action === "promoteModerator" ? "Moderator" : "Admin";
        await apiFetch("/api/roles/promote/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selected, role }),
        });
      } else if (action === "assignSection") {
        if (!input) return alert("Enter section(s) in the input box");
        const values = input.split(",").map(s => s.trim()).filter(Boolean);
        await apiFetch("/api/roles/allocate/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selected, type: "section", values }),
        });
      } else if (action === "assignStrand") {
        if (!input) return alert("Enter strand(s) in the input box");
        const values = input.split(",").map(s => s.trim()).filter(Boolean);
        await apiFetch("/api/roles/allocate/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selected, type: "strand", values }),
        });
      } else if (action === "toggleSSG") {
        await apiFetch("/api/roles/ssg/toggle/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selected }),
        });
      }
      alert("Bulk action completed");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Bulk action failed");
    }
  });

  // Export CSV
  exportCsv.addEventListener("click", () => {
    const rows = [
      ["id","name","email","role","extraRoles","sections","strands"].join(","),
      ...visibleUsers.map(u => `"${u._id}","${u.name || ""}","${u.email || ""}","${u.role || ""}","${(u.extraRoles||[]).join("|")}","${(u.sections||[]).join("|")}","${(u.strands||[]).join("|")}"`)
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `role-management-${Date.now()}.csv`;
    a.click();
  });

  // Audit log modal
  openAudit.addEventListener("click", async () => {
    try {
      const res = await apiFetch("/api/roles/audit");
      auditList.innerHTML = (res.logs || []).map(l => `<div class="audit-row">[${new Date(l.date).toLocaleString()}] <b>${l.byName || l.by}</b> ${l.action} — ${JSON.stringify(l.details)}</div>`).join("");
      auditModal.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      alert("Failed to load audit log");
    }
  });
  closeAudit.addEventListener("click", () => auditModal.classList.add("hidden"));

  // Notifications
  openNotif.addEventListener("click", async () => {
    try {
      const res = await apiFetch("/api/notifications");
      notifList.innerHTML = (res.notifications || []).map(n => `<div class="notif-row">[${new Date(n.date).toLocaleString()}] ${n.message}</div>`).join("");
      notifModal.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      alert("Failed to load notifications");
    }
  });
  closeNotif.addEventListener("click", () => notifModal.classList.add("hidden"));

  // helper refresh
  async function refresh() {
    await loadUsers();
    await loadMeta();
    await loadNotificationsCount();
  }

  // Notifications count
  async function loadNotificationsCount() {
    try {
      const res = await apiFetch("/api/notifications/count");
      notifCount.textContent = res.count || 0;
    } catch (err) {
      console.warn("Failed to load notif count");
    }
  }

  // initial load
  await loadMeta();
  await loadUsers();
  await loadNotificationsCount();
});
