// models/Vote.js
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ["school-wide", "grade", "section"], required: true },
  section: { type: String }, // only required if level = section
  positions: [
    {
      position: String,
      candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  ],
  votes: [
    {
      voter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      position: String,
      candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("Vote", voteSchema);
