const express = require("express");
const router = express.Router();
const { globalReports, overseeAdmins } = require("../controllers/principalController");
const { authRequired, requireRole } = require("../middleware/authMiddleware");

// Principal (SuperAdmin)
router.get("/reports", authRequired, requireRole("SuperAdmin"), globalReports);
router.get("/oversee", authRequired, requireRole("SuperAdmin"), overseeAdmins);

module.exports = router;
