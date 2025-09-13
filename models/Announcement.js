//models/Announcement.js

const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  imageUrl: { type: String }, // optional image (upload handled via multer)

  // Scope of announcement
  scope: { 
    type: String, 
    enum: ["school", "department", "section"], 
    required: true 
  },

  // Target audience depending on scope:
  // - If school → leave null
  // - If department → store department name (e.g., STEM, ABM, HUMSS)
  // - If section → store section/strand code (e.g., 11-STEM-A)
  target: { type: String },

  // Who created it
  createdBy: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  },

  // Auto timestamp
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
