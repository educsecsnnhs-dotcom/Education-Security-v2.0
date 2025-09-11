const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");

// Teacher’s assigned classes
router.get("/teacher/:teacherId", classController.getTeacherClasses);

// Single class details
router.get("/:id", classController.getClassById);

module.exports = router;
