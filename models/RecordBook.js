// models/RecordBook.js
const mongoose = require("mongoose");

const recordBookSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    sheetId: { type: String, required: true }, // Google Sheet ID
    partial: { type: Boolean, default: true }, // true = partial grades, false = official
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecordBook", recordBookSchema);
