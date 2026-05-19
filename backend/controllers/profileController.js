const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, role, profile_picture, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;
    await db.query('UPDATE users SET full_name=? WHERE id=?', [full_name, req.user.id]);
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    // Delete old picture if exists
    const [users] = await db.query('SELECT profile_picture FROM users WHERE id=?', [req.user.id]);
    if (users[0]?.profile_picture) {
      const oldPath = path.join(__dirname, '../uploads', users[0].profile_picture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.query('UPDATE users SET profile_picture=? WHERE id=?', [req.file.filename, req.user.id]);
    res.json({ message: 'Profile picture updated.', filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const [users] = await db.query('SELECT password FROM users WHERE id=?', [req.user.id]);
    const match = await bcrypt.compare(current_password, users[0].password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password=? WHERE id=?', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProfile, updateProfile, updateProfilePicture, changePassword };
