// routes/events.js
const express = require("express");
const Event = require("../models/Event");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// POST - create event
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, date, details, department } = req.body;
    if (!title || !date || !details || !department) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const ev = new Event({ title, date, details, department });
    await ev.save();
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - department events
router.get("/department/:dept", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ department: req.params.dept });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
