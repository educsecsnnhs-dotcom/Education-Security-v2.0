const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String }, // uploaded image (optional)
  scope: { type: String, enum: ["school", "department", "section"], required: true },
  target: { type: String }, // e.g., STEM / 11-STEM-A
  createdBy: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    role: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
