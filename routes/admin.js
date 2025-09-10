// routes/admin.js
const express = require("express");
const router = express.Router();
const {
  getModerators,
  getDepartmentClasses,
  getClassRecordBook,
  exportDepartmentSummary,
} = require("../controllers/adminController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Department Heads (Admin)
router.get("/moderators", authRequired, requireRole("Admin"), getModerators);
router.get("/classes", authRequired, requireRole("Admin"), getDepartmentClasses);
router.get("/recordbook", authRequired, requireRole("Admin"), getClassRecordBook);
router.get("/summary", authRequired, requireRole("Admin"), exportDepartmentSummary);

module.exports = router;
