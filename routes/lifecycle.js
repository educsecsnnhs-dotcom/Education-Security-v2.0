const express = require("express");
const router = express.Router();
const { promoteStudents, archiveStudents } = require("../controllers/lifecycleController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Lifecycle management (Registrar + Principal)
router.post("/promote", authRequired, requireRole("Registrar"), promoteStudents);
router.post("/archive", authRequired, requireRole("Registrar"), archiveStudents);

module.exports = router;
