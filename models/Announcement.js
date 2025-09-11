const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    role: String,
    department: String,
    strand: String
  },
  visibility: {
    type: String,
    enum: ["school", "department", "strand"],
    required: true
  },
  target: { type: String }, // department name OR strand name (if applicable)
  content: { type: String, required: true }, // stored as HTML from Quill
  images: [String], // uploaded file paths
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", announcementSchema);
