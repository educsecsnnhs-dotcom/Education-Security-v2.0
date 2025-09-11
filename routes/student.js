// routes/student.js
const express = require("express");
const router = express.Router();
const { authRequired, requireRole } = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");

// Student only
router.get("/grades", authRequired, requireRole("Student"), studentController.getMyGrades);

module.exports = router;
