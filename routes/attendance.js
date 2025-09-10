// routes/attendance.js
const express = require("express");
const router = express.Router();
const { authRequired, requireAnyRole } = require("../middleware/authMiddleware");
const attendanceController = require("../controllers/attendanceController");

// Moderator opens/closes
router.post("/open", authRequired, requireAnyRole(["Moderator"]), attendanceController.openSession);
router.post("/close", authRequired, requireAnyRole(["Moderator"]), attendanceController.closeSession);

// Student marks present
router.post("/mark", authRequired, requireAnyRole(["Student"]), attendanceController.markPresent);

// Student gets their history
router.get("/me", authRequired, requireAnyRole(["Student"]), attendanceController.getMyAttendance);

module.exports = router;
