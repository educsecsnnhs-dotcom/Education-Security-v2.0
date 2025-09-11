const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { authRequired } = require("../controllers/authController");

// Fetch all users
router.get("/", authRequired, roleController.getAllUsers);

// Promote user
router.post("/promote", authRequired, roleController.promoteUser);

// Toggle SSG
router.post("/ssg/toggle", authRequired, roleController.toggleSSG);

// Allocate staff (sections/strands)
router.post("/allocate", authRequired, roleController.allocateUser);

// View audit trail
router.get("/:id/history", authRequired, roleController.getUserHistory);

module.exports = router;
