"use strict";
/**
 * models/GoogleUser.js
 * Stores users who sign in via Google OAuth.
 * Kept separate from the email/password User model.
 */

const mongoose = require("mongoose");

const googleUserSchema = new mongoose.Schema({
  googleId: {
    type:     String,
    required: true,
    unique:   true,
  },
  name: {
    type:     String,
    required: true,
    trim:     true,
  },
  email: {
    type:      String,
    required:  true,
    lowercase: true,
    trim:      true,
  },
}, { timestamps: true });

module.exports = mongoose.model("GoogleUser", googleUserSchema);
