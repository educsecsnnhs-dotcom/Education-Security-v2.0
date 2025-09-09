// controllers/ssgController.js
const Vote = require("../models/Vote");
const User = require("../models/User");

/**
 * Create election
 * (SuperAdmin or Admin triggers)
 */
exports.createElection = async (req, res) => {
  try {
    const { title, level, section, positions } = req.body;
    // level can be: "school-wide", "grade", "section"
    // positions = [{ position: "President", candidates: [userId1, userId2] }, ...]

    const election = new Vote({
      title,
      level,
      section: section || null,
      positions,
      active: true,
    });

    await election.save();
    res.status(201).json({ message: "Election created", election });
  } catch (err) {
    res.status(500).json({ message: "Error creating election", error: err.message });
  }
};

/**
 * Cast vote
 * Students only
 */
exports.castVote = async (req, res) => {
  try {
    const { electionId, position, candidateId } = req.body;
    const student = req.user;

    if (student.role !== "Student") {
      return res.status(403).json({ message: "Only students can vote" });
    }

    const election = await Vote.findById(electionId);
    if (!election || !election.active) {
      return res.status(400).json({ message: "Election not active" });
    }

    // Check if student already voted for this position
    const already = election.votes.find(
      v => v.voter.toString() === student._id.toString() && v.position === position
    );
    if (already) {
      return res.status(400).json({ message: "You already voted for this position" });
    }

    election.votes.push({
      voter: student._id,
      position,
      candidate: candidateId,
    });

    await election.save();
    res.json({ message: "Vote cast successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error casting vote", error: err.message });
  }
};

/**
 * Get results (SSG management can view)
 */
exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.query;
    const election = await Vote.findById(electionId).populate("positions.candidates", "fullName");

    if (!election) return res.status(404).json({ message: "Election not found" });

    const results = {};

    election.positions.forEach(pos => {
      results[pos.position] = {};

      pos.candidates.forEach(candidate => {
        results[pos.position][candidate.fullName] = election.votes.filter(
          v => v.position === pos.position && v.candidate.toString() === candidate._id.toString()
        ).length;
      });
    });

    res.json({ election: election.title, results });
  } catch (err) {
    res.status(500).json({ message: "Error fetching results", error: err.message });
  }
};

/**
 * Close election
 */
exports.closeElection = async (req, res) => {
  try {
    const { electionId } = req.body;

    const election = await Vote.findById(electionId);
    if (!election) return res.status(404).json({ message: "Election not found" });

    election.active = false;
    await election.save();

    res.json({ message: "Election closed", election });
  } catch (err) {
    res.status(500).json({ message: "Error closing election", error: err.message });
  }
};
