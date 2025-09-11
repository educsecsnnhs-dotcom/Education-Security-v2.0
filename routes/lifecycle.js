const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();
const lifecycleController = require("../controllers/lifecycleController");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/enrollments/"); // make sure folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Route for enrollment
router.post(
  "/enroll",
  upload.fields([
    { name: "reportCard", maxCount: 1 },
    { name: "goodMoral", maxCount: 1 },
    { name: "birthCert", maxCount: 1 },
    { name: "otherDocs", maxCount: 5 },
  ]),
  lifecycleController.enrollStudent
);

module.exports = router;
