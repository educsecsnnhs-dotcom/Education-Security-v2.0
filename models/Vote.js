// models/Vote.js
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    position: { type: String, required: true },
    gradeLevel: { type: Number }, // only if GradeLevel election
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // only if Section election
  },
  { timestamps: true }
);

// prevent duplicate votes per election per voter
voteSchema.index({ election: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
