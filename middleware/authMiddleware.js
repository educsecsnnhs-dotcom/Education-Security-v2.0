/**
 * Ensure user is authenticated
 */
const authRequired = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  req.user = req.session.user; // attach session user
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

    const { role: userRole, extraRoles = [] } = req.session.user;

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

    const { role: userRole, extraRoles = [] } = req.session.user;

    if (![userRole, ...extraRoles].some((r) => roles.includes(r))) {
      return res
        .status(403)
        .json({ message: `Requires one of: ${roles.join(", ")}` });
    }

    next();
  };
};

module.exports = { authRequired, requireRole, requireAnyRole };
