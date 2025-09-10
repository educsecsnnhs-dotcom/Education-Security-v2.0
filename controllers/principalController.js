// controllers/principalController.js
const Enrollee = require("../models/Enrollee"); // ✅ fixed name
const User = require("../models/User");
const Class = require("../models/Class");
const RecordBook = require("../models/RecordBook");

/**
 * Get school-wide dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalTeachers = await User.countDocuments({ role: "Moderator" });
    const totalAdmins = await User.countDocuments({ role: "Admin" });
    const totalRegistrars = await User.countDocuments({ role: "Registrar" });

    res.json({
      totals: {
        students: totalStudents,
        teachers: totalTeachers,
        admins: totalAdmins,
        registrars: totalRegistrars,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard", error: err.message });
  }
};

/**
 * View enrollment numbers (per strand/section)
 */
exports.getEnrollmentStats = async (req, res) => {
  try {
    const enrollments = await Enrollee.aggregate([
      {
        $group: {
          _id: { strand: "$strand", section: "$section" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ stats: enrollments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching enrollment stats", error: err.message });
  }
};

/**
 * Set limits (per section or strand)
 */
exports.setLimit = async (req, res) => {
  try {
    const { type, key, limit } = req.body;
    res.json({ message: `Limit set for ${type}: ${key} = ${limit}` });
  } catch (err) {
    res.status(500).json({ message: "Error setting limit", error: err.message });
  }
};

/**
 * View all departments (with moderators and classes)
 */
exports.getDepartmentsOverview = async (req, res) => {
  try {
    const admins = await User.find({ role: "Admin" }).select("fullName department");
    const classes = await Class.find()
      .populate("moderatorId", "fullName")
      .select("name department moderatorId");

    res.json({ admins, classes });
  } catch (err) {
    res.status(500).json({ message: "Error fetching departments", error: err.message });
  }
};

/**
 * Global grade summary
 */
exports.getGlobalGrades = async (req, res) => {
  try {
    const classes = await Class.find();
    const summary = [];

    for (const cls of classes) {
      const recordBook = await RecordBook.findOne({ classId: cls._id });
      if (recordBook) {
        summary.push({
          class: cls.name,
          department: cls.department,
          status: recordBook.partial ? "Partial" : "Official",
        });
      }
    }

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Error fetching global grades", error: err.message });
  }
};

/**
 * Assign Registrar or Admin
 */
exports.assignHighRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!["Registrar", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role assignment" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: `${role} assigned to ${user.fullName}`, user });
  } catch (err) {
    res.status(500).json({ message: "Error assigning high role", error: err.message });
  }
};
