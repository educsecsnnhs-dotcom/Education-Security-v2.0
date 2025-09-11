const express = require("express");
const router = express.Router();
const Enrollment = require("../models/Enrollment");
const { authRequired, requireAnyRole } = require("../middleware/authMiddleware");

// Get all pending enrollees
router.get("/pending", authRequired, requireAnyRole(["Registrar", "SuperAdmin"]), async (req, res) => {
  try {
    const enrollees = await Enrollment.find({ status: "pending" });
    res.json(enrollees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve enrollee
router.post("/:id/approve", authRequired, requireAnyRole(["Registrar", "SuperAdmin"]), async (req, res) => {
  try {
    const enrollee = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json(enrollee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Reject enrollee
router.post("/:id/reject", authRequired, requireAnyRole(["Registrar", "SuperAdmin"]), async (req, res) => {
  try {
    const enrollee = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json(enrollee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
