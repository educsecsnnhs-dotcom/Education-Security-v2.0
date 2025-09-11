// controllers/authController.js
const User = require("../models/User");
const { encryptPassword } = require("../utils/caesar");

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Encrypt password before saving
    const encryptedPassword = encryptPassword(password);

    const user = new User({
      fullName,
      email,
      password: encryptedPassword,
      role: "User",
      extraRoles: [],
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Encrypt input password and compare with stored one
    const encrypted = encryptPassword(password);
    if (encrypted !== user.password) {
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
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};
