const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Routes
const announcementsRoute = require("./routes/announcement"); // ✅ singular filename
const eventsRoute = require("./routes/events");
const reportsRoute = require("./routes/reports");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true, // or set specific frontend URL: ["http://localhost:3000"]
  credentials: true, // ✅ allow cookies
}));
app.use(express.json());
app.use(morgan("dev"));

// ✅ Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ true if https
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

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
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/sections", require("./routes/section")); 
app.use("/api/announcements", announcementsRoute);
app.use("/api/events", eventsRoute);
app.use("/api/reports", reportsRoute);

// ensure uploads dir exists
if (!fs.existsSync("uploads/announcements")) {
  fs.mkdirSync("uploads/announcements", { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
