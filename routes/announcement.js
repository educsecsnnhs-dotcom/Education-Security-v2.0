const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Announcement = require("../models/Announcement");

// 🔹 Multer config (for images)
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
    console.error("❌ Error fetching announcements:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// 🔹 GET announcements filtered by scope/target (optional)
router.get("/filter", async (req, res) => {
  try {
    const { scope, target } = req.query;
    const filter = {};

    if (scope) filter.scope = scope;
    if (target) filter.target = target;

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    console.error("❌ Error filtering announcements:", err);
    res.status(500).json({ error: "Failed to fetch filtered announcements" });
  }
});

// 🔹 POST new announcement (restricted roles only)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const user = req.user; // populated by auth middleware
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Restrict posting to staff + SSG
    const allowedRoles = ["Admin", "Moderator", "SSG", "Registrar"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Not allowed to post announcements" });
    }

    // Require scope and content
    if (!req.body.title || !req.body.content || !req.body.scope) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build announcement
    const announcement = new Announcement({
      title: req.body.title.trim(),
      content: req.body.content,
      scope: req.body.scope, // school / department / section
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
    console.error("❌ Error posting announcement:", err);
    res.status(500).json({ error: "Failed to post announcement" });
  }
});

// 🔹 DELETE announcement (only author or Admin/Registrar)
router.delete("/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: "Announcement not found" });

    // Author OR high-level role can delete
    if (
      announcement.createdBy._id.toString() !== user._id.toString() &&
      !["Admin", "Registrar", "SuperAdmin"].includes(user.role)
    ) {
      return res.status(403).json({ error: "Not allowed to delete this announcement" });
    }

    await announcement.deleteOne();
    res.json({ message: "✅ Announcement deleted" });
  } catch (err) {
    console.error("❌ Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;
