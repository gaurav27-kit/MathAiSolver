"use strict";
/**
 * server.js  –  MathAI Solver · Express.js Backend
 *
 * Existing API endpoints (cookie-session auth)
 * ─────────────────────────────────────────────
 * POST   /api/auth/register
 * POST   /api/auth/login
 * POST   /api/auth/logout
 * GET    /api/auth/me
 * GET    /api/history
 * POST   /api/history
 * GET    /api/progress
 * POST   /api/progress
 * GET    /api/gamification
 * POST   /api/gamification/solve
 * GET    /api/gamification/badges
 * POST   /api/gamification/badges/unlock
 * GET    /api/gamification/leaderboard
 * GET    /api/health
 *
 * Google OAuth endpoints (passport + express-session)
 * ─────────────────────────────────────────────────────
 * GET    /auth/google
 * GET    /auth/google/callback
 * GET    /auth/logout
 * GET    /auth/user
 */

require("dotenv").config();

const path         = require("path");
const express      = require("express");
const cookieParser = require("cookie-parser");
const cors         = require("cors");
const session      = require("express-session");
const { MongoStore } = require("connect-mongo");
const passport     = require("./utils/passport");

const { connectDB }        = require("./utils/db");
const { attachUser }       = require("./middleware/auth");
const authRouter           = require("./routes/auth");
const historyRouter        = require("./routes/history");
const progressRouter       = require("./routes/progress");
const gamificationRouter   = require("./routes/gamification");
const googleAuthRouter     = require("./routes/googleAuth");

// ─── App ────────────────────────────────────────────────────────────────────

const app          = express();
const PORT         = Number(process.env.PORT || 5000);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const FRONTEND_DIR = path.resolve(__dirname, "..", "frontend");

// ─── CORS ───────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "null",
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle OPTIONS preflight explicitly before any other middleware
app.options("*", cors());

// ─── Core Middleware ─────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ─── Express Session (for Passport / Google OAuth) ───────────────────────────

app.use(session({
  secret:            process.env.SESSION_SECRET || "fallback-secret-change-me",
  resave:            false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl:       process.env.MONGODB_URI,
    dbName:         "maths_solver",
    collectionName: "google_sessions",
    ttl:            30 * 24 * 60 * 60, // 30 days in seconds
  }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days in ms
    secure:   process.env.NODE_ENV === "production",
  },
}));

// ─── Passport ────────────────────────────────────────────────────────────────

app.use(passport.initialize());
app.use(passport.session());

// ─── Existing cookie-based auth (for email/password login) ───────────────────

app.use(attachUser);

// ─── Health-check ────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ─── Google OAuth Routes (/auth/...) ─────────────────────────────────────────

app.use("/auth", googleAuthRouter);

// ─── Existing API Routes (/api/...) ──────────────────────────────────────────

app.use("/api/auth",         authRouter);
app.use("/api/history",      historyRouter);
app.use("/api/progress",     progressRouter);
app.use("/api/gamification", gamificationRouter);

// ─── Static frontend ─────────────────────────────────────────────────────────

app.use(express.static(FRONTEND_DIR));
app.get("/", (_req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({ message: "Not found." }));

// ─── Global error handler ────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  if (err.type === "entity.too.large")    return res.status(413).json({ message: "Request body is too large." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body." });
  if (err.message?.startsWith("CORS:"))   return res.status(403).json({ message: err.message });
  res.status(500).json({ message: "Internal server error." });
});

// ─── Start ───────────────────────────────────────────────────────────────────

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅  MathAI Solver backend running → http://localhost:${PORT}`);
      console.log(`   Health:        http://localhost:${PORT}/api/health`);
      console.log(`   Google Login:  http://localhost:${PORT}/auth/google`);
      console.log(`   Current User:  http://localhost:${PORT}/auth/user`);
    });
  })
  .catch(err => {
    console.error("❌  Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
