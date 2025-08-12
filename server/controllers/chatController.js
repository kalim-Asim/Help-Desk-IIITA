const db = require('../config/db');
const {
  saveChatMessage,
  getChatMessageByUsers,
  getChatMessagesByUserId
} = require('../models/ChatModel');

const sendMessages = async (req, res) => {
  const { userId, message, from_role } = req.body;

  if (!userId || !message || !from_role) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required.' 
    });
  }

  try {
    await saveChatMessage(userId, message, from_role);
    return res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully.' 
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    });
  }
};

const getMessages = async (req, res) => {
  const userId = req.query.user_id;
  const limit = parseInt(req.query.limit) || 20;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'user_id is required.' });
  }

  try {
    const rows = await getChatMessagesByUserId(userId, limit);
    rows.reverse(); // oldest to newest
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

const getMessageByUsers = async(req, res) => {
  try {
    const  rows = await getChatMessageByUsers();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    });
  }
};

module.exports = {
  getMessages,
  sendMessages,
  getMessageByUsers
};