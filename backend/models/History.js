"use strict";
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  section:  { type: String, required: true, trim: true },
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
}, { timestamps: true });

// Fast per-user queries sorted by newest first
historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("History", historySchema);
