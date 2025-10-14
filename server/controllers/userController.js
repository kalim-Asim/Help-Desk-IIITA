const {
  createUser,
  findUserByEmail,
  getUserDetailsByEmail,
  checkExistingFeedback,
  insertFeedback,
  markFeedbackGiven
} = require('../models/userModel');
const db = require('../config/db');
const crypto = require("crypto");
const {sendForgotPasswordMail} = require("../utils/mailer");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const bcrypt = require('bcrypt');
const { userSchema } = require('../schemas/userSchema');
const { feedbackSchema } = require('../schemas/feedbackSchema');
const SECRET_KEY = process.env.SECRET_KEY; 

const login = (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        error: "Database error" 
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      const token = jwt.sign({ 
        name: user.name, 
        email: user.email, 
        isAdmin: user.role === 'admin',
        id: user.id
      },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      return res.json({ 
        success: true, 
        token 
      });
    });
  });
};

const signup = async (req, res) => {
  const parseResult = userSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: parseResult.error.errors,
    });
  }
  const { name, email, password } = parseResult.data; 
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    findUserByEmail(email, (err, results) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          error: "Database error" 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "User already exists" 
        });
      }

      createUser(name, email, hashedPassword, 'user', (err2) => {
        if (err2) {
          return res.status(500).json({ 
            success: false, 
            error: "Failed to create user" 
          });
        }

        const token = jwt.sign({ name, email, isAdmin: false }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(201).json({
          success: true,
          message: "User registered successfully",
          token,
          user: { name, email, isAdmin: false },
        });
      });
    });
  } catch (err) {
      return res.status(500).json({ 
        success: false, 
        error: "Something went wrong" 
      });
    }
};

const userDetails = (req, res) => {
  const { email } = req.params;

  getUserDetailsByEmail(email, (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Server error" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ 
      success: true, 
      user: results[0] 
    });
  });
};

const feedback = (req, res) => {
  const parseResult = feedbackSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: parseResult.error.errors,
    });
  }

  const { complaint_id, user_id, assigned_personnel_id, rating, comment } = parseResult.data;

  checkExistingFeedback(complaint_id, (err, existing) => {
    if (err) {
      console.error("Error checking existing feedback:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while checking feedback.",
      });
    }

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted.",
      });
    }

    insertFeedback(complaint_id, user_id, assigned_personnel_id, rating, comment, (err2) => {
      if (err2) {
        console.error("Error inserting feedback:", err2);
        return res.status(500).json({
          success: false,
          message: "Failed to submit feedback.",
        });
      }

      markFeedbackGiven(complaint_id, (err3) => {
        if (err3) {
          console.error("Error updating complaint:", err3);
          return res.status(500).json({
            success: false,
            message: "Feedback saved, but failed to update complaint status.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Feedback submitted successfully.",
        });
      });
    });
  });
};

const resetTokens = {}; // Store tokens in memory

const ForgotPassword = (req, res) => {
  const {email} = req.body;
  const query = `SELECT name FROM users WHERE email = ?`;

  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).send("Database error");
    if (result.length === 0) return res.status(404).send("User not found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour validity

    resetTokens[token] = { email, expiresAt };

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    sendForgotPasswordMail(email, result[0].name, resetLink)
      .then(res.json({
        success: true
      }))
      .catch((mailErr) => {
        console.error("Mail error:", mailErr);
        res.status(500).send("Error sending reset email.");
      });
  });
};

const ResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const entry = resetTokens[token];

  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).send("Invalid or expired token.");
  }

  const email = entry.email;

  const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;
  db.query(updateQuery, [hashedPassword, email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error while resetting password." });
    }

    delete resetTokens[token]; // Invalidate the token after use
    res.send("Password has been reset successfully. You can now log in.");
  });
};

module.exports = { 
  login, 
  signup, 
  userDetails, 
  feedback,
  ForgotPassword,
  ResetPassword,
};
