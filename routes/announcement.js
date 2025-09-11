const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Announcement = require("../models/Announcement");

// 🔹 Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/announcements");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🔹 GET all announcements (visible to everyone)
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// 🔹 POST new announcement (only staff/SSG/Admin allowed)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const user = req.user; // populated by auth middleware
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // restrict posting to authorized roles
    const allowedRoles = ["Admin", "Moderator", "SSG", "Registrar"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Not allowed to post announcements" });
    }

    const announcement = new Announcement({
      title: req.body.title,
      content: req.body.content,
      scope: req.body.scope,
      target: req.body.scope !== "school" ? req.body.target : null,
      imageUrl: req.file ? `/uploads/announcements/${req.file.filename}` : null,
      createdBy: {
        _id: user._id,
        name: user.name,
        role: user.role
      }
    });

    await announcement.save();
    res.json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post announcement" });
  }
});

module.exports = router;
