// routes/lifecycle.js
const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();
const lifecycleController = require("../controllers/lifecycleController");
const { authRequired } = require("../controllers/authController");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/enrollments/"); // ✅ save under /uploads/enrollments/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Allow only PDF/JPG/PNG
function fileFilter(req, file, cb) {
  const allowed = /pdf|jpg|jpeg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"));
  }
}

const upload = multer({ storage, fileFilter });

// Student submits enrollment with documents
router.post(
  "/enroll",
  authRequired, // must be logged in
  upload.fields([
    { name: "reportCard", maxCount: 1 },
    { name: "goodMoral", maxCount: 1 },
    { name: "birthCert", maxCount: 1 },
    { name: "otherDocs", maxCount: 5 },
  ]),
  lifecycleController.enrollStudent
);

module.exports = router;
