"use strict";
/**
 * middleware/auth.js
 * Async middleware — reads session cookie, attaches req.user.
 */

const User                          = require("../models/User");
const { SESSION_COOKIE, getSession } = require("../utils/session");

async function attachUser(req, res, next) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  req.sessionId = sessionId || null;

  // If Passport already restored a Google OAuth user via passport.session(),
  // do NOT overwrite req.user — just move on.
  if (req.user) {
    return next();
  }

  req.user = null;

  if (sessionId) {
    try {
      const session = await getSession(sessionId);
      if (session) {
        req.user = await User.findById(session.userId).lean() || null;
        if (!req.user) {
          console.warn(`[auth] Session references unknown userId: ${session.userId}`);
        }
      }
    } catch (err) {
      console.error("[auth] Error looking up session:", err.message);
    }
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Please log in first." });
  }
  next();
}

module.exports = { attachUser, requireAuth };
