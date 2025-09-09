const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const { authRequired } = require("../middleware/authMiddleware");

// Profile (Any authenticated user)
router.get("/", authRequired, getProfile);
router.post("/update", authRequired, updateProfile);

module.exports = router;
