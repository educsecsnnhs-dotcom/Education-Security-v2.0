// controllers/announcementController.js
const Announcement = require("../models/Announcement");

/**
 * Create new announcement
 * Only Admins or Principal can post
 */
exports.createAnnouncement = async (req, res) => {
  try {
    if (!["Admin", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only Admins or Principal can post announcements" });
    }

    const { title, content } = req.body;
    const announcement = new Announcement({
      title,
      content,
      postedBy: req.user._id,
    });

    await announcement.save();
    res.status(201).json({ message: "Announcement posted", announcement });
  } catch (err) {
    res.status(500).json({ message: "Error creating announcement", error: err.message });
  }
};

/**
 * Get all announcements (visible on Welcome Page)
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "fullName role")
      .sort({ createdAt: -1 });

    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcements", error: err.message });
  }
};

/**
 * Delete announcement
 * Only creator or Principal can delete
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.body;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    if (
      announcement.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "SuperAdmin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this announcement" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting announcement", error: err.message });
  }
};
