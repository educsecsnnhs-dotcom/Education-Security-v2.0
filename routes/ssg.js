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

// ensure upload dir
const UPLOAD_DIR = "uploads/ssg";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"))
});
const upload = multer({ storage });

// -------------------- Candidate Management --------------------

// create candidate (SSG officers or Registrar)
router.post(
  "/candidates",
  authRequired,
  requireAnyRole(["SSG", "Registrar"]),
  upload.single("photo"),
  async (req, res) => {
    try {
      const { name, position, scope = "school", target = null, grade = null, section = null } = req.body;
      const photoUrl = req.file ? `/${UPLOAD_DIR}/${req.file.filename}` : null;

      const c = new Candidate({
        name,
        position,
        scope,
        target,
        grade,
        section,
        photoUrl,
        createdBy: req.user._id,
      });
      await c.save();
      res.json({ message: "Candidate created", candidate: c });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create candidate", error: err.message });
    }
  }
);

// list candidates (filter by scope/target optionally)
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

// update candidate
router.put(
  "/candidates/:id",
  authRequired,
  requireAnyRole(["SSG", "Registrar"]),
  upload.single("photo"),
  async (req, res) => {
    try {
      const id = req.params.id;
      const update = { ...req.body };
      if (req.file) update.photoUrl = `/${UPLOAD_DIR}/${req.file.filename}`;
      const c = await Candidate.findByIdAndUpdate(id, update, { new: true });
      res.json({ message: "Updated", candidate: c });
    } catch (err) {
      res.status(500).json({ message: "Failed to update", error: err.message });
    }
  }
);

// delete candidate
router.delete("/candidates/:id", authRequired, requireAnyRole(["SSG", "Registrar"]), async (req, res) => {
  try {
    const id = req.params.id;
    await Candidate.findByIdAndDelete(id);
    // optionally remove votes for candidate
    await Vote.deleteMany({ candidateId: id });
    res.json({ message: "Candidate removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
});

// -------------------- Voting --------------------

// cast vote
router.post("/vote", authRequired, async (req, res) => {
  try {
    const { voterId = req.user._id, votes } = req.body;
    // votes is expected to be array of { position, candidateId, scope, target }
    if (!Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ message: "votes array required" });
    }

    // For each vote ensure the voter hasn't voted already for that position+scope+target
    for (const v of votes) {
      const { position, candidateId, scope = "school", target = null } = v;
      // check candidate exists and its position matches (safety)
      const cand = await Candidate.findById(candidateId);
      if (!cand) return res.status(404).json({ message: `Candidate ${candidateId} not found` });
      if (cand.position !== position) {
        // allow but warn? we'll enforce equality
        return res.status(400).json({ message: "Candidate position mismatch" });
      }

      // check if already voted for this position in that scope+target
      const already = await Vote.findOne({
        voterId,
        scope,
        target,
        // we assume one vote per position; store position in Vote collection next
        position: position
      });
      if (already) {
        return res.status(409).json({ message: `Already voted for ${position} in ${scope}${target ? ":"+target : ""}` });
      }

      // record vote
      await new Vote({ voterId, candidateId, scope, target, position }).save();
    }

    res.json({ message: "Vote recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Vote failed", error: err.message });
  }
});

// check if user voted (returns list of positions voted)
router.get("/voted/:voterId?", authRequired, async (req, res) => {
  try {
    const voterId = req.params.voterId || req.user._id;
    const votes = await Vote.find({ voterId }).select("position scope target createdAt candidateId");
    res.json({ voted: votes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch votes", error: err.message });
  }
});

// results (aggregated counts) optionally filtered by scope/target/position
router.get("/results", authRequired, requireAnyRole(["SSG", "Registrar"]), async (req, res) => {
  try {
    const { scope, target, position } = req.query;
    const match = {};
    if (scope) match.scope = scope;
    if (target) match.target = target;
    if (position) match.position = position;

    // aggregate counts grouped by candidate
    const agg = await Vote.aggregate([
      { $match: match },
      { $group: { _id: "$candidateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // populate candidate info
    const results = await Promise.all(
      agg.map(async (r) => {
        const cand = await Candidate.findById(r._id);
        return { candidate: cand, votes: r.count };
      })
    );

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute results", error: err.message });
  }
});

// export CSV for results
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

// -------------------- SSG Events / Officers (simple) --------------------

// create event (SSG only)
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

// list events
router.get("/events", authRequired, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
});

module.exports = router;
