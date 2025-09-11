const Class = require("../models/Class");
const Section = require("../models/Section");

/**
 * Get all classes assigned to a teacher
 */
exports.getTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const classes = await Class.find({ teacher: teacherId })
      .populate("section", "name gradeLevel strand")
      .populate("subject", "name code");

    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching classes", error: err.message });
  }
};

/**
 * Get details of a single class
 */
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("section", "name gradeLevel strand students")
      .populate("subject", "name code")
      .populate("teacher", "email");

    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: "Error fetching class", error: err.message });
  }
};
