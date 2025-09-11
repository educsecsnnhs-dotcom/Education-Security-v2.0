// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

dotenv.config();

const run = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI); // Debug

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

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
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

run();
