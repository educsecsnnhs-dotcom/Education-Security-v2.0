//controllers/registrarController.js

const Enrollee = require("../models/Enrollee");
const Section = require("../models/Section");
const User = require("../models/User");

/**
 * Submit Enrollment
 */
exports.submitEnrollment = async (req, res) => {
  try {
    const { fullName, lrn, gradeLevel, strand, schoolYear, averageGrade } = req.body;

    const existing = await Enrollee.findOne({ lrn, schoolYear });
    if (existing) {
      return res.status(400).json({ message: "Student already applied for this school year" });
    }

    const enrollee = new Enrollee({
      fullName,
      lrn,
      gradeLevel,
      strand,
      schoolYear,
      averageGrade: averageGrade || null,
      createdBy: req.user._id,
    });

    await enrollee.save();
    res.status(201).json({ message: "Enrollment submitted", enrollee });
  } catch (err) {
    res.status(500).json({ message: "Error submitting enrollment", error: err.message });
  }
};

/**
 * Get pending enrollees
 */
exports.getPendingEnrollees = async (req, res) => {
  try {
    const enrollees = await Enrollee.find({ status: "Pending" });
    res.json(enrollees);
  } catch (err) {
    res.status(500).json({ message: "Error fetching enrollees", error: err.message });
  }
};

/**
 * Approve enrollee
 */
exports.approveEnrollee = async (req, res) => {
  try {
    const enrolleeId = req.params.id;
    const enrollee = await Enrollee.findById(enrolleeId);
    if (!enrollee) return res.status(404).json({ message: "Enrollee not found" });

    // Find student user
    const studentUser = await User.findOne({ lrn: enrollee.lrn });
    if (!studentUser) return res.status(400).json({ message: "User account not found" });

    // Promote role
    studentUser.role = "Student";
    await studentUser.save();

    // Assign section
    let section = await Section.findOne({ name: req.body.section });
    if (!section) {
      section = await Section.create({
        name: req.body.section,
        gradeLevel: enrollee.gradeLevel,
        strand: enrollee.strand,
        students: [],
        capacity: 40,
      });
    }
    section.students.push(studentUser._id);
    await section.save();

    studentUser.section = section._id;
    await studentUser.save();

    // Mark enrollee approved
    enrollee.status = "Approved";
    enrollee.assignedSection = section._id;
    await enrollee.save();

    res.json({ message: "Enrollee approved", enrollee, section });
  } catch (err) {
    res.status(500).json({ message: "Error approving enrollee", error: err.message });
  }
};

/**
 * Reject enrollee
 */
exports.rejectEnrollee = async (req, res) => {
  try {
    const enrolleeId = req.params.id;
    const enrollee = await Enrollee.findById(enrolleeId);
    if (!enrollee) return res.status(404).json({ message: "Enrollee not found" });

    enrollee.status = "Rejected";
    enrollee.rejectionReason = req.body.reason || "No reason provided";
    await enrollee.save();

    res.json({ message: "Enrollee rejected", enrollee });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting enrollee", error: err.message });
  }
};

/**
 * Create section
 */
exports.createSection = async (req, res) => {
  try {
    const { name, gradeLevel, strand, capacity } = req.body;

    const exists = await Section.findOne({ name });
    if (exists) return res.status(400).json({ message: "Section already exists" });

    const section = new Section({ name, gradeLevel, strand, capacity, students: [] });
    await section.save();

    res.status(201).json({ message: "Section created", section });
  } catch (err) {
    res.status(500).json({ message: "Error creating section", error: err.message });
  }
};

/**
 * Get sections
 */
exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sections", error: err.message });
  }
};

/**
 * Get enrollment stats
 */
exports.getEnrollmentStats = async (req, res) => {
  try {
    const enrolled = await Enrollee.countDocuments({ status: "Approved" });
    const pending = await Enrollee.countDocuments({ status: "Pending" });
    res.json({ enrolled, pending });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};
