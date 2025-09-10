// models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  scope: { type: String, enum: ["schoolwide", "department"], required: true },
  department: { type: String }, // only required if scope === "department"
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Announcement", announcementSchema);
