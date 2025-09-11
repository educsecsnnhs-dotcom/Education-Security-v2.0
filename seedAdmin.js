// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "superadmin@school.com";
    const password = "superpassword";
    const encryptedPassword = encryptPassword(password);

    let superAdmin = await User.findOne({ role: "SuperAdmin" });

    if (!superAdmin) {
      superAdmin = new User({
        email,
        password: encryptedPassword,
        role: "SuperAdmin",
        extraRoles: [],
      });

      await superAdmin.save();
      console.log("✅ SuperAdmin created:", email, "(password:", password, ")");
    } else {
      console.log("ℹ️ SuperAdmin already exists:", superAdmin.email);
    }

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding SuperAdmin:", err);
    mongoose.connection.close();
  }
})();
