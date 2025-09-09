// controllers/authController.js
const User = require("../models/User");
const { decryptPassword, encryptPassword } = require("../utils/caesar");

/**
 * Register a new user
 * Every new account starts with role: "User"
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

/**
 * Login user
 * Password is checked via Caesar decryption
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const decrypted = decryptPassword(user.password);
    if (decrypted !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        extraRoles: user.extraRoles,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

/**
 * Assign role
 * - Registrar can assign: Student, Moderator, SSG
 * - SuperAdmin can assign: Registrar, Admin
 */
exports.assignRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const actingUser = req.user; // from middleware

    // Check permissions
    if (["Student", "Moderator", "SSG"].includes(role)) {
      if (actingUser.role !== "Registrar" && actingUser.role !== "SuperAdmin") {
        return res.status(403).json({ message: "Only Registrar or SuperAdmin can assign this role" });
      }
    } else if (["Registrar", "Admin"].includes(role)) {
      if (actingUser.role !== "SuperAdmin") {
        return res.status(403).json({ message: "Only SuperAdmin can assign this role" });
      }
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Target user not found" });

    // Special case: SSG is stored in extraRoles
    if (role === "SSG") {
      if (!user.extraRoles.includes("SSG")) {
        user.extraRoles.push("SSG");
      }
    } else {
      user.role = role;
    }

    await user.save();
    res.json({ message: `Role ${role} assigned to ${user.fullName}`, user });
  } catch (err) {
    res.status(500).json({ message: "Error assigning role", error: err.message });
  }
};

/**
 * Simple logout
 */
exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};
