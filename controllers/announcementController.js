// controllers/announcementController.js
const Announcement = require("../models/Announcement");

exports.createAnnouncement = async (req, res) => {
  try {
    const { scope, title, content, department } = req.body;
    let dept = null;

    if (scope === "department") {
      if (!["Admin", "SuperAdmin", "Moderator"].includes(req.user.role)) {
        return res.status(403).json({ message: "Only teachers and admins can post department announcements" });
      }
      // if SuperAdmin gives a department explicitly, use it; else fallback to user's own dept
      dept = department || req.user.department;
    }

    if (scope === "schoolwide" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ message: "Only SuperAdmin can post schoolwide announcements" });
    }

    const ann = new Announcement({
      scope,
      department: dept,
      title,
      content,
      createdBy: req.user._id,
    });

    await ann.save();
    res.status(201).json(ann);
  } catch (err) {
    res.status(500).json({ message: "Error creating announcement", error: err.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    let filter = {};

    if (req.params.deptId) {
      // GET /api/announcements/department/:deptId
      filter = { scope: "department", department: req.params.deptId };
    } else {
      if (req.user.role === "Student") {
        filter.scope = "schoolwide";
      } else if (["Moderator", "Admin"].includes(req.user.role)) {
        filter = {
          $or: [
            { scope: "schoolwide" },
            { scope: "department", department: req.user.department },
          ],
        };
      }
      // SuperAdmin sees everything
    }

    const anns = await Announcement.find(filter)
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

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

    await ann.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting announcement", error: err.message });
  }
};
