"use strict";
const mongoose = require("mongoose");

const gamificationSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  points:         { type: Number, default: 0 },
  streak:         { type: Number, default: 0 },
  lastStreakDate: { type: String, default: null },
  todaySolves:    { type: Number, default: 0 },
  lastSolveDate:  { type: String, default: null },
  unlockedBadges: { type: [Number], default: [] },
});

module.exports = mongoose.model("Gamification", gamificationSchema);
