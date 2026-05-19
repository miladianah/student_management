const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_students }]] = await db.query("SELECT COUNT(*) as total_students FROM users WHERE role='student'");
    const [[{ total_teachers }]] = await db.query("SELECT COUNT(*) as total_teachers FROM users WHERE role='teacher'");
    const [[{ total_classes }]] = await db.query('SELECT COUNT(*) as total_classes FROM classes');
    const [[{ total_assignments }]] = await db.query('SELECT COUNT(*) as total_assignments FROM assignments');
    const [[{ total_submissions }]] = await db.query('SELECT COUNT(*) as total_submissions FROM submissions');

    res.json({ total_students, total_teachers, total_classes, total_assignments, total_submissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    query += ' ORDER BY created_at DESC';
    const [users] = await db.query(query, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)', [full_name, email, hashed, role]);
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, is_active } = req.body;
    await db.query('UPDATE users SET full_name=?, email=?, role=?, is_active=? WHERE id=?', [full_name, email, role, is_active, id]);
    res.json({ message: 'User updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, u.full_name as teacher_name,
      (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count
      FROM classes c JOIN users u ON c.teacher_id = u.id ORDER BY c.created_at DESC
    `);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getAllResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT r.*, u.full_name as student_name, c.class_name, t.full_name as teacher_name
      FROM results r
      JOIN users u ON r.student_id = u.id
      JOIN classes c ON r.class_id = c.id
      JOIN users t ON r.teacher_id = t.id
      ORDER BY r.created_at DESC
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, createUser, updateUser, deleteUser, getAllClasses, getAllResults };
