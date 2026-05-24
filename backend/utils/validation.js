/**
 * utils/validation.js
 * Joi validation schemas for all API endpoints
 */

const Joi = require("joi");

// ─── Auth Schemas ────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required()
    .messages({
      "string.empty": "Full name is required.",
      "string.min": "Full name must be at least 2 characters.",
      "string.max": "Full name must not exceed 100 characters.",
    }),
  email: Joi.string().email().lowercase().required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "A valid email address is required.",
    }),
  password: Joi.string().min(6).max(120).required()
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password must not exceed 120 characters.",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
    .messages({
      "string.empty": "Email is required.",
      "string.email": "A valid email address is required.",
    }),
  password: Joi.string().required()
    .messages({
      "string.empty": "Password is required.",
    }),
});

// ─── History Schemas ─────────────────────────────────────────────────────────

const historySchema = Joi.object({
  section: Joi.string().trim().min(1).max(100).required()
    .messages({
      "string.empty": "Section is required.",
      "string.max": "Section must not exceed 100 characters.",
    }),
  question: Joi.string().trim().min(1).max(4000).required()
    .messages({
      "string.empty": "Question is required.",
      "string.max": "Question must not exceed 4000 characters.",
    }),
  answer: Joi.string().trim().min(1).max(4000).required()
    .messages({
      "string.empty": "Answer is required.",
      "string.max": "Answer must not exceed 4000 characters.",
    }),
});

// ─── Progress Schemas ────────────────────────────────────────────────────────

const progressSchema = Joi.object({
  currentSection: Joi.string().trim().min(1).max(100).required()
    .messages({
      "string.empty": "Current section is required.",
      "string.max": "Current section must not exceed 100 characters.",
    }),
  // lastQuestion is fully optional — omitting it means "don't overwrite"
  lastQuestion: Joi.string().trim().max(4000).allow("").optional()
    .messages({
      "string.max": "Last question must not exceed 4000 characters.",
    }),
});

// ─── Validation Middleware ───────────────────────────────────────────────────

/**
 * Create a middleware that validates req.body against a Joi schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: "Validation failed.",
        errors,
      });
    }

    req.body = value; // Use sanitized values
    next();
  };
}

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  historySchema,
  progressSchema,
};
