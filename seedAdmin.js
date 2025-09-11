// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "superadmin@gmail.com";
    const password = "supersecret"; // default password
    const role = "SuperAdmin";

    // Check if already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("⚠️ SuperAdmin already exists");
    } else {
      const encryptedPassword = encryptPassword(password);

      user = new User({
        email,
        password: encryptedPassword,
        role,
        extraRoles: ["Admin", "Principal"], // give extra powers if you want
      });

      await user.save();
      console.log(`🎉 SuperAdmin created: ${email} / ${password}`);
    }

    mongoose.connection.close();
    console.log("🔌 DB connection closed");
  } catch (err) {
    console.error("❌ Error seeding SuperAdmin:", err);
    mongoose.connection.close();
  }
};

seedAdmin();
