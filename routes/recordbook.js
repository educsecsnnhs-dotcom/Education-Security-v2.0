// routes/recordbook.js
const express = require("express");
const router = express.Router();
const {
  createRecordBook,
  inputGrades,
  getStudentGrades,
  finalizeGrades,
  markAttendance,
} = require("../controllers/recordbookController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Teachers (Moderators) manage record books
router.post("/create", authRequired, requireRole("Moderator"), createRecordBook);
router.post("/add-grade", authRequired, requireRole("Moderator"), inputGrades);
router.post("/attendance", authRequired, requireRole("Moderator"), markAttendance);
router.get("/grades", authRequired, requireRole("Moderator"), getStudentGrades);
router.post("/finalize", authRequired, requireRole("Moderator"), finalizeGrades);

module.exports = router;
