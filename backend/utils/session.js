"use strict";
/**
 * utils/session.js
 * Session management backed by MongoDB.
 * MongoDB TTL index handles automatic expiry cleanup.
 */

const crypto  = require("crypto");
const Session = require("../models/Session");

const SESSION_COOKIE    = "maths_solver_sid";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Generate a session ID, persist it, return the ID. */
async function createSession(userId) {
  const sessionId = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await Session.create({ sessionId, userId, expiresAt });
  return sessionId;
}

/**
 * Look up a session by ID.
 * Returns { userId } or null if missing/expired.
 * Rolls the expiry forward on each use.
 */
async function getSession(sessionId) {
  if (!sessionId) return null;

  const session = await Session.findOne({ sessionId });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await Session.deleteOne({ sessionId });
    return null;
  }

  // Rolling expiry — extend without waiting for the result
  Session.updateOne(
    { sessionId },
    { expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS) }
  ).catch(() => {}); // fire-and-forget, non-critical

  return { userId: session.userId };
}

/** Delete a session (logout). */
async function destroySession(sessionId) {
  if (!sessionId) return;
  await Session.deleteOne({ sessionId });
}

/** Build the Set-Cookie header value. */
function cookieHeader(sessionId, maxAgeMs = SESSION_MAX_AGE_MS) {
  const maxAge = Math.floor(maxAgeMs / 1000);
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

module.exports = {
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
  createSession,
  getSession,
  destroySession,
  cookieHeader,
};
