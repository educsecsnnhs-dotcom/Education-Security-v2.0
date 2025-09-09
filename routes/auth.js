const express = require("express");
const router = express.Router();
const { register, login, assignRole } = require("../controllers/authController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Only SuperAdmin can assign Registrar/Admin roles
router.post("/assign-role", authRequired, assignRole);

module.exports = router;
