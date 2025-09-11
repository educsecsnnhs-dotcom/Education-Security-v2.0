const express = require("express");
const User = require("../models/User");
const { encryptPassword, comparePassword } = require("../utils/caesar");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (password encrypted with Caesar cipher)
 */
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

    // Encrypt password with Caesar
    const encryptedPassword = encryptPassword(password);

    const user = new User({
      email,
      password: encryptedPassword,
      role: role || "User",   // default role
      extraRoles: []          // optional addon roles
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

/**
 * @route   POST /api/auth/login
 * @desc    Login user (compare Caesar-encrypted passwords)
 */
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

    // Compare input with stored password
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Success
    res.json({
      message: "✅ Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        extraRoles: user.extraRoles,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Simple logout
 */
router.post("/logout", (req, res) => {
  res.json({ message: "✅ Logged out successfully" });
});

module.exports = router;
