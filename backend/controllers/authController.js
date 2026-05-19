const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const db = require('../config/db');

const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields required.' });

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const allowedRoles = ['student', 'teacher', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    await db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashed, userRole]
    );
    res.status(201).json({ message: 'Account created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required.' });

    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!users.length) return res.status(401).json({ message: 'Invalid credentials.' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, profile_picture: user.profile_picture }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ message: 'Email not found.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [code, expires, email]);

    // Try to send email, if fails still return code in dev mode
    try {
      await getTransporter().sendMail({
        from: `"Tr Dave System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Code',
        html: `<div style="font-family:Arial;padding:20px;background:#f4f4f4">
          <h2 style="color:#4F46E5">Tr Dave System</h2>
          <p>Your password reset code is:</p>
          <h1 style="color:#4F46E5;letter-spacing:8px">${code}</h1>
          <p>This code expires in 15 minutes.</p>
        </div>`
      });
      res.json({ message: 'Reset code sent to your email.' });
    } catch (emailErr) {
      // Email failed - return code directly for development
      console.log(`[DEV] Reset code for ${email}: ${code}`);
      res.json({ message: 'Reset code sent to your email.', dev_code: code });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [email, code]
    );
    if (!users.length) return res.status(400).json({ message: 'Invalid or expired code.' });
    res.json({ message: 'Code verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [email, code]
    );
    if (!users.length) return res.status(400).json({ message: 'Invalid or expired code.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?', [hashed, email]);
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, full_name, email, role, profile_picture, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, forgotPassword, verifyResetCode, resetPassword, getProfile };
