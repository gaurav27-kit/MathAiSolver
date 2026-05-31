"use strict";
/**
 * routes/gamification.js
 * GET  /api/gamification
 * POST /api/gamification/solve
 * GET  /api/gamification/badges
 * POST /api/gamification/badges/unlock
 * GET  /api/gamification/leaderboard
 */

const express       = require("express");
const Gamification  = require("../models/Gamification");
const User          = require("../models/User");
const GoogleUser    = require("../models/GoogleUser");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// ─── helpers ─────────────────────────────────────────────────────────────────

function getBadgeTier(points) {
  if (points >= 800) return "Legend";
  if (points >= 500) return "Master";
  if (points >= 300) return "Expert";
  if (points >= 150) return "Advanced";
  if (points >= 50)  return "Intermediate";
  return "Beginner";
}

const BADGE_DEFINITIONS = [
  { id: 1, name: "First Steps",      icon: "🎯", description: "Solve your first problem",   requirement: 1    },
  { id: 2, name: "Problem Solver",   icon: "🧩", description: "Solve 10 problems",           requirement: 10   },
  { id: 3, name: "Math Enthusiast",  icon: "📐", description: "Solve 50 problems",           requirement: 50   },
  { id: 4, name: "Streak Master",    icon: "🔥", description: "Maintain a 7-day streak",     requirement: 7    },
  { id: 5, name: "Century Club",     icon: "💯", description: "Solve 100 problems",          requirement: 100  },
  { id: 6, name: "Point Collector",  icon: "⭐", description: "Earn 500 points",             requirement: 500  },
  { id: 7, name: "Math Legend",      icon: "👑", description: "Earn 1000 points",            requirement: 1000 },
];

// ─── routes ──────────────────────────────────────────────────────────────────

// GET /api/gamification
router.get("/", async (req, res, next) => {
  try {
    const stats = await Gamification.findOne({ userId: req.user._id }).lean()
      || { points: 0, streak: 0, lastStreakDate: null, todaySolves: 0, lastSolveDate: null };

    return res.status(200).json({
      gamification: {
        points:         stats.points,
        streak:         stats.streak,
        lastStreakDate: stats.lastStreakDate,
        todaySolves:    stats.todaySolves,
        lastSolveDate:  stats.lastSolveDate,
        level:          getBadgeTier(stats.points),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/gamification/solve
router.post("/solve", async (req, res, next) => {
  try {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();

    // findOneAndUpdate with upsert so we never need a separate create
    const existing = await Gamification.findOne({ userId: req.user._id });
    const prevPoints = existing ? existing.points : 0;
    const prevBadge  = getBadgeTier(prevPoints);

    const update = { $inc: { points: 10 } };

    if (!existing || existing.lastSolveDate !== today) {
      update.$set = { todaySolves: 1, lastSolveDate: today };
    } else {
      update.$inc.todaySolves = 1;
    }

    // Streak logic
    if (!existing || (!existing.lastStreakDate)) {
      update.$set = { ...(update.$set || {}), streak: 1, lastStreakDate: today };
    } else if (existing.lastStreakDate === today) {
      // already counted today — no streak change
    } else if (existing.lastStreakDate === yesterday) {
      update.$inc.streak = 1;
      update.$set = { ...(update.$set || {}), lastStreakDate: today };
    } else {
      update.$set = { ...(update.$set || {}), streak: 1, lastStreakDate: today };
    }

    const updated = await Gamification.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { upsert: true, new: true }
    ).lean();

    const newBadge  = getBadgeTier(updated.points);
    const leveledUp = newBadge !== prevBadge;

    return res.status(200).json({
      gamification: {
        points:         updated.points,
        streak:         updated.streak,
        lastStreakDate: updated.lastStreakDate,
        todaySolves:    updated.todaySolves,
        lastSolveDate:  updated.lastSolveDate,
        level:          newBadge,
      },
      leveledUp,
      newBadge,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/gamification/badges
router.get("/badges", async (req, res, next) => {
  try {
    const stats = await Gamification.findOne({ userId: req.user._id }).lean();
    const unlockedIds = new Set(stats?.unlockedBadges || []);

    const badges = BADGE_DEFINITIONS.map(badge => ({
      id:          badge.id,
      name:        badge.name,
      icon:        badge.icon,
      description: badge.description,
      unlocked:    unlockedIds.has(badge.id),
    }));

    return res.status(200).json({ badges });
  } catch (err) {
    next(err);
  }
});

// POST /api/gamification/badges/unlock
router.post("/badges/unlock", async (req, res, next) => {
  try {
    const { badgeId } = req.body;

    if (!badgeId || typeof badgeId !== "number") {
      return res.status(400).json({ message: "Valid badge ID is required." });
    }

    const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badge) {
      return res.status(404).json({ message: "Badge not found." });
    }

    const stats = await Gamification.findOne({ userId: req.user._id });
    const alreadyUnlocked = stats?.unlockedBadges?.includes(badgeId);

    if (alreadyUnlocked) {
      return res.status(400).json({ message: "Badge already unlocked." });
    }

    await Gamification.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { unlockedBadges: badgeId } },
      { upsert: true }
    );

    return res.status(200).json({
      badge:    { id: badge.id, name: badge.name, icon: badge.icon },
      unlocked: true,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/gamification/leaderboard
router.get("/leaderboard", async (req, res, next) => {
  try {
    const topStats = await Gamification
      .find()
      .sort({ points: -1 })
      .limit(10)
      .lean();

    // Fetch user names in one query
    const userIds = topStats.map(s => s.userId);
    const [users, googleUsers] = await Promise.all([
      User.find({ _id: { $in: userIds } }).lean(),
      GoogleUser.find({ _id: { $in: userIds } }).lean()
    ]);
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.fullName;
    });
    googleUsers.forEach(u => {
      userMap[u._id.toString()] = u.name;
    });

    const leaderboard = topStats.map((s, i) => ({
      rank:   i + 1,
      user:   userMap[s.userId.toString()] || "Unknown",
      points: s.points,
      streak: s.streak,
    }));

    return res.status(200).json({ leaderboard });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
