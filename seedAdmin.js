// seedAdmin.js
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function seedSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "superadmin@school.com";
    const password = "superadmin123"; 
    const role = "SuperAdmin";        

    // Check if SuperAdmin already exists
    let user = await User.findOne({ email });

    if (user) {
      console.log("⚠️ SuperAdmin already exists. Updating details...");
      user.password = password;
      user.role = role;
      user.extraRoles = [];
      await user.save();
    } else {
      console.log("✅ Creating new SuperAdmin...");
      user = new User({
        email,
        password,
        role,
        extraRoles: [],
      });
      await user.save();
    }

    console.log("🎉 SuperAdmin ready:", {
      email: user.email,
      role: user.role,
    });
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding SuperAdmin:", err);
