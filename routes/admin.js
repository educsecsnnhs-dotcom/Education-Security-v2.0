const express = require("express");
const router = express.Router();
const { viewDepartments, monitorTeachers } = require("../controllers/adminController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Department Heads (Admin)
router.get("/departments", authRequired, requireRole("Admin"), viewDepartments);
router.get("/teachers/:departmentId", authRequired, requireRole("Admin"), monitorTeachers);

module.exports = router;
