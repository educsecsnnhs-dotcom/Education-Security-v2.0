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
router.get("/review", authRequired, requireRole("Registrar"), getPendingEnrollees);
router.post("/approve", authRequired, requireRole("Registrar"), approveEnrollee);
router.post("/reject", authRequired, requireRole("Registrar"), rejectEnrollee);
router.post("/create-section", authRequired, requireRole("Registrar"), createSection);
router.get("/stats", authRequired, requireRole("Registrar"), getEnrollmentStats);

module.exports = router;
