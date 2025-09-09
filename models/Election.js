// models/Election.js
const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "SSG Elections 2025"
    level: {
      type: String,
      enum: ["SchoolWide", "GradeLevel", "SectionLevel"],
      required: true,
    },
    positions: [
      {
        name: { type: String, required: true }, // e.g., President, Vice President, Rep
        level: { type: String, enum: ["School", "Grade", "Section"], required: true },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Draft", "Ongoing", "Closed"],
      default: "Draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // SSG or Admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);
