// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User"); // adjust path if different
const { encryptPassword } = require("./utils/caesar");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const username = "superadmin";
    const plainPassword = "superpassword"; // CHANGE this later
    const encrypted = encryptPassword(plainPassword);

    // check if SuperAdmin already exists
    let existing = await User.findOne({ username });
    if (existing) {
      console.log("⚠️ SuperAdmin already exists:", existing.username);
      process.exit();
    }

    const superAdmin = new User({
      username,
      password: encrypted,
      role: "SuperAdmin",
    });

    await superAdmin.save();
    console.log("✅ SuperAdmin seeded:", username);

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding SuperAdmin:", err);
    process.exit(1);
  }
};

seedAdmin();
