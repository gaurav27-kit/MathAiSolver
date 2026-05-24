"use strict";
/**
 * utils/db.js
 * MongoDB connection via Mongoose.
 */

const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env file.");
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log("✅  MongoDB connected →", uri.replace(/:\/\/.*@/, "://***@")); // hide credentials in log
}

module.exports = { connectDB };
