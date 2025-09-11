// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

dotenv.config();

const EMAIL = process.env.SEED_ADMIN_EMAIL || "superadmin@school.com";
const PLAIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "superpassword";
const ROLE = "SuperAdmin";

async function run() {
  try {
    console.log("🔎 seedAdmin starting...");
    console.log("MONGO_URI present?", !!process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env — cannot connect to DB.");
      process.exit(1);
    }

    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected.");

    const encrypted = encryptPassword(PLAIN_PASSWORD);

    // Try to find by email first
    let user = await User.findOne({ email: EMAIL });

    if (!user) {
      console.log("⚡ No user found with email, creating SuperAdmin...");
      user = new User({
        email: EMAIL,
        password: encrypted,
        role: ROLE,
        extraRoles: [],
      });
      await user.save();
      console.log(`🎉 SuperAdmin created: ${EMAIL} / ${PLAIN_PASSWORD}`);
    } else {
      console.log("ℹ️ User with this email already exists:", user.email, "role:", user.role);

      if (user.role !== ROLE) {
        console.log(`⚡ Updating existing user's role to ${ROLE} and resetting password...`);
        user.role = ROLE;
        user.password = encrypted;
        await user.save();
        console.log("✅ User updated to SuperAdmin and password reset.");
      } else {
        console.log("✅ User already SuperAdmin — nothing to change (you can log in with existing credentials).");
      }
    }

    await mongoose.disconnect();
    console.log("🔒 DB disconnected. Seed finished.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
