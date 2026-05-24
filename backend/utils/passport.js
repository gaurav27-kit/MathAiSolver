"use strict";
/**
 * utils/passport.js
 * Configures Passport with Google OAuth 2.0 strategy.
 */

const passport            = require("passport");
const GoogleStrategy      = require("passport-google-oauth20").Strategy;
const GoogleUser          = require("../models/GoogleUser");

// ─── Serialize / Deserialize ─────────────────────────────────────────────────
// Store only the MongoDB _id in the session cookie.

passport.serializeUser((user, done) => {
  console.log("[passport] serializeUser:", user._id);
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await GoogleUser.findById(id).lean();
    console.log("[passport] deserializeUser:", user ? user.email : "not found");
    done(null, user || null);
  } catch (err) {
    console.error("[passport] deserializeUser error:", err.message);
    done(err, null);
  }
});

// ─── Google Strategy ─────────────────────────────────────────────────────────

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("[passport] Google profile received:", profile.displayName, profile.emails?.[0]?.value);

      const googleId = profile.id;
      const name     = profile.displayName || "Google User";
      const email    = profile.emails?.[0]?.value || "";

      if (!email) {
        return done(new Error("No email returned from Google."), null);
      }

      // Upsert: create if new, update name/email if returning user
      const user = await GoogleUser.findOneAndUpdate(
        { googleId },
        { googleId, name, email },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log("[passport] User saved/updated in MongoDB:", user.email);
      return done(null, user);
    } catch (err) {
      console.error("[passport] Strategy error:", err.message);
      return done(err, null);
    }
  }
));

module.exports = passport;
