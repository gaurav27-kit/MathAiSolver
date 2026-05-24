"use strict";
/**
 * routes/history.js
 * GET  /api/history  – last 20 entries for current user
 * POST /api/history  – save a new entry
 */

const express  = require("express");
const History  = require("../models/History");
const { requireAuth }              = require("../middleware/auth");
const { validate, historySchema }  = require("../utils/validation");

const router = express.Router();
router.use(requireAuth);

// GET /api/history
router.get("/", async (req, res, next) => {
  try {
    const history = await History
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      history: history.map(e => ({
        id:        e._id,
        section:   e.section,
        question:  e.question,
        answer:    e.answer,
        createdAt: e.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/history
router.post("/", validate(historySchema), async (req, res, next) => {
  try {
    const { section, question, answer } = req.body;

    await History.create({
      userId:  req.user._id,
      section: section.toLowerCase(),
      question,
      answer,
    });

    return res.status(201).json({ message: "History saved." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
