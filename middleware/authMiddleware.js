/**
 * Role Normalization Map
 */
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
  superadmin: "SuperAdmin",
  ssg: "SSG",
};

/**
 * Normalize a role string
 */
const normalizeRole = (role) => {
  if (!role) return role;
  const key = role.toLowerCase();
  return roleMap[key] || role;
};

/**
 * Ensure user is authenticated
 */
const authRequired = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  req.user = req.session.user;

  // ✅ Normalize main role + extra roles
  req.user.role = normalizeRole(req.user.role);
  if (Array.isArray(req.user.extraRoles)) {
    req.user.extraRoles = req.user.extraRoles.map(normalizeRole);
  }

  next();
};

/**
 * Restrict access by single role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role: userRole, extraRoles = [] } = req.user;

    // ✅ SuperAdmin bypass
    if (userRole === "SuperAdmin") {
      return next();
    }

    if (userRole !== role && !extraRoles.includes(role)) {
      return res.status(403).json({ message: `Requires role: ${role}` });
    }

    next();
  };
};

/**
 * Allow multiple roles
 */
const requireAnyRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role: userRole, extraRoles = [] } = req.user;

    // ✅ SuperAdmin bypass
    if (userRole === "SuperAdmin") {
      return next();
    }

    if (![userRole, ...extraRoles].some((r) => roles.includes(r))) {
      return res
        .status(403)
        .json({ message: `Requires one of: ${roles.join(", ")}` });
    }

    next();
  };
};

module.exports = { authRequired, requireRole, requireAnyRole };
