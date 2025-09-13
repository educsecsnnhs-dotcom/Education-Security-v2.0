const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require("connect-mongo");

dotenv.config();

const app = express();

/* ---------------------- 🔐 Security & Middleware ---------------------- */

// CORS: allow frontend + backend on same Render domain
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://education-security-v2-0.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// ✅ Trust Render proxy for secure cookies
app.set("trust proxy", 1);

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
      secure: process.env.NODE_ENV === "production", // ✅ only secure in production
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

/* ---------------------- 🔗 Database ---------------------- */
const connectDB = require("./config/db");
connectDB();

/* ---------------------- 🌱 Seeder ---------------------- */
const seedAdmin = require("./seedAdmin");

/* ---------------------- 📦 API Routes ---------------------- */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/registrar", require("./routes/registrar"));
app.use("/api/recordbook", require("./routes/recordbook"));
app.use("/api/ssg", require("./routes/ssg"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/principal", require("./routes/principal"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/announcements", require("./routes/announcement"));
app.use("/api/events", require("./routes/events"));

/* ---------------------- 📂 Static Files ---------------------- */

// Ensure uploads dir exists
if (!fs.existsSync("uploads/announcements")) {
  fs.mkdirSync("uploads/announcements", { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Serve frontend (public folder)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Fallback for SPA/HTML navigation
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------------------- 🚀 Start Server ---------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await seedAdmin(); // create SuperAdmin if missing
});
