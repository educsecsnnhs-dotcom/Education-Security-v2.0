// models/Vote.js
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "SSGCandidate", required: true },
  position: { type: String, required: true },
  scope: { type: String, enum: ["school","grade","section"], required: true },
  target: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vote", voteSchema);
