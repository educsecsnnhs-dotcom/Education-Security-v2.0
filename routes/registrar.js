const express = require("express");
const router = express.Router();
const { addEnrollment, reviewEnrollments, assignSection, adjustLimits } = require("../controllers/registrarController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Registrar only
router.post("/enrollment", authRequired, requireRole("Registrar"), addEnrollment);
router.get("/review", authRequired, requireRole("Registrar"), reviewEnrollments);
router.post("/assign-section", authRequired, requireRole("Registrar"), assignSection);
router.post("/adjust-limits", authRequired, requireRole("Registrar"), adjustLimits);

module.exports = router;
