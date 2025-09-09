// models/User.js
const mongoose = require("mongoose");
const { encryptPassword } = require("../utils/caesar");

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
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // stored encrypted via Caesar
    role: {
      type: String,
      enum: ROLES,
      default: "User"
    },
    extraRoles: [{ type: String }], // e.g. ["SSG"] if given
    lrn: { type: String, unique: true, sparse: true }, // Learner Reference Number (optional at register, used in enrollment)
  },
  { timestamps: true }
);

// Middleware: Encrypt password before save
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = encryptPassword(this.password);
  next();
});

module.exports = mongoose.model("User", userSchema);
