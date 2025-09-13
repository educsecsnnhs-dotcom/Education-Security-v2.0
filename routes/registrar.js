// routes/registrar.js
const express = require("express");
const router = express.Router();
const {
  submitEnrollment,
  getPendingEnrollees,
  approveEnrollee,
  rejectEnrollee,
  createSection,
  getEnrollmentStats,
  getSections,
} = require("../controllers/registrarController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Registrar only
router.post("/enrollment", authRequired, requireRole("Registrar"), submitEnrollment);

// Pending enrollees
router.get("/enrollment/pending", authRequired, requireRole("Registrar"), getPendingEnrollees);

// Approve enrollee
router.post("/enrollment/:id/approve", authRequired, requireRole("Registrar"), approveEnrollee);

// Reject enrollee
router.post("/enrollment/:id/reject", authRequired, requireRole("Registrar"), rejectEnrollee);

// Create section
router.post("/sections", authRequired, requireRole("Registrar"), createSection);

// Get all sections
router.get("/sections", authRequired, requireRole("Registrar"), getSections);

// Stats
router.get("/stats", authRequired, requireRole("Registrar"), getEnrollmentStats);

module.exports = router;
