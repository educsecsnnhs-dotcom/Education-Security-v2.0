// controllers/eventController.js
exports.createEvent = async (req, res) => {
  try {
    res.json({ message: "Event created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
