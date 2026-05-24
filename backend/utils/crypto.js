/**
 * utils/crypto.js
 * Password hashing and verification using Node's built-in crypto (scrypt).
 */

const crypto = require("crypto");

/**
 * Hash a plain-text password.
 * Returns a string in the format  scrypt:<salt>:<hash>
 */
function hashPassword(plaintext) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(plaintext, salt, 64).toString("base64url");
  return `scrypt:${salt}:${hash}`;
}

/**
 * Verify a plain-text password against a stored scrypt hash.
 */
function verifyPassword(plaintext, storedHash) {
  const [algorithm, salt, hash] = String(storedHash || "").split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const derived = crypto.scryptSync(plaintext, salt, 64);
  const stored  = Buffer.from(hash, "base64url");
  return stored.length === derived.length && crypto.timingSafeEqual(stored, derived);
}

module.exports = { hashPassword, verifyPassword };
