const express = require("express");
const router = express.Router();
const Enrollment = require("../models/Enrollment");

// POST: Create enrollment
router.post("/", async (req, res) => {
  try {
    const enrollment = new Enrollment(req.body);
    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
