const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB connection
const connectDB = require("./config/db");
const User = require("./models/User");
const { encryptPassword } = require("./utils/caesar");

// Ensure SuperAdmin exists
async function ensureSuperAdmin() {
  try {
    const email = process.env.SUPERADMIN_EMAIL || "superadmin@school.com";
    const password = process.env.SUPERADMIN_PASSWORD || "superpassword";

    const existing = await User.findOne({ role: "SuperAdmin" });
    if (existing) {
      console.log("✅ SuperAdmin already exists:", existing.email);
      return;
    }

    const superAdmin = new User({
      email,
      password: encryptPassword(password),
      role: "SuperAdmin",
      extraRoles: [],
    });

    await superAdmin.save();
    console.log("🎉 SuperAdmin created:", email);
  } catch (err) {
    console.error("❌ Error ensuring SuperAdmin:", err.message);
  }
}

// Connect DB and ensure SuperAdmin
connectDB().then(() => {
  ensureSuperAdmin();
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/registrar", require("./routes/registrar"));
app.use("/api/recordbook", require("./routes/recordbook"));
app.use("/api/ssg", require("./routes/ssg"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/principal", require("./routes/principal"));
app.use("/api/lifecycle", require("./routes/lifecycle"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/announcements", require("./routes/announcement"));
app.use("/api/attendance", require("./routes/attendance"));

// Serve frontend from "public"
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
