const express = require("express");
const router = express.Router();
const recordbookController = require("../controllers/recordbookController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Create record book
router.post(
  "/create",
  authRequired,
  requireRole("Moderator"),
  recordbookController.createRecordBook
);

// Get record book details
router.get(
  "/:id",
  authRequired,
  requireRole("Moderator"),
  recordbookController.getRecordBookById
);

// Input grades
router.post(
  "/input",
  authRequired,
  requireRole("Moderator"),
  recordbookController.inputGrades
);

// Get grades
router.get(
  "/grades",
  authRequired,
  requireRole("Moderator"),
  recordbookController.getStudentGrades
);

// Finalize grades
router.post(
  "/finalize",
  authRequired,
  requireRole("Moderator"),
  recordbookController.finalizeGrades
);

// Mark attendance
router.post(
  "/attendance",
  authRequired,
  requireRole("Moderator"),
  recordbookController.markAttendance
);

// List sheet tabs
router.get(
  "/sheets/:sheetId",
  authRequired,
  requireRole("Moderator"),
  recordbookController.getSheetTabs
);

module.exports = router;
