// models/User.js
const mongoose = require("mongoose");

const ROLES = [
  "User",       // default new account
  "Student",    // only via enrollment approval
  "Moderator",  // teachers
  "Registrar",  // assigned by SuperAdmin
  "Admin",      // Department Heads
  "SuperAdmin"  // Principal
];

// Addon roles (can coexist with base role)
const EXTRA_ROLES = [
  "SSG" // student government
];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // encrypted via Caesar cipher

    // Primary role
    role: {
      type: String,
      enum: ROLES,
      default: "User"
    },

    // Extra roles (SSG, etc.)
    extraRoles: [{ type: String, enum: EXTRA_ROLES }],

    // Allocations
    sections: [{ type: String }], // Moderators (teachers) can be assigned multiple sections
    strands: [{ type: String }],  // Admins (Dept Heads) can be assigned multiple strands

    // Flags
    active: { type: Boolean, default: true },

    // History & audit trail
    roleHistory: [
      {
        action: { type: String },          // "promote", "demote", "allocate", etc.
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who performed it
        byName: { type: String },          // cached for audit readability
        date: { type: Date, default: Date.now },
        details: { type: Object }          // flexible details
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
