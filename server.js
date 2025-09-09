// server.js
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/registrar", require("./routes/registrar"));
app.use("/api/recordbook", require("./routes/recordbook"));
app.use("/api/ssg", require("./routes/ssg"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/principal", require("./routes/principal"));
app.use("/api/lifecycle", require("./routes/lifecycle"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/announcement", require("./routes/announcement"));

// Base route
app.get("/", (req, res) => {
  res.send("School Management System API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
