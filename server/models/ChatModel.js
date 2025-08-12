const db = require('../config/db');

const saveChatMessage = async (userId, message, fromRole) => {
  try {
    const query = 'INSERT INTO chat (user_id, message, from_role) VALUES (?, ?, ?)';
    const values = [userId, message, fromRole];

    db.promise().query(query, values); 
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error; 
  }
};

const getChatMessagesByUserId = async (userId, limit) => {
  try {
    const query = 'SELECT * FROM chat WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
    const value = [userId, limit];
    const [rows] = await db.promise().query(query, value);
    return rows;
  } catch(e) {
    console.error('Error fetching chat message:', error);
    throw error; 
  }
};

const getChatMessageByUsers = async(req, res) => {
  try {
    const query = `SELECT DISTINCT users.id, users.name, users.email
       FROM chat
       JOIN users ON chat.user_id = users.id
       ORDER BY users.name`;
    const [rows] = await db.promise().query(query);
    return rows;
  } catch(e) {
    console.error('Error fetching messages....', e);
    throw error;
  }
};

module.exports = {
  saveChatMessage,
  getChatMessagesByUserId,
  getChatMessageByUsers
}