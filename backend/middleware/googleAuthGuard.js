"use strict";
/**
 * middleware/googleAuthGuard.js
 * Protects routes that require Google OAuth login.
 * Use this on routes that should only be accessible to Google-authenticated users.
 */

function requireGoogleAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    loggedIn: false,
    message:  "Please sign in with Google to access this resource.",
  });
}

module.exports = { requireGoogleAuth };
