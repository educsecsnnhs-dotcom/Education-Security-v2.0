// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "superadmin@school.com";
  const plainPassword = "superpassword";

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      email,
      password: encryptPassword(plainPassword),
      role: "SuperAdmin",
      extraRoles: [],
    });
    await user.save();
    console.log("✅ SuperAdmin created:", email, "Password:", plainPassword);
  } else {
    console.log("ℹ️ SuperAdmin already exists:", user.email);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
