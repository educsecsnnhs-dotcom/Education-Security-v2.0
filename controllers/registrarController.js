// controllers/registrarController.js
const Enrollee = require("../models/Enrollee");
const Section = require("../models/Section");
const User = require("../models/User");

/**
 * Submit Enrollment Form (Student fills it out)
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
 * Smart assign to section
 */
async function assignToSection(enrollee, user) {
  let sections = await Section.find({
    gradeLevel: enrollee.gradeLevel,
    strand: enrollee.strand,
  });

  // If no section exists, create one
  if (!sections.length) {
    const newSection = await Section.create({
      name: `${enrollee.gradeLevel}-${enrollee.strand}-A`,
      gradeLevel: enrollee.gradeLevel,
      strand: enrollee.strand,
      students: [],
      capacity: 40,
    });
    sections = [newSection];
  }

  // Sort sections by student count (balance first)
  sections.sort((a, b) => a.students.length - b.students.length);

  // TODO: Improve smart distribution:
  // Example: If enrollee.averageGrade exists,
  // you could balance by performance level too.

  const target = sections[0];

  // Check capacity
  if (target.capacity && target.students.length >= target.capacity) {
    // Auto-create a new section if overflow
    const suffix = String.fromCharCode(65 + sections.length); // A, B, C...
    const newSection = await Section.create({
      name: `${enrollee.gradeLevel}-${enrollee.strand}-${suffix}`,
      gradeLevel: enrollee.gradeLevel,
      strand: enrollee.strand,
      students: [],
      capacity: 40,
    });
    target = newSection;
  }

  // Assign user to section
  target.students.push(user._id);
  await target.save();

  user.section = target._id;
  await user.save();

  return target;
}

/**
 * Approve enrollee -> promote to Student -> assign section
 */
exports.approveEnrollee = async (req, res) => {
  try {
    const { enrolleeId } = req.body;
    const enrollee = await Enrollee.findById(enrolleeId);
    if (!enrollee) return res.status(404).json({ message: "Enrollee not found" });

    // Find user account by LRN
    const studentUser = await User.findOne({ lrn: enrollee.lrn });
    if (!studentUser) {
      return res.status(400).json({ message: "User account for enrollee not found" });
    }

    // Promote role
    studentUser.role = "Student";
    await studentUser.save();

    // Assign to section (smart distribution)
    const section = await assignToSection(enrollee, studentUser);

    // Mark enrollee approved
    enrollee.status = "Approved";
    enrollee.assignedSection = section._id;
    await enrollee.save();

    res.json({
      message: `Enrollee ${enrollee.fullName} approved and assigned to ${section.name}`,
      enrollee,
      section,
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
    enrollee.rejectionReason = reason;
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

    const section = new Section({ name, gradeLevel, strand, capacity, students: [] });
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
