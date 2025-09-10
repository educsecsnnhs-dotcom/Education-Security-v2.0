// controllers/ssgBoardController.js
const SSGPost = require("../models/SSGPost");

/**
 * Create a new SSG post
 */
exports.createPost = async (req, res) => {
  try {
    if (!["SSG", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only SSG officers or SuperAdmin can post" });
    }

    const { title, content } = req.body;
    const post = new SSGPost({
      title,
      content,
      createdBy: req.user._id,
    });

    await post.save();
    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
};

/**
 * Get all SSG posts (everyone can view)
 */
exports.getPosts = async (req, res) => {
  try {
    const posts = await SSGPost.find()
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
};

/**
 * Delete a post
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await SSGPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      req.user.role !== "SuperAdmin" &&
      !(req.user.role === "SSG" && post.createdBy.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.remove();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting post", error: err.message });
  }
};
