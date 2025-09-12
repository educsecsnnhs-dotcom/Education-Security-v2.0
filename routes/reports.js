// routes/reports.js
const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");
const router = express.Router();

// Grades summary
router.get("/grades/:dept", authMiddleware, async (req, res) => {
  try {
    const grades = await Grade.find({ department: req.params.dept });
    const passed = grades.filter(g => g.average >= 75).length;
    const failed = grades.filter(g => g.average < 75).length;

    res.json({ passed, failed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance summary
router.get("/attendance/:dept", authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.find({ department: req.params.dept });

    const present = attendance.filter(a => a.status === "Present").length;
    const absent = attendance.filter(a => a.status === "Absent").length;
    const late = attendance.filter(a => a.status === "Late").length;

    res.json({ present, absent, late });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
