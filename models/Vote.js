// models/Vote.js
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "SSGCandidate", required: true },
  position: { type: String, required: true },
  scope: { type: String, enum: ["school","grade","section"], required: true },
  target: { type: String, default: null }, // grade or section if scope != school
  createdAt: { type: Date, default: Date.now }
});

// Optional: add an index to help queries (not enforcing uniqueness across position here)
voteSchema.index({ voterId: 1, position: 1, scope: 1, target: 1 }, { unique: false });

module.exports = mongoose.model("Vote", voteSchema);
