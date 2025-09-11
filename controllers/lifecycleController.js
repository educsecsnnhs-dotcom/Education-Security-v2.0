//controllers/lifecycleController.js

const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

/**
 * Handle new student enrollment with file uploads
 */
exports.enrollStudent = async (req, res) => {
  try {
    const {
      name,
      lrn,
      level,
      strand,
      schoolYear,
      userId
    } = req.body;

    // Collect uploaded files
    const documents = {
      reportCard: req.files?.reportCard ? req.files.reportCard[0].filename : null,
      goodMoral: req.files?.goodMoral ? req.files.goodMoral[0].filename : null,
      birthCert: req.files?.birthCert ? req.files.birthCert[0].filename : null,
      otherDocs: req.files?.otherDocs ? req.files.otherDocs.map(f => f.filename) : [],
    };

    // Create enrollment record
    const enrollment = new Enrollment({
      studentId: userId,
      name,
      lrn,
      level,
      strand,
      schoolYear,
      documents,
      yearLevel: level === "junior" ? 7 : 11, // default starting year
    });

    await enrollment.save();

    res.json({ message: "Enrollment submitted successfully", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting enrollment", error: err.message });
  }
};
