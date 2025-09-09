const express = require("express");
const router = express.Router();
const { createRecord, addGrade, markAttendance, tallyGrades } = require("../controllers/recordbookController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Teachers (Moderators) manage record books
router.post("/create", authRequired, requireRole("Moderator"), createRecord);
router.post("/add-grade", authRequired, requireRole("Moderator"), addGrade);
router.post("/attendance", authRequired, requireRole("Moderator"), markAttendance);
router.get("/tally/:studentId", authRequired, requireRole("Moderator"), tallyGrades);

module.exports = router;
