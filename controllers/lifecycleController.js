// controllers/lifecycleController.js
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

/**
 * Promote student (e.g., Grade 7 → Grade 8, or SHS promotion)
 */
exports.promoteStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Enrollment.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found in enrollment" });

    // Example: Grade 7 → Grade 8
    if (student.yearLevel < 12) {
      student.yearLevel += 1;
      await student.save();
      return res.json({ message: `Student promoted to Grade ${student.yearLevel}`, student });
    } else {
      return res.status(400).json({ message: "Student already at highest grade" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error promoting student", error: err.message });
  }
};

/**
 * Graduate student (moves to alumni archive)
 */
exports.graduateStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Enrollment.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.yearLevel === 12) {
      student.graduated = true;
      await student.save();

      // Also update user account
      await User.findByIdAndUpdate(student.studentId, { status: "Alumni" });

      return res.json({ message: "Student graduated successfully", student });
    } else {
      return res.status(400).json({ message: "Student not yet in Grade 12" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error graduating student", error: err.message });
  }
};

/**
 * Archive student (dropout, transfer, etc.)
 */
exports.archiveStudent = async (req, res) => {
  try {
    const { studentId, reason } = req.body;

    const student = await Enrollment.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.archived = true;
    student.archiveReason = reason || "Unknown";
    await student.save();

    // Disable login
    await User.findByIdAndUpdate(student.studentId, { status: "Archived" });

    res.json({ message: "Student archived successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Error archiving student", error: err.message });
  }
};

/**
 * Restore archived student (if wrongly archived or returning)
 */
exports.restoreStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Enrollment.findOne({ studentId });
    if (!student || !student.archived) {
      return res.status(404).json({ message: "Student not found in archive" });
    }

    student.archived = false;
    student.archiveReason = null;
    await student.save();

    await User.findByIdAndUpdate(student.studentId, { status: "Active" });

    res.json({ message: "Student restored successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Error restoring student", error: err.message });
  }
};
