// routes/auth.js
const express = require("express");
const User = require("../models/User");
const { encryptPassword, comparePassword } = require("../utils/caesar");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * =====================
 * Auth (Register / Login / Logout)
 * =====================
 */

// 🔹 Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const encryptedPassword = encryptPassword(password);

    const user = new User({
      email,
      password: encryptedPassword,
      role: role || "User",
      extraRoles: [],
    });

    await user.save();

    res.status(201).json({
      message: "✅ User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        extraRoles: user.extraRoles,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Save user to session
    req.session.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      extraRoles: user.extraRoles,
    };

    res.json({
      message: "✅ Login successful",
      user: req.session.user,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid"); // remove session cookie
    res.json({ message: "✅ Logged out successfully" });
  });
});

// 🔹 Who am I? (session check)
router.get("/me", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  res.json({ user: req.session.user });
});

/**
 * =====================
 * Role Management
 * =====================
 */

// SuperAdmin → promote User to Registrar or Admin
router.post(
  "/promote/superadmin",
  authRequired,
  requireRole("SuperAdmin"),
  async (req, res) => {
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
  }
);

// Registrar → promote User to Student
router.post(
  "/promote/registrar",
  authRequired,
  requireRole("Registrar"),
  async (req, res) => {
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
  }
);

// Get all users (SuperAdmin or Registrar)
router.get(
  "/users",
  authRequired,
  requireRole("SuperAdmin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json({ users });
    } catch (err) {
      console.error("❌ Fetch users error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Registrar → assign/remove SSG role
router.post(
  "/ssg/toggle",
  authRequired,
  requireRole("Registrar"),
  async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.extraRoles.includes("SSG")) {
        user.extraRoles = user.extraRoles.filter((r) => r !== "SSG");
      } else {
        user.extraRoles.push("SSG");
      }

      await user.save();
      res.json({ message: "✅ Updated SSG status", user });
    } catch (err) {
      console.error("SSG toggle error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
