/**
 * routes/auth-simple.js - Without Joi validation
 * Use this if Joi isn't installed yet
 */

const express = require("express");

const { db, save }             = require("../utils/db");
const { hashPassword, verifyPassword } = require("../utils/crypto");
const { createSession, destroySession, cookieHeader } = require("../utils/session");
const { requireAuth }          = require("../middleware/auth");

const router = express.Router();

// ─── helpers ────────────────────────────────────────────────────────────────

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function userPayload(user) {
  return { id: user.id, fullName: user.fullName, email: user.email };
}

// ─── routes ─────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { fullName, email, password } = req.body;

  // Simple validation
  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ message: "Full name must be at least 2 characters." });
  }
  if (!email || !isEmail(email)) {
    return res.status(400).json({ message: "A valid email address is required." });
  }
  if (!password || password.length < 6 || password.length > 120) {
    return res.status(400).json({ message: "Password must be between 6 and 120 characters." });
  }

  const emailLower = email.toLowerCase();
  if (db.users.some((u) => u.email === emailLower)) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  const user = {
    id:           db.nextUserId++,
    fullName:     fullName.trim(),
    email:        emailLower,
    passwordHash: hashPassword(password),
    createdAt:    new Date().toISOString(),
  };

  db.users.push(user);
  save();

  const sessionId = createSession(user.id);
  res.setHeader("Set-Cookie", cookieHeader(sessionId));
  return res.status(201).json({ user: userPayload(user) });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !isEmail(email)) {
    return res.status(400).json({ message: "A valid email address is required." });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const emailLower = email.toLowerCase();
  const user = db.users.find((u) => u.email === emailLower);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const sessionId = createSession(user.id);
  res.setHeader("Set-Cookie", cookieHeader(sessionId));
  return res.status(200).json({ user: userPayload(user) });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  destroySession(req.sessionId);
  res.setHeader("Set-Cookie", cookieHeader("", 0));
  return res.status(200).json({ message: "Logged out." });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({ user: userPayload(req.user) });
});

module.exports = router;
