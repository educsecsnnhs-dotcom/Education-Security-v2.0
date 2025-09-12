// models/Vote.js
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "SSGCandidate", required: true },
  scope: { type: String, enum: ["school","grade","section"], required: true },
  target: { type: String, default: null }, // grade or section if scope != school
  createdAt: { type: Date, default: Date.now }
});

// ensure one vote per voter per scope+target+position: we enforce at app level (and can add compound unique index if needed per position)
module.exports = mongoose.model("Vote", voteSchema);
;
