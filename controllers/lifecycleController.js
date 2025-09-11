// controllers/lifecycleController.js
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

/**
 * Handle new student enrollment with file uploads
 */
exports.enrollStudent = async (req, res) => {
  try {
    const { name, lrn, level, strand, schoolYear, userId } = req.body;

    // Collect uploaded files (with safe defaults)
    const documents = {
      reportCard: req.files?.reportCard ? "/uploads/enrollments/" + req.files.reportCard[0].filename : null,
      goodMoral: req.files?.goodMoral ? "/uploads/enrollments/" + req.files.goodMoral[0].filename : null,
      birthCertificate: req.files?.birthCert ? "/uploads/enrollments/" + req.files.birthCert[0].filename : null,
      others: req.files?.otherDocs
        ? req.files.otherDocs.map(f => "/uploads/enrollments/" + f.filename)
        : [],
    };

    // Create enrollment record
    const enrollment = new Enrollment({
      studentId: userId,
      name,
      lrn,
      level,
      strand,
      schoolYear,
      yearLevel: level === "junior" ? 7 : 11, // default starting year
      documents,
      status: "pending",
    });

    await enrollment.save();

    res.json({ message: "Enrollment submitted successfully", enrollment });
  } catch (err) {
    console.error("❌ Error submitting enrollment:", err);
    res.status(500).json({ message: "Error submitting enrollment", error: err.message });
  }
};
