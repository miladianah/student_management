const db = require('../config/db');

// ... existing methods ...

const getClasses = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count
      FROM classes c
      WHERE c.teacher_id = ?
      ORDER BY c.created_at DESC
    `, [req.user.id]);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const createClass = async (req, res) => {
  try {
    const { class_name, level, description } = req.body;
    if (!class_name || !level) {
      return res.status(400).json({ message: 'Class name and level are required.' });
    }
    await db.query(
      'INSERT INTO classes (class_name, level, description, teacher_id) VALUES (?, ?, ?, ?)',
      [class_name, level, description || null, req.user.id]
    );
    res.status(201).json({ message: 'Class created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, level, description } = req.body;
    if (!class_name || !level) {
      return res.status(400).json({ message: 'Class name and level are required.' });
    }
    const [existing] = await db.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [id, req.user.id]
    );
    if (!existing.length) {
      return res.status(404).json({ message: 'Class not found.' });
    }
    await db.query(
      'UPDATE classes SET class_name = ?, level = ?, description = ? WHERE id = ? AND teacher_id = ?',
      [class_name, level, description || null, id, req.user.id]
    );
    res.json({ message: 'Class updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [id, req.user.id]
    );
    if (!existing.length) {
      return res.status(404).json({ message: 'Class not found.' });
    }
    // Delete enrollments first (foreign key constraint)
    await db.query('DELETE FROM class_enrollments WHERE class_id = ?', [id]);
    await db.query('DELETE FROM classes WHERE id = ? AND teacher_id = ?', [id, req.user.id]);
    res.json({ message: 'Class deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await db.query(`
      SELECT u.id, u.full_name, u.email, ce.enrolled_at
      FROM class_enrollments ce
      JOIN users u ON ce.student_id = u.id
      WHERE ce.class_id = ?
      ORDER BY u.full_name
    `, [id]);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getClasses, createClass, updateClass, deleteClass, getStudents };