// models/AttendanceSession.js
const mongoose = require("mongoose");

const AttendanceSessionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  date: { type: Date, default: Date.now },
  isOpen: { type: Boolean, default: true },
  records: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["Present", "Absent", "Late", "Excused"], default: "Present" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("AttendanceSession", AttendanceSessionSchema);
