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

// ✅ Student submits enrollment
router.post("/enrollment", authRequired, requireRole("Registrar"), submitEnrollment);

// ✅ Pending enrollees list
router.get("/pending", authRequired, requireRole("Registrar"), getPendingEnrollees);

// ✅ Approve enrollee (/:id)
router.post("/approve/:id", authRequired, requireRole("Registrar"), approveEnrollee);

// ✅ Reject enrollee (/:id)
router.post("/reject/:id", authRequired, requireRole("Registrar"), rejectEnrollee);

// ✅ Create section
router.post("/sections", authRequired, requireRole("Registrar"), createSection);

// ✅ Enrollment stats
router.get("/stats", authRequired, requireRole("Registrar"), getEnrollmentStats);

module.exports = router;
