// models/Enrollment.js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links to the User model
      required: true,
    },
    strand: {
      type: String, // e.g., STEM, ABM, HUMSS
      required: true,
    },
    section: {
      type: String, // e.g., "Section A"
      required: true,
    },
    yearLevel: {
      type: Number, // e.g., 7–12
      required: true,
    },
    graduated: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    archiveReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
