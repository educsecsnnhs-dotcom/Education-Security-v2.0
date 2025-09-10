// controllers/announcementController.js
const Announcement = require("../models/Announcement");

exports.createAnnouncement = async (req, res) => {
  try {
    const { scope, title, content } = req.body;
    let department = null;

    if (scope === "department") {
      // only Admins & SuperAdmin can post department-level
      if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
        return res.status(403).json({ message: "Only Admins can post in department boards" });
      }
      department = req.user.department; // comes from user profile
    }

    if (scope === "schoolwide" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Only SuperAdmin can post schoolwide announcements" });
    }

    const ann = new Announcement({
      scope,
      department,
      title,
      content,
      createdBy: req.user._id,
    });

    await ann.save();
    res.status(201).json({ message: "Announcement created", ann });
  } catch (err) {
    res.status(500).json({ message: "Error creating announcement", error: err.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Student") {
      // students only see schoolwide
      filter.scope = "schoolwide";
    } else if (req.user.role === "Moderator" || req.user.role === "Admin") {
      // teachers see their department + schoolwide
      filter = {
        $or: [
          { scope: "schoolwide" },
          { scope: "department", department: req.user.department },
        ],
      };
    }
    // SuperAdmin sees everything (no filter)

    const anns = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json(anns);
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcements", error: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "SuperAdmin" && !ann.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await ann.remove();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting announcement", error: err.message });
  }
};
