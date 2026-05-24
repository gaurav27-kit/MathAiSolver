"use strict";
/**
 * routes/googleAuth.js
 *
 * GET  /auth/google           → redirect to Google consent screen
 * GET  /auth/google/callback  → Google redirects here after login
 * GET  /auth/logout           → destroy session, redirect to frontend
 * GET  /auth/user             → return logged-in user (or 401)
 */

const express  = require("express");
const passport = require("../utils/passport");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Start Google OAuth flow ─────────────────────────────────────────────────

router.get("/google", (req, res, next) => {
  console.log("[auth] Starting Google OAuth flow");
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

// ─── Google callback ─────────────────────────────────────────────────────────

router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login.html?error=google_failed`,
    session: true,
  }),
  (req, res) => {
    console.log("[auth] Google login successful:", req.user?.email);
    // Redirect to solver after successful login
    res.redirect(`${FRONTEND_URL}/solver.html`);
  }
);

// ─── Logout ──────────────────────────────────────────────────────────────────

router.get("/logout", (req, res, next) => {
  const email = req.user?.email || "unknown";
  req.logout((err) => {
    if (err) {
      console.error("[auth] Logout error:", err.message);
      return next(err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("[auth] Session destroy error:", destroyErr.message);
      }
      res.clearCookie("connect.sid");
      console.log("[auth] User logged out:", email);
      res.redirect(`${FRONTEND_URL}/login.html`);
    });
  });
});

// ─── Get current user ────────────────────────────────────────────────────────

router.get("/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ loggedIn: false, user: null });
  }
  return res.status(200).json({
    loggedIn: true,
    user: {
      id:    req.user._id,
      name:  req.user.name,
      email: req.user.email,
    },
  });
});

module.exports = router;
