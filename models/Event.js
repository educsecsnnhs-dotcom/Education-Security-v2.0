// models/Event.js
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  details: { type: String, required: true },
  department: { type: String, required: true }, // department-only events
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", EventSchema);
