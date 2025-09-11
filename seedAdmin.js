// seedAdmin.js
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

async function seedAdmin() {
  try {
    const email = process.env.SUPERADMIN_EMAIL || "superadmin@school.com";
    const password = process.env.SUPERADMIN_PASSWORD || "superadmin123";

    // Check if SuperAdmin already exists
    let admin = await User.findOne({ role: "SuperAdmin" });
    if (!admin) {
      admin = new User({
        email,
        password: encryptPassword(password),
        role: "SuperAdmin",
      });
      await admin.save();
      console.log(`✅ SuperAdmin created: ${email}`);
    } else {
      console.log("ℹ️ SuperAdmin already exists");
    }
  } catch (err) {
    console.error("❌ Error seeding SuperAdmin:", err);
  }
}

module.exports = seedAdmin;
