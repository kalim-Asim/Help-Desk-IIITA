const express = require('express');
const router = express.Router();
const {
  sendMessages,
  getMessages,
  getMessageByUsers
} = require("../controllers/chatController")

router.post('/', sendMessages);
router.get('/', getMessages);

// Get all users who have chatted before
router.get('/users', getMessageByUsers);

module.exports = router;
