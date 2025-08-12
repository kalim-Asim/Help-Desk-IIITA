const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  userDetails, 
  feedback,
  ForgotPassword,
  ResetPassword
} = require('../controllers/userController');
const { userMiddleware } = require('../utils/auth');

router.post('/login', login);
router.post('/signup', signup);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password/:token", ResetPassword);
router.post("/feedback", userMiddleware, feedback);
router.get("/:email", userMiddleware, userDetails);

module.exports = router;
