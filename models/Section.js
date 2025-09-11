// models/Section.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "7-STE-A", "11-STEM-B"
    gradeLevel: { type: Number, required: true }, // 7–12
    strand: { type: String, required: true }, // e.g., STE, STEM, HUMSS
    schoolYear: { type: String, required: true }, // e.g., "2025-2026"
    capacity: { type: Number, default: 40 }, // adjustable max students

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    adviser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Moderator assigned as adviser
      default: null,
    },

    // Performance distribution tracking (optional, for smarter balancing)
    distribution: {
      high: { type: Number, default: 0 }, // count of high-performing
      mid: { type: Number, default: 0 }, // count of mid-performing
      low: { type: Number, default: 0 }, // count of low-performing
    },
  },
  { timestamps: true }
);

// Ensure no section exceeds capacity
sectionSchema.methods.hasSpace = function () {
  return this.students.length < this.capacity;
};

module.exports = mongoose.model("Section", sectionSchema);
