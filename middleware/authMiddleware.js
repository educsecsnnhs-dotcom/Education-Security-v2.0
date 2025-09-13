//middleware/authMiddleware.js

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
  if (!role) return null;
  const key = role.toString().toLowerCase();
  return roleMap[key] || role;
};

/**
 * Ensure user is authenticated
 */
const authRequired = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  // ✅ Normalize roles
  req.user = req.session.user;
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
  const normalizedRole = normalizeRole(role);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role: userRole, extraRoles = [] } = req.user;

    // ✅ SuperAdmin = God mode
    if (userRole === "SuperAdmin") return next();

    if (userRole !== normalizedRole && !extraRoles.includes(normalizedRole)) {
      return res.status(403).json({ message: `Requires role: ${normalizedRole}` });
    }

    next();
  };
};

/**
 * Allow multiple roles
 */
const requireAnyRole = (roles = []) => {
  const normalizedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role: userRole, extraRoles = [] } = req.user;

    // ✅ SuperAdmin = God mode
    if (userRole === "SuperAdmin") return next();

    if (![userRole, ...extraRoles].some((r) => normalizedRoles.includes(r))) {
      return res
        .status(403)
        .json({ message: `Requires one of: ${normalizedRoles.join(", ")}` });
    }

    next();
  };
};

module.exports = { authRequired, requireRole, requireAnyRole };
