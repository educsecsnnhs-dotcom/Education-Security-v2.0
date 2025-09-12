/**
 * public/js/accessGuard.js
 *
 * Universal role-based access helper.
 * - SuperAdmin bypasses every check (god-mode)
 * - Normalizes role names (supports sessionStorage, localStorage user object,
 *   or a global `window.currentUserRole` if you already set it)
 * - Exposes `checkAccess(allowedRoles, opts)` and `getRole()`
 *
 * Usage:
 *   <script src="/js/accessGuard.js"></script>
 *   <script>checkAccess(["Registrar"]);</script>
 */

(function (window) {
  // Role normalization map (mirror your backend roleMap)
  const roleMap = {
    user: "User",
    users: "User",
    student: "Student",
    students: "Student",
    moderator: "Moderator",
    moderators: "Moderator",
    registrar: "Registrar",
    registrars: "Registrar",
    admin: "Admin",
    admins: "Admin",
    ssg: "SSG",
    superadmin: "SuperAdmin",
    superadmins: "SuperAdmin",
  };

  // Try to find the currently logged user role from common storage locations
  function rawRoleFromStorage() {
    // 1) sessionStorage.role
    try {
      const sRole = sessionStorage.getItem("role");
      if (sRole) return sRole;
    } catch (e) {}

    // 2) localStorage.role
    try {
      const lRole = localStorage.getItem("role");
      if (lRole) return lRole;
    } catch (e) {}

    // 3) localStorage.user (JSON)
    try {
      const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user && (user.role || user?.data?.role)) return user.role || user.data.role;
      }
    } catch (e) {}

    // 4) window.currentUserRole (global set by some pages)
    if (window.currentUserRole) return window.currentUserRole;

    // 5) meta tag or hidden element (optional)
    const roleMeta = document.querySelector('meta[name="role"]');
    if (roleMeta) return roleMeta.getAttribute("content");

    return null;
  }

  // Normalize string -> canonical role (SuperAdmin, Admin, Registrar, Student, Moderator, User, SSG)
  function normalizeRole(r) {
    if (!r) return null;
    if (typeof r !== "string") r = String(r);
    const key = r.trim().toLowerCase();
    return roleMap[key] || r; // fallback to original if unknown
  }

  // Public: get current role (normalized)
  function getRole() {
    const raw = rawRoleFromStorage();
    return normalizeRole(raw);
  }

  /**
   * Public: checkAccess
   * - allowedRoles: array of allowed canonical role strings or lowercase strings (e.g. ["Student"] or ["student"])
   * - opts: { redirectTo: "/", showAlert: true, message: null }
   *
   * Behavior:
   *  - If current role is SuperAdmin => allow (bypass)
   *  - If allowedRoles contains current role => allow
   *  - Otherwise => show alert (if showAlert) and redirect (if redirectTo)
   */
  function checkAccess(allowedRoles = [], opts = {}) {
    const { redirectTo = "/", showAlert = true, message = null } = opts;
    const role = getRole();

    // If role unknown, treat as unauthenticated/denied
    const allowedNormalized = Array.isArray(allowedRoles)
      ? allowedRoles.map(r => normalizeRole(r))
      : [];

    // SuperAdmin bypass
    if (role === "SuperAdmin") return true;

    if (allowedNormalized.includes(role)) return true;

    // Denied
    if (showAlert) {
      const allowedText =
        allowedNormalized.length > 0 ? allowedNormalized.join("/") : "authorized users";
      alert(message || `Access denied. ${allowedText} only.`);
    }

    if (redirectTo) {
      // Small delay so user sees the alert before redirecting
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 20);
    }

    return false;
  }

  // Expose to global
  window.accessGuard = {
    getRole,
    checkAccess,
    normalizeRole,
  };

  // Backwards-compat helpers for quick use
  window.getRole = getRole;
  window.checkAccess = checkAccess;
})(window);
