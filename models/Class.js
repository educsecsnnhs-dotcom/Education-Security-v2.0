// models/Class.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true }, // e.g. "Math 10", "Physics 11"
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Moderator
    recordBookId: { type: String }, // Google Sheets ID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
