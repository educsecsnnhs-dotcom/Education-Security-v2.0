// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

dotenv.config();
const connectDB = require("./config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "superadmin@school.com";
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log("✅ SuperAdmin already exists:", existing.email);
    } else {
      const encryptedPassword = encryptPassword("superpassword");

      const superAdmin = new User({
        email: adminEmail,
        password: encryptedPassword,
        role: "SuperAdmin",
        extraRoles: [],
      });

      await superAdmin.save();
      console.log("🎉 SuperAdmin created:", adminEmail);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding SuperAdmin:", err);
    process.exit(1);
  }
};

seedAdmin();
