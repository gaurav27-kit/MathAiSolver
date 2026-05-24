"use strict";
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  currentSection: { type: String, default: "probability", trim: true },
  lastQuestion:   { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);
