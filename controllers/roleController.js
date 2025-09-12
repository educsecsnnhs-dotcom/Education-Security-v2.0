const User = require("../models/User");

// Helper to add to role history
async function logAction(user, action, by, details = {}) {
  user.roleHistory.push({
    action,
    by: by._id,
    byName: by.email,
    details
  });
  await user.save();
}

/**
 * Promote user (role change)
 */
exports.promoteUser = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const actingUser = req.user;

    // 🔒 Block Student promotions (handled by enrollment flow)
    if (role === "Student") {
      return res.status(403).json({ message: "Students can only be created via enrollment approval" });
    }

    // Registrar rules
    if (actingUser.role === "Registrar") {
      if (!["Moderator", "Admin"].includes(role)) {
        return res.status(403).json({ message: "Registrar can only promote to Moderator or Admin" });
      }
    }

    // SuperAdmin rules
    if (actingUser.role === "SuperAdmin") {
      // Allow promoting to Registrar, Admin, Moderator, or demoting to User
      if (!["Registrar", "Admin", "Moderator", "User"].includes(role)) {
        return res.status(403).json({ message: "SuperAdmin can only assign Registrar, Admin, Moderator, or User" });
      }
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    targetUser.role = role;
    await logAction(targetUser, "promote", actingUser, { newRole: role });

    res.json({ message: `✅ ${targetUser.email} promoted to ${role}`, user: targetUser });
  } catch (err) {
    res.status(500).json({ message: "Error promoting user", error: err.message });
  }
};

/**
 * Toggle SSG (extra role)
 */
exports.toggleSSG = async (req, res) => {
  try {
    const { userId } = req.body;
    const actingUser = req.user;

    // Only Registrar or SuperAdmin can toggle SSG
    if (!["Registrar", "SuperAdmin"].includes(actingUser.role)) {
      return res.status(403).json({ message: "Not authorized to toggle SSG role" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (targetUser.extraRoles.includes("SSG")) {
      targetUser.extraRoles = targetUser.extraRoles.filter(r => r !== "SSG");
      await logAction(targetUser, "remove-extra", actingUser, { role: "SSG" });
      res.json({ message: `❌ Removed SSG role from ${targetUser.email}`, user: targetUser });
    } else {
      targetUser.extraRoles.push("SSG");
      await logAction(targetUser, "add-extra", actingUser, { role: "SSG" });
      res.json({ message: `✅ Added SSG role to ${targetUser.email}`, user: targetUser });
    }
  } catch (err) {
    res.status(500).json({ message: "Error toggling SSG role", error: err.message });
  }
};

/**
 * Allocate sections/strands
 */
exports.allocateUser = async (req, res) => {
  try {
    const { userId, sections = [], strands = [] } = req.body;
    const actingUser = req.user;

    // Only Registrar and SuperAdmin can allocate
    if (!["Registrar", "SuperAdmin"].includes(actingUser.role)) {
      return res.status(403).json({ message: "Not authorized to allocate" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    targetUser.sections = sections;
    targetUser.strands = strands;

    await logAction(targetUser, "allocate", actingUser, { sections, strands });

    res.json({ message: `✅ Allocated sections/strands for ${targetUser.email}`, user: targetUser });
  } catch (err) {
    res.status(500).json({ message: "Error allocating user", error: err.message });
  }
};

/**
 * View audit history of a user
 */
exports.getUserHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("email role roleHistory");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.roleHistory);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
};

/**
 * List all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};
