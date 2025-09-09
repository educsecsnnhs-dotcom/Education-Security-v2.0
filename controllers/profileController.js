// controllers/profileController.js
const User = require("../models/User");
const { encryptPassword, decryptPassword } = require("../utils/caesar");

/**
 * View own profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

/**
 * Update profile (name, email)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, email },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

/**
 * Change password (with Caesar cipher)
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const decrypted = decryptPassword(user.password);
    if (decrypted !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = encryptPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password", error: err.message });
  }
};
