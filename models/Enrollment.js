// models/Enrollment.js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // link to registered user
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lrn: {
      type: String,
      required: true,
      minlength: 12,
      maxlength: 12,
    },
    level: {
      type: String,
      enum: ["junior", "senior"],
      required: true,
    },
    strand: {
      type: String,
      required: function () {
        return this.level === "senior" || this.level === "junior";
      },
    },
    section: {
      type: String, // Optional until registrar assigns
      default: null,
    },
    schoolYear: {
      type: String,
      required: true,
    },
    yearLevel: {
      type: Number, // numeric grade (7–12)
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
