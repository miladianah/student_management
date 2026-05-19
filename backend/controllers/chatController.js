const db = require('../config/db');

const getConversations = async (req, res) => {
  try {
    const [conversations] = await db.query(`
      SELECT DISTINCT
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
        u.full_name, u.role, u.profile_picture,
        (SELECT message FROM messages WHERE (sender_id=? AND receiver_id=other_user_id) OR (sender_id=other_user_id AND receiver_id=?) ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE sender_id=other_user_id AND receiver_id=? AND is_read=0) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY (SELECT sent_at FROM messages WHERE (sender_id=? AND receiver_id=other_user_id) OR (sender_id=other_user_id AND receiver_id=?) ORDER BY sent_at DESC LIMIT 1) DESC
    `, Array(9).fill(req.user.id));
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const [messages] = await db.query(`
      SELECT m.*, u.full_name as sender_name FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
      ORDER BY m.sent_at ASC
    `, [req.user.id, userId, userId, req.user.id]);

    await db.query('UPDATE messages SET is_read=1 WHERE sender_id=? AND receiver_id=?', [userId, req.user.id]);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.user.id, receiver_id, message]
    );
    const [newMsg] = await db.query('SELECT m.*, u.full_name as sender_name FROM messages m JOIN users u ON m.sender_id=u.id WHERE m.id=?', [result.insertId]);
    res.status(201).json(newMsg[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const editMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });
    const [msg] = await db.query('SELECT sender_id FROM messages WHERE id=?', [req.params.id]);
    if (!msg.length || msg[0].sender_id !== req.user.id)
      return res.status(403).json({ message: 'Not allowed.' });
    await db.query('UPDATE messages SET message=?, is_edited=1 WHERE id=?', [message, req.params.id]);
    res.json({ message: 'Message updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const [msg] = await db.query('SELECT sender_id FROM messages WHERE id=?', [req.params.id]);
    if (!msg.length || msg[0].sender_id !== req.user.id)
      return res.status(403).json({ message: 'Not allowed.' });
    await db.query('DELETE FROM messages WHERE id=?', [req.params.id]);
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getChatUsers = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'student') {
      query = `SELECT id, full_name, email, role FROM users WHERE role IN ('teacher', 'admin') AND is_active=1`;
    } else if (req.user.role === 'teacher') {
      query = `SELECT id, full_name, email, role FROM users WHERE role IN ('student', 'admin') AND is_active=1`;
    } else {
      query = `SELECT id, full_name, email, role FROM users WHERE id != ? AND is_active=1`;
    }
    const [users] = await db.query(query, [req.user.id]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getChatUsers, editMessage, deleteMessage };
