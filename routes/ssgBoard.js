//routes/ssgBoard.js

const express = require("express");
const router = express.Router();
const { authRequired } = require("../middleware/authMiddleware");
const { createPost, getPosts, deletePost } = require("../controllers/ssgBoardController");

// SSG Management Board
router.post("/create", authRequired, createPost);
router.get("/", authRequired, getPosts);
router.delete("/:id", authRequired, deletePost);

module.exports = router;
