const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String }, // optional, for images

  scope: { 
    type: String, 
    enum: ["school", "department", "section"], 
    required: true 
  },
  target: { type: String }, 
  // "school" → null
  // "department" → e.g. "STEM", "HUMSS"
  // "section" → e.g. "11-STEM-A"

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", announcementSchema);
