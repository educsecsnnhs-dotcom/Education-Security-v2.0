// routes/announcement.js
const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { authRequired } = require("../middleware/authMiddleware");

// Create new announcement
router.post("/", authRequired, createAnnouncement);

// Get all announcements (with filters by role)
router.get("/", authRequired, getAnnouncements);

// Get announcements for a specific department
router.get("/department/:deptId", authRequired, getAnnouncements);

// Delete announcement
router.delete("/:id", authRequired, deleteAnnouncement);

module.exports = router;
