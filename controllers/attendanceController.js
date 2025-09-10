// controllers/attendanceController.js
const AttendanceSession = require("../models/AttendanceSession");
const Class = require("../models/Class");

/**
 * Moderator: Open attendance session
 */
exports.openSession = async (req, res) => {
  try {
    const { classId } = req.body;

    const existing = await AttendanceSession.findOne({
      classId,
      date: { $gte: new Date().setHours(0,0,0,0) } // today
    });

    if (existing && existing.isOpen) {
      return res.status(400).json({ message: "Attendance already open today" });
    }

    const session = new AttendanceSession({ classId, isOpen: true });
    await session.save();

    res.status(201).json({ message: "Attendance opened", session });
  } catch (err) {
    res.status(500).json({ message: "Error opening attendance", error: err.message });
  }
};

/**
 * Moderator: Close session
 */
exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.isOpen = false;
    await session.save();

    res.json({ message: "Attendance closed", session });
  } catch (err) {
    res.status(500).json({ message: "Error closing attendance", error: err.message });
  }
};

/**
 * Student: Mark present
 */
exports.markPresent = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const studentId = req.user._id; // requires auth middleware

    const session = await AttendanceSession.findById(sessionId);
    if (!session || !session.isOpen) {
      return res.status(400).json({ message: "Attendance is closed" });
    }

    const already = session.records.find(r => r.studentId.toString() === studentId.toString());
    if (already) return res.status(400).json({ message: "Already marked present" });

    session.records.push({ studentId, status: "Present" });
    await session.save();

    res.json({ message: "Marked present ✅", session });
  } catch (err) {
    res.status(500).json({ message: "Error marking present", error: err.message });
  }
};

/**
 * Student: Get my attendance history
 */
exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    const sessions = await AttendanceSession.find({ "records.studentId": studentId })
      .populate("classId", "name");

    const history = [];
    sessions.forEach(sess => {
      const rec = sess.records.find(r => r.studentId.toString() === studentId.toString());
      history.push({
        class: sess.classId.name,
        date: sess.date,
        status: rec.status,
      });
    });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
};
