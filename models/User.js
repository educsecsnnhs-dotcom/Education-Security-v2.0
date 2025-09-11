// models/User.js
const mongoose = require("mongoose");

const ROLES = [
  "User",       // default new account
  "Student",    // assigned by Registrar
  "Moderator",  // teachers
  "SSG",        // Student Gov (addon role)
  "Registrar",  // assigned by SuperAdmin
  "Admin",      // Department Heads
  "SuperAdmin"  // Principal
];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // stored encrypted via Caesar
    role: {
      type: String,
      enum: ROLES,
      default: "User"
    },
    extraRoles: [{ type: String }], // e.g. ["SSG"] if given
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
