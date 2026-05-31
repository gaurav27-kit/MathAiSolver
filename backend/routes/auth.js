"use strict";
/**
 * routes/auth.js
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 */

const express = require("express");
const User    = require("../models/User");
const { hashPassword, verifyPassword }            = require("../utils/crypto");
const { createSession, destroySession, cookieHeader } = require("../utils/session");
const { requireAuth }                             = require("../middleware/auth");
const { validate, registerSchema, loginSchema }   = require("../utils/validation");

const router = express.Router();

function userPayload(user) {
  return {
    id:       user._id,
    fullName: user.fullName || user.name,
    email:    user.email,
    isGoogle: !!user.googleId,
  };
}

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      fullName,
      email,
      passwordHash: hashPassword(password),
    });

    const sessionId = await createSession(user._id);
    res.setHeader("Set-Cookie", cookieHeader(sessionId));
    return res.status(201).json({ user: userPayload(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const sessionId = await createSession(user._id);
    res.setHeader("Set-Cookie", cookieHeader(sessionId));
    return res.status(200).json({ user: userPayload(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res, next) => {
  try {
    await destroySession(req.sessionId);
    res.setHeader("Set-Cookie", cookieHeader("", 0));
    return res.status(200).json({ message: "Logged out." });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({ user: userPayload(req.user) });
});

module.exports = router;
