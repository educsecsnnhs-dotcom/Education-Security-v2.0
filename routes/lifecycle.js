// routes/lifecycle.js
const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();
const lifecycleController = require("../controllers/lifecycleController");
const { authRequired } = require("../controllers/authController");
const Enrollment = require("../models/Enrollment"); // ✅ don’t forget this

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
    cb(new Error("❌ Only PDF, JPG, and PNG files are allowed"));
  }
}

// ✅ Limit: 5MB per file
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ================= Routes =================

// Archived students
router.get("/enrollment/archived", async (req, res) => {
  try {
    const students = await Enrollment.find({ archived: true });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching archived students", error: err.message });
  }
});

// Restore student
router.post("/enrollment/:id/restore", lifecycleController.restoreStudent);

// Student submits enrollment
router.post(
  "/enroll",
  authRequired,
  upload.fields([
    { name: "reportCard", maxCount: 1 },
    { name: "goodMoral", maxCount: 1 },
    { name: "birthCert", maxCount: 1 },
    { name: "otherDocs", maxCount: 5 },
  ]),
  lifecycleController.enrollStudent
);

// ================= Multer Error Handler =================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "❌ File too large. Max 5MB allowed." });
    }
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err.message.includes("Only PDF, JPG, and PNG")) {
    return res.status(400).json({ error: err.message });
  }
  next(err); // pass to default error handler
});

module.exports = router;
