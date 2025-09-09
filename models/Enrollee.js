// models/Enrollee.js
const mongoose = require("mongoose");

const enrolleeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    lrn: { type: String, required: true, unique: true }, // Learner Reference Number
    gradeLevel: { type: Number, required: true }, // 7–10 (JHS), 11–12 (SHS)
    strand: { type: String }, // e.g., STE, Regular, STEM, HUMSS, etc.
    schoolYear: { type: String, required: true }, // e.g., 2025–2026
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    assignedSection: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Registrar
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrollee", enrolleeSchema);
