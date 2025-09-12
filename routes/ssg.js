// routes/ssg.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Candidate = require("../models/SSGCandidate");
const Vote = require("../models/Vote");
const Event = require("../models/SSGEvent");
const { authRequired, requireAnyRole, requireRole } = require("../middleware/authMiddleware");

const UPLOAD_DIR = "uploads/ssg";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"))
});
const upload = multer({ storage });

// ---------------- Candidate Management ----------------

// Create candidate (SSG or Registrar)
router.post("/candidates", authRequired, requireAnyRole(["SSG", "Registrar"]), upload.single("photo"), async (req, res) => {
  try {
    const { name, position, scope = "school", target = null, grade = null, section = null } = req.body;
    const photoUrl = req.file ? `/${UPLOAD_DIR}/${req.file.filename}` : null;

    const candidate = new Candidate({
      name, position, scope, target, grade, section, photoUrl, createdBy: req.user._id
    });
    await candidate.save();
    res.json({ message: "Candidate created", candidate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create candidate", error: err.message });
  }
});

// List candidates (optional filters: scope, target, position)
router.get("/candidates", authRequired, async (req, res) => {
  try {
    const { scope, target, position } = req.query;
    const q = {};
    if (scope) q.scope = scope;
    if (target) q.target = target;
    if (position) q.position = position;
    const list = await Candidate.find(q).sort({ createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates", error: err.message });
  }
});

// Update candidate
router.put("/candidates/:id", authRequired, requireAnyRole(["SSG", "Registrar"]), upload.single("photo"), async (req, res) => {
  try {
    const id = req.params.id;
    const update = { ...req.body };
    if (req.file) update.photoUrl = `/${UPLOAD_DIR}/${req.file.filename}`;
    const c = await Candidate.findByIdAndUpdate(id, update, { new: true });
    res.json({ message: "Candidate updated", candidate: c });
  } catch (err) {
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
});

// Delete candidate and associated votes
router.delete("/candidates/:id", authRequired, requireAnyRole(["SSG", "Registrar"]), async (req, res) => {
  try {
    const id = req.params.id;
    await Candidate.findByIdAndDelete(id);
    await Vote.deleteMany({ candidateId: id });
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete candidate", error: err.message });
  }
});

// ---------------- Voting ----------------

// Cast votes. Body expects: { votes: [{ position, candidateId, scope, target }] }
router.post("/vote", authRequired, async (req, res) => {
  try {
    const voterId = req.user._id;
    const { votes } = req.body;
    if (!Array.isArray(votes) || votes.length === 0) return res.status(400).json({ message: "votes array required" });

    for (const v of votes) {
      const { position, candidateId, scope = "school", target = null } = v;
      const cand = await Candidate.findById(candidateId);
      if (!cand) return res.status(404).json({ message: `Candidate ${candidateId} not found` });
      if (cand.position !== position) return res.status(400).json({ message: "Candidate position mismatch" });

      const already = await Vote.findOne({ voterId, position, scope, target });
      if (already) {
        return res.status(409).json({ message: `Already voted for ${position} in ${scope}${target ? ":"+target : ""}` });
      }

      await new Vote({ voterId, candidateId, position, scope, target }).save();
    }

    res.json({ message: "Vote(s) recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Vote failed", error: err.message });
  }
});

// Check if user voted
router.get("/voted/:voterId?", authRequired, async (req, res) => {
  try {
    const voterId = req.params.voterId || req.user._id;
    const votes = await Vote.find({ voterId }).select("position scope target createdAt candidateId");
    res.json({ voted: votes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch votes", error: err.message });
  }
});

// ---------------- Results & Export ----------------

// Aggregated results (SSG and Registrar only)
router.get("/results", authRequired, requireAnyRole(["SSG", "Registrar"]), async (req, res) => {
  try {
    const { scope, target, position } = req.query;
    const match = {};
    if (scope) match.scope = scope;
    if (target) match.target = target;
    if (position) match.position = position;

    const agg = await Vote.aggregate([
      { $match: match },
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const results = await Promise.all(agg.map(async (r) => {
      const cand = await Candidate.findById(r._id);
      return { candidate: cand, votes: r.count };
    }));

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute results", error: err.message });
  }
});

// Export CSV (SSG & Registrar)
router.get("/results/export", authRequired, requireAnyRole(["SSG", "Registrar"]), async (req, res) => {
  try {
    const { scope, target, position } = req.query;
    const match = {};
    if (scope) match.scope = scope;
    if (target) match.target = target;
    if (position) match.position = position;

    const agg = await Vote.aggregate([
      { $match: match },
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const rows = [["candidateId","name","position","votes"]];
    for (const r of agg) {
      const cand = await Candidate.findById(r._id);
      rows.push([String(cand._id), cand.name, cand.position, String(r.count)]);
    }

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    res.setHeader("Content-Disposition", `attachment; filename="election-results-${Date.now()}.csv"`);
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export", error: err.message });
  }
});

// ---------------- Events ----------------

// Create event (SSG only)
router.post("/events", authRequired, requireRole("SSG"), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const e = new Event({ title, description, date, createdBy: req.user._id });
    await e.save();
    res.json({ message: "Event created", event: e });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
});

// List events
router.get("/events", authRequired, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
});

module.exports = router;
