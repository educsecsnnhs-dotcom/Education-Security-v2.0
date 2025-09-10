// routes/principal.js
const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getEnrollmentStats,
  setLimit,
  getDepartmentsOverview,
  getGlobalGrades,
  assignHighRole,
} = require("../controllers/principalController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Principal (SuperAdmin)
router.get("/dashboard", authRequired, requireRole("SuperAdmin"), getDashboard);
router.get("/enrollment-stats", authRequired, requireRole("SuperAdmin"), getEnrollmentStats);
router.post("/set-limit", authRequired, requireRole("SuperAdmin"), setLimit);
router.get("/departments", authRequired, requireRole("SuperAdmin"), getDepartmentsOverview);
router.get("/global-grades", authRequired, requireRole("SuperAdmin"), getGlobalGrades);
router.post("/assign-role", authRequired, requireRole("SuperAdmin"), assignHighRole);

module.exports = router;
