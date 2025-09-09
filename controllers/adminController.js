// controllers/adminController.js
const Class = require("../models/Class");
const RecordBook = require("../models/RecordBook");
const User = require("../models/User");
const { getSheetValues } = require("../utils/sheetsClient");

/**
 * View all teachers (Moderators) in department
 */
exports.getModerators = async (req, res) => {
  try {
    const { department } = req.user; // Admin must have department assigned
    if (!department) {
      return res.status(400).json({ message: "Admin has no department assigned" });
    }

    const moderators = await User.find({ role: "Moderator", department });
    res.json({ department, moderators });
  } catch (err) {
    res.status(500).json({ message: "Error fetching moderators", error: err.message });
  }
};

/**
 * View all classes handled by moderators in department
 */
exports.getDepartmentClasses = async (req, res) => {
  try {
    const { department } = req.user;

    const classes = await Class.find({ department }).populate("moderatorId", "fullName email");
    res.json({ department, classes });
  } catch (err) {
    res.status(500).json({ message: "Error fetching classes", error: err.message });
  }
};

/**
 * Monitor record book of a specific class
 */
exports.getClassRecordBook = async (req, res) => {
  try {
    const { classId, range } = req.query;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const recordBook = await RecordBook.findOne({ classId });
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });

    const values = await getSheetValues(recordBook.sheetId, range);

    res.json({
      class: cls.name,
      moderator: cls.moderatorId,
      grades: values,
      status: recordBook.partial ? "Partial" : "Official",
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching record book", error: err.message });
  }
};

/**
 * Export department summary
 */
exports.exportDepartmentSummary = async (req, res) => {
  try {
    const { department } = req.user;

    const classes = await Class.find({ department }).populate("moderatorId", "fullName");
    const summary = [];

    for (const cls of classes) {
      const recordBook = await RecordBook.findOne({ classId: cls._id });
      if (recordBook) {
        summary.push({
          class: cls.name,
          moderator: cls.moderatorId.fullName,
          status: recordBook.partial ? "Partial" : "Official",
        });
      }
    }

    res.json({ department, summary });
  } catch (err) {
    res.status(500).json({ message: "Error exporting summary", error: err.message });
  }
};
