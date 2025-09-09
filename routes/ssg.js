const express = require("express");
const router = express.Router();
const { createElection, vote, viewResults } = require("../controllers/ssgController");
const { authRequired } = require("../middleware/authMiddleware");

// Elections (SSG)
router.post("/create", authRequired, createElection);
router.post("/vote", authRequired, vote);
router.get("/results", authRequired, viewResults);

module.exports = router;
