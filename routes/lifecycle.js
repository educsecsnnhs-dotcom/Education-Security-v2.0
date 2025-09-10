const express = require("express");
const router = express.Router();
const { promoteStudent, archiveStudent } = require("../controllers/lifecycleController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Lifecycle management (Registrar + Principal)
router.post("/promote", authRequired, requireRole("Registrar"), promoteStudent);
router.post("/archive", authRequired, requireRole("Registrar"), archiveStudent);

module.exports = router;
