// models/SSGCandidate.js
const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true }, // e.g., President, VP
  scope: { type: String, enum: ["school","grade","section"], default: "school" },
  target: { type: String, default: null }, // e.g., "11", "11-STEM-A"
  grade: { type: String, default: null }, // optional grade
  section: { type: String, default: null }, // optional section
  photoUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SSGCandidate", candidateSchema);
