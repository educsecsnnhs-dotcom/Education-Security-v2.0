// controllers/recordbookController.js
const RecordBook = require("../models/RecordBook");
const Section = require("../models/Section");
const User = require("../models/User");
const {
  getSheetValues,
  updateSheetValues,
  createSheet,
  listSheets,
} = require("../utils/sheetsClient");

/**
 * Create record book for a section + subject
 * Auto-creates a Google Sheet and links it
 */
exports.createRecordBook = async (req, res) => {
  try {
    const { sectionId, subject, teacherId } = req.body;

    const section = await Section.findById(sectionId).populate("students");
    if (!section) return res.status(404).json({ message: "Section not found" });

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "Moderator") {
      return res.status(400).json({ message: "Invalid teacher" });
    }

    // Create a new Google Sheet
    const sheetId = await createSheet(`${section.name} - ${subject} Record Book`);

    // Auto-populate with student list
    const header = [["LRN", "Full Name", "Attendance", "Quiz 1", "Quiz 2", "Exam", "Final Grade"]];
    const studentRows = section.students.map(s => [s.lrn || "", s.fullName || ""]);
    await updateSheetValues(sheetId, "Sheet1!A1:G" + (studentRows.length + 1), [
      ...header,
      ...studentRows,
    ]);

    const recordBook = new RecordBook({
      sectionId,
      subject,
      teacher: teacherId,
      sheetId,
      partial: true,
    });

    await recordBook.save();

    res.status(201).json({ message: "Record book created", recordBook });
  } catch (err) {
    res.status(500).json({ message: "Error creating record book", error: err.message });
  }
};

/**
 * Find record book by section + subject
 */
exports.findRecordBook = async (req, res) => {
  try {
    const { sectionId, subject } = req.query;

    const recordBook = await RecordBook.findOne({ sectionId, subject })
      .populate("sectionId")
      .populate("teacher");

    if (!recordBook) return res.json(null); // frontend expects null if none
    res.json(recordBook);
  } catch (err) {
    res.status(500).json({ message: "Error finding record book", error: err.message });
  }
};

/**
 * Input grades (teacher updates sheet)
 */
exports.inputGrades = async (req, res) => {
  try {
    const { recordBookId, range, values } = req.body;

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
 * List all sheets (tabs) inside a record book
 */
exports.getSheetTabs = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheets = await listSheets(sheetId);
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sheet tabs", error: err.message });
  }
};

/**
 * Finalize grades (lock editing)
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
    const { recordBookId, range, values } = req.body;

    const recordBook = await RecordBook.findById(recordBookId);
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });

    await updateSheetValues(recordBook.sheetId, range, values);

    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating attendance", error: err.message });
  }
};

/**
 * Get record book details by ID
 */
exports.getRecordBookById = async (req, res) => {
  try {
    const recordBook = await RecordBook.findById(req.params.id)
      .populate("sectionId")
      .populate("teacher");
    if (!recordBook) return res.status(404).json({ message: "Record book not found" });
    res.json(recordBook);
  } catch (err) {
    res.status(500).json({ message: "Error fetching record book", error: err.message });
  }
};
