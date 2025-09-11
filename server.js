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
connectDB();

// ✅ Import Seeder
const seedAdmin = require("./seedAdmin");

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
app.use("/api/sections", require("./routes/section")); // ✅ New Section routes

// Serve frontend from "public"
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

// Start Server + Seed SuperAdmin
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedAdmin(); // ✅ Create SuperAdmin if missing
});
