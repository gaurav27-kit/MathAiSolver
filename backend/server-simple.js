/**
 * server-simple.js  –  Simplified version without helmet/rate-limit/joi
 * Use this if npm install hasn't been run yet.
 * Only depends on: express, cookie-parser, cors  (all in original package.json)
 */

"use strict";

const path         = require("path");
const express      = require("express");
const cookieParser = require("cookie-parser");
const cors         = require("cors");

const { attachUser }    = require("./middleware/auth");
const authRouter        = require("./routes/auth-simple");

// ─── App ────────────────────────────────────────────────────────────────────

const app  = express();
const PORT = Number(process.env.PORT || 8080);
const FRONTEND_DIR = path.resolve(__dirname, "..", "frontend");

// ─── CORS (MUST BE FIRST) ───────────────────────────────────────────────────

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));

// ─── Core Middleware ─────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(attachUser);

// ─── Auth Routes ─────────────────────────────────────────────────────────────

app.use("/api/auth", authRouter);

// ─── History Routes (inline, no Joi) ─────────────────────────────────────────

const { db, save } = require("./utils/db");
const { requireAuth } = require("./middleware/auth");

app.get("/api/history", requireAuth, (req, res) => {
  const history = db.history
    .filter((e) => e.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)
    .map(({ id, section, question, answer, createdAt }) => ({ id, section, question, answer, createdAt }));
  return res.status(200).json({ history });
});

app.post("/api/history", requireAuth, (req, res) => {
  const { section, question, answer } = req.body;
  if (!section || !question || !answer) {
    return res.status(400).json({ message: "section, question, and answer are required." });
  }
  if (String(question).length > 4000 || String(answer).length > 4000) {
    return res.status(400).json({ message: "question and answer must be 4000 characters or fewer." });
  }
  db.history.push({
    id: db.nextHistoryId++,
    userId: req.user.id,
    section: String(section).trim().toLowerCase(),
    question: String(question).trim(),
    answer: String(answer).trim(),
    createdAt: new Date().toISOString(),
  });
  save();
  return res.status(201).json({ message: "History saved." });
});

// ─── Progress Routes (inline, no Joi) ────────────────────────────────────────

app.get("/api/progress", requireAuth, (req, res) => {
  const progress = db.progress.find((p) => p.userId === req.user.id);
  if (!progress) return res.status(200).json({ progress: null });
  const { currentSection, lastQuestion, updatedAt } = progress;
  return res.status(200).json({ progress: { currentSection, lastQuestion, updatedAt } });
});

app.post("/api/progress", requireAuth, (req, res) => {
  const { currentSection, lastQuestion } = req.body;
  if (!currentSection) return res.status(400).json({ message: "currentSection is required." });
  const updatedAt = new Date().toISOString();
  const existing = db.progress.find((p) => p.userId === req.user.id);
  if (existing) {
    existing.currentSection = String(currentSection).trim().toLowerCase();
    // Only overwrite lastQuestion when the client explicitly sends it
    if (lastQuestion !== undefined) {
      existing.lastQuestion = String(lastQuestion).trim();
    }
    existing.updatedAt = updatedAt;
  } else {
    db.progress.push({ userId: req.user.id, currentSection: String(currentSection).trim().toLowerCase(), lastQuestion: lastQuestion ? String(lastQuestion).trim() : "", updatedAt });
  }
  save();
  return res.status(200).json({ message: "Progress saved." });
});

// ─── Gamification Routes (inline, no Joi) ────────────────────────────────────

function defaultStats() {
  return { points: 0, streak: 0, lastStreakDate: null, todaySolves: 0, lastSolveDate: null };
}
function getBadgeTier(points) {
  if (points >= 800) return "Legend";
  if (points >= 500) return "Master";
  if (points >= 300) return "Expert";
  if (points >= 150) return "Advanced";
  if (points >= 50)  return "Intermediate";
  return "Beginner";
}

app.get("/api/gamification", requireAuth, (req, res) => {
  const stats = db.gamification.find((g) => g.userId === req.user.id) || defaultStats();
  return res.status(200).json({ gamification: { ...stats, level: getBadgeTier(stats.points) } });
});

app.post("/api/gamification/solve", requireAuth, (req, res) => {
  const existing = db.gamification.find((g) => g.userId === req.user.id);
  const stats = existing ? { ...existing } : { userId: req.user.id, ...defaultStats() };
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  const prevBadge = getBadgeTier(stats.points);
  stats.points += 10;
  if (stats.lastSolveDate === today) { stats.todaySolves += 1; }
  else { stats.todaySolves = 1; stats.lastSolveDate = today; }
  if (stats.lastStreakDate === today) { /* no change */ }
  else if (stats.lastStreakDate === yesterday) { stats.streak += 1; stats.lastStreakDate = today; }
  else { stats.streak = 1; stats.lastStreakDate = today; }
  const newBadge = getBadgeTier(stats.points);
  if (existing) { Object.assign(existing, stats); } else { db.gamification.push({ userId: req.user.id, ...stats }); }
  save();
  return res.status(200).json({ gamification: stats, leveledUp: newBadge !== prevBadge, newBadge });
});

app.get("/api/gamification/leaderboard", requireAuth, (req, res) => {
  const leaderboard = db.users
    .map(user => { const s = db.gamification.find(g => g.userId === user.id) || defaultStats(); return { user: user.fullName, points: s.points, streak: s.streak }; })
    .sort((a, b) => b.points - a.points).slice(0, 10)
    .map((e, i) => ({ ...e, rank: i + 1 }));
  return res.status(200).json({ leaderboard });
});

// ─── Static + Health ─────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));
app.use(express.static(FRONTEND_DIR));
app.get("/", (_req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));

// ─── 404 + Error handler ─────────────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({ message: "Not found." }));
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body." });
  res.status(500).json({ message: "Internal server error." });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  MathAI Solver backend running → http://localhost:${PORT}`);
  console.log(`   Mode: SIMPLE (no helmet/joi/rate-limit)`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
