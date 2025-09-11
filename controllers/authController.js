// controllers/authController.js
const User = require("../models/User");
const { encrypt, decrypt } = require("../utils/caesar");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Encrypt password with Caesar
    const encryptedPassword = encrypt(password);

    const user = new User({
      email,
      password: encryptedPassword,
      role: "User", // default
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare encrypted passwords
    const encryptedInput = encrypt(password);
    if (encryptedInput !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // No JWTs — just return user object
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        extraRoles: user.extraRoles,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
