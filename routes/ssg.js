const express = require("express");
const router = express.Router();
const { createElection, castVote, getResults, closeElection } = require("../controllers/ssgController");
const { authRequired } = require("../middleware/authMiddleware");

// Elections (SSG)
router.post("/create", authRequired, createElection);
router.post("/vote", authRequired, castVote);
router.get("/results", authRequired, getResults);
router.post("/close", authRequired, closeElection);

module.exports = router;
