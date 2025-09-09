// models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: {
      type: String,
      enum: ["All", "Students", "Teachers", "Admins", "SpecificSection"],
      default: "All",
    },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // if SpecificSection
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
