// routes/recordbook.js
const express = require("express");
const router = express.Router();
const recordbookController = require("../controllers/recordbookController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Create record book
router.post("/create", authRequired, requireRole("Moderator"), recordbookController.createRecordBook);

// Find record book by section + subject
router.get("/find", authRequired, requireRole("Moderator"), recordbookController.findRecordBook);

// Get record book details by ID
router.get("/:id", authRequired, requireRole("Moderator"), recordbookController.getRecordBookById);

// Input grades
router.post("/input", authRequired, requireRole("Moderator"), recordbookController.inputGrades);

// Get grades
router.get("/grades", authRequired, requireRole("Moderator"), recordbookController.getStudentGrades);

// Finalize grades
router.post("/finalize", authRequired, requireRole("Moderator"), recordbookController.finalizeGrades);

// Attendance
router.post("/attendance", authRequired, requireRole("Moderator"), recordbookController.markAttendance);

// List sheet tabs
router.get("/sheets/:sheetId", authRequired, requireRole("Moderator"), recordbookController.getSheetTabs);

module.exports = router;
