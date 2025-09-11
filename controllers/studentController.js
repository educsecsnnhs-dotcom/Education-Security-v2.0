// controllers/studentController.js
const RecordBook = require("../models/RecordBook");
const Enrollment = require("../models/Enrollment"); // assuming you track student enrollment
const { getSheetValues } = require("../utils/sheetsClient");

/**
 * Get all grades for a student
 */
exports.getMyGrades = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find subjects/sections the student is enrolled in
    const enrollments = await Enrollment.find({ student: studentId }).populate("sectionId");

    let results = [];
    for (const enr of enrollments) {
      const recordBooks = await RecordBook.find({
        sectionId: enr.sectionId._id,
        partial: false, // only finalized
      });

      for (const rb of recordBooks) {
        const values = await getSheetValues(rb.sheetId, "Sheet1!A1:Z50");
        // Find this student’s row by LRN or name
        const studentRow = values.find(r => r[0] === enr.student.lrn || r[1] === req.user.fullName);

        results.push({
          section: enr.sectionId.name,
          subject: rb.subject,
          grades: studentRow || [],
        });
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error fetching grades", error: err.message });
  }
};
