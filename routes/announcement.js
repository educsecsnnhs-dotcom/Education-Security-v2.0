const express = require("express");
const multer = require("multer");
const path = require("path");
const Announcement = require("../models/Announcement");
const { authRequired, requireAnyRole } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/announcements"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🔹 Create Announcement (Admin, SSG, Teachers)
router.post("/", authRequired, requireAnyRole(["Admin", "SSG", "Moderator"]), upload.array("images"), async (req, res) => {
  try {
    const { visibility, target, content } = req.body;

    const files = req.files ? req.files.map(f => `/uploads/announcements/${f.filename}`) : [];

    const announcement = new Announcement({
      author: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
        strand: req.user.strand
      },
      visibility,
      target,
      content,
      images: files
    });

    await announcement.save();
    res.json({ message: "Announcement created", announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create announcement" });
  }
});

// 🔹 Get Announcements (filter by user)
router.get("/", authRequired, async (req, res) => {
  try {
    const { role, department, strand } = req.user;

    const query = {
      $or: [
        { visibility: "school" },
        { visibility: "department", target: department },
        { visibility: "strand", target: strand }
      ]
    };

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

module.exports = router;
