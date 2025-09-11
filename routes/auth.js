// routes/roles.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authRequired, requireRole } = require("../middleware/roleMiddleware");
const { encryptPassword } = require("../utils/caesar");

/**
 * SuperAdmin → promote User to Registrar or Admin
 */
router.post("/promote/superadmin", authRequired, requireRole("SuperAdmin"), async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["Registrar", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role for SuperAdmin promotion" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: `✅ User promoted to ${role}`, user });
  } catch (err) {
    console.error("Promotion error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Registrar → promote User to Student
 */
router.post("/promote/registrar", authRequired, requireRole("Registrar"), async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "Student";
    await user.save();

    res.json({ message: "✅ User promoted to Student", user });
  } catch (err) {
    console.error("Registrar promotion error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Registrar → assign/remove SSG role (extraRoles array)
 */
router.post("/ssg/toggle", authRequired, requireRole("Registrar"), async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.extraRoles.includes("SSG")) {
      // remove
      user.extraRoles = user.extraRoles.filter(r => r !== "SSG");
    } else {
      // add
      user.extraRoles.push("SSG");
    }

    await user.save();
    res.json({ message: "✅ Updated SSG status", user });
  } catch (err) {
    console.error("SSG toggle error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
