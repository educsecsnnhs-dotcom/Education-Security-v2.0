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
} = require("../controllers/registrarController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Registrar only
router.post("/enrollment", authRequired, requireRole("Registrar"), submitEnrollment);

// 🔹 Match frontend call: GET /api/enrollment/pending
router.get("/enrollment/pending", authRequired, requireRole("Registrar"), getPendingEnrollees);

// 🔹 Match frontend call: POST /api/enrollment/:id/approve
router.post("/enrollment/:id/approve", authRequired, requireRole("Registrar"), approveEnrollee);

// 🔹 Match frontend call: POST /api/enrollment/:id/reject
router.post("/enrollment/:id/reject", authRequired, requireRole("Registrar"), rejectEnrollee);

// Create a new section
router.post("/sections", authRequired, requireRole("Registrar"), createSection);

// Enrollment stats
router.get("/registrar/stats", authRequired, requireRole("Registrar"), getEnrollmentStats);

module.exports = router;
