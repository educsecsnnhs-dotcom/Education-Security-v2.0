// models/Section.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "7-STE", "11-STEM-A"
    gradeLevel: { type: Number, required: true }, // 7–12
    strand: { type: String, required: true }, // e.g., STE, STEM, HUMSS
    capacity: { type: Number, default: 40 }, // adjustable max students
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    adviser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Moderator
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);
