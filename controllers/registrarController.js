// controllers/registrarController.js
const Enrollee = require("../models/Enrollee");
const Section = require("../models/Section");
const User = require("../models/User");

/**
 * Submit Enrollment Form (Student fills it out)
 */
exports.submitEnrollment = async (req, res) => {
  try {
    const { fullName, lrn, gradeLevel, strand, schoolYear } = req.body;

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
      createdBy: req.user._id, // Registrar if filled by office
    });

    await enrollee.save();
    res.status(201).json({ message: "Enrollment submitted", enrollee });
  } catch (err) {
    res.status(500).json({ message: "Error submitting enrollment", error: err.message });
  }
};

/**
 * Get all pending enrollees
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
 * Approve enrollee -> assign section automatically
 */
exports.approveEnrollee = async (req, res) => {
  try {
    const { enrolleeId } = req.body;
    const enrollee = await Enrollee.findById(enrolleeId);
    if (!enrollee) return res.status(404).json({ message: "Enrollee not found" });

    // Find or create section
    let section = await Section.findOne({
      gradeLevel: enrollee.gradeLevel,
      strand: enrollee.strand,
    });

    if (!section) {
      // create a new section if none exists
      section = new Section({
        name: `${enrollee.gradeLevel}-${enrollee.strand}-A`,
        gradeLevel: enrollee.gradeLevel,
        strand: enrollee.strand,
        capacity: 40,
      });
      await section.save();
    }

    // Check capacity
    if (section.students.length >= section.capacity) {
      return res.status(400).json({
        message: `Section ${section.name} is full. Create a new section.`,
      });
    }

    // Link user account (if exists)
    const studentUser = await User.findOne({ lrn: enrollee.lrn });
    if (studentUser) {
      studentUser.role = "Student";
      await studentUser.save();
      section.students.push(studentUser._id);
    }

    enrollee.status = "Approved";
    enrollee.assignedSection = section._id;

    await enrollee.save();
    await section.save();

    res.json({
      message: `Enrollee ${enrollee.fullName} approved and assigned to ${section.name}`,
      enrollee,
    });
  } catch (err) {
    res.status(500).json({ message: "Error approving enrollee", error: err.message });
  }
};

/**
 * Reject enrollee
 */
exports.rejectEnrollee = async (req, res) => {
  try {
    const { enrolleeId, reason } = req.body;
    const enrollee = await Enrollee.findById(enrolleeId);
    if (!enrollee) return res.status(404).json({ message: "Enrollee not found" });

    enrollee.status = "Rejected";
    await enrollee.save();

    res.json({ message: `Enrollee ${enrollee.fullName} rejected`, reason });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting enrollee", error: err.message });
  }
};

/**
 * Create new section manually (if overflow)
 */
exports.createSection = async (req, res) => {
  try {
    const { name, gradeLevel, strand, capacity } = req.body;

    const exists = await Section.findOne({ name });
    if (exists) return res.status(400).json({ message: "Section already exists" });

    const section = new Section({ name, gradeLevel, strand, capacity });
    await section.save();

    res.status(201).json({ message: "Section created", section });
  } catch (err) {
    res.status(500).json({ message: "Error creating section", error: err.message });
  }
};

/**
 * Get stats: number of approved students per grade/strand
 */
exports.getEnrollmentStats = async (req, res) => {
  try {
    const stats = await Enrollee.aggregate([
      { $match: { status: "Approved" } },
      {
        $group: {
          _id: { gradeLevel: "$gradeLevel", strand: "$strand" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};
