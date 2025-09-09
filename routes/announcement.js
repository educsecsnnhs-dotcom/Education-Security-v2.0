const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require("../controllers/announcementController");
const { authRequired } = require("../middleware/authMiddleware");

// Announcements
router.post("/create", authRequired, createAnnouncement);
router.get("/", authRequired, getAnnouncements);
router.post("/delete", authRequired, deleteAnnouncement);

module.exports = router;
