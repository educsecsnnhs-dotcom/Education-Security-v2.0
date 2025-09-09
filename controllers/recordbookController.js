// controllers/recordbookController.js
const RecordBook = require("../models/RecordBook");
const Class = require("../models/Class");
const { getSheetValues, updateSheetValues } = require("../utils/sheetsClient");

/**
 * Create record book for a class
 */
exports.createRecordBook = async (req, res) => {
  try {
    const { classId, sheetId } = req.body;

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const recordBook = new RecordBook({
      classId,
      sheetId,
      partial: true,
    });

    await recordBook.save();
    cls.recordBookId = sheetId;
    await cls.save();

    res.status(201).json({ message: "Record book created", recordBook });
  } catch (err) {
    res.status(500).json({ message: "Error creating record book", error: err.message });
  }
};

/**
 * Input grades (teacher updates sheet)
 */
exports.inputGrades = async (req, res) => {
  try {
    const { recordBookId, range, values } = req.body; // range = "Sheet1!B2:C10"

    const recordBook = await RecordBook.findById(recordBookId);
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });

    await updateSheetValues(recordBook.sheetId, range, values);

    res.json({ message: "Grades updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating grades", error: err.message });
  }
};

/**
 * Get student grades (view only)
 */
exports.getStudentGrades = async (req, res) => {
  try {
    const { recordBookId, range } = req.query;

    const recordBook = await RecordBook.findById(recordBookId);
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });

    const values = await getSheetValues(recordBook.sheetId, range);

    res.json({
      partial: recordBook.partial,
      grades: values,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching grades", error: err.message });
  }
};

/**
 * Toggle partial/official grades
 */
exports.finalizeGrades = async (req, res) => {
  try {
    const { recordBookId } = req.body;

    const recordBook = await RecordBook.findById(recordBookId);
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });

    recordBook.partial = false;
    await recordBook.save();

    res.json({ message: "Grades finalized", recordBook });
  } catch (err) {
    res.status(500).json({ message: "Error finalizing grades", error: err.message });
  }
};

/**
 * Mark attendance
 */
exports.markAttendance = async (req, res) => {
  try {
    const { recordBookId, range, values } = req.body; // e.g. ["Present", "Excused"]

    const recordBook = await RecordBook.findById(recordBookId);
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });

    await updateSheetValues(recordBook.sheetId, range, values);

    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating attendance", error: err.message });
  }
};
