const mongoose = require("mongoose");

const ssgPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true }, // capture officer’s name
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SSGPost", ssgPostSchema);
