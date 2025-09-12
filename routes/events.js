// routes/events.js
const express = require("express");
const Event = require("../models/Event");
const { authRequired } = require("../middleware/authMiddleware"); // ✅ make sure this matches your middleware export
const router = express.Router();

/**
 * =====================
 * Create Event
 * =====================
 */
router.post("/", authRequired, async (req, res) => {
  try {
    const { title, date, details, department } = req.body;

    // Validate input
    if (!title || !date || !details || !department) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Create new event
    const ev = new Event({ title, date, details, department });
    await ev.save();

    res.json(ev);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * =====================
 * Get Events by Department
 * =====================
 */
router.get("/department/:dept", authRequired, async (req, res) => {
  try {
    const events = await Event.find({ department: req.params.dept });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
