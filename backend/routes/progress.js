"use strict";
/**
 * routes/progress.js
 * GET  /api/progress  – fetch saved progress
 * POST /api/progress  – upsert progress
 */

const express   = require("express");
const Progress  = require("../models/Progress");
const { requireAuth }               = require("../middleware/auth");
const { validate, progressSchema }  = require("../utils/validation");

const router = express.Router();
router.use(requireAuth);

// GET /api/progress
router.get("/", async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id }).lean();

    if (!progress) {
      return res.status(200).json({ progress: null });
    }

    return res.status(200).json({
      progress: {
        currentSection: progress.currentSection,
        lastQuestion:   progress.lastQuestion,
        updatedAt:      progress.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress
router.post("/", validate(progressSchema), async (req, res, next) => {
  try {
    const { currentSection, lastQuestion } = req.body;

    const update = { currentSection: currentSection.toLowerCase() };
    // Only overwrite lastQuestion when the client explicitly sends it
    if (lastQuestion !== undefined) {
      update.lastQuestion = lastQuestion;
    }

    await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $set: update },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "Progress saved." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
